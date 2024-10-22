import React, { useState, useEffect, useCallback } from 'react';
import { auth, firestore } from '../firebase';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash, FaComment, FaShare, FaReply, FaHeart } from 'react-icons/fa';
import ImagePostForm from './ImagePostForm'; // Ensure this path is correct

const MemberPost = () => {
  const [memberName, setMemberName] = useState('');
  const [posts, setPosts] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState({});
  const [selectedClub, setSelectedClub] = useState(null);
  const [isPostFormVisible, setIsPostFormVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [comment, setComment] = useState('');
  const [commentPostId, setCommentPostId] = useState(null);
  const [replyComment, setReplyComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);

  const fetchPosts = useCallback(async (clubIds) => {
    try {
      const postsQuery = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
      const postsSnapshot = await getDocs(postsQuery);
      const postsList = [];
      
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        if (clubIds.includes(postData.clubId) && !postData.isDeleted) {
          const post = { id: postDoc.id, ...postData };

          // Fetch comments
          const commentsQuery = query(collection(firestore, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsList = commentsSnapshot.docs.map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }));

          // Fetch replies for each comment
          for (const comment of commentsList) {
            const repliesQuery = query(collection(firestore, 'posts', post.id, 'comments', comment.id, 'replies'), orderBy('createdAt', 'asc'));
            const repliesSnapshot = await getDocs(repliesQuery);
            comment.replies = repliesSnapshot.docs.map(replyDoc => ({ id: replyDoc.id, ...replyDoc.data() }));
          }

          post.comments = commentsList;
          postsList.push(post);
        }
      }

      setPosts(postsList);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error('Error fetching posts. Please try again.');
    }
  }, []);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        setCurrentUserId(user.uid);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMemberName(`${userData.name} (${userData.email})`);
          fetchJoinedClubs(user.uid);
        } else {
          console.error("User not found in Firestore.");
          toast.error('User not found in Firestore.');
        }
      } else {
        console.error("User not authenticated.");
        toast.error('User not authenticated.');
      }
    };

    const fetchJoinedClubs = async (userId) => {
      const membershipDoc = await getDoc(doc(firestore, 'memberships', userId));
      if (membershipDoc.exists()) {
        const clubs = membershipDoc.data().clubs || {};
        const updatedClubs = {};
        for (const [clubId, clubName] of Object.entries(clubs)) {
          const clubDoc = await getDoc(doc(firestore, 'clubs', clubId));
          if (clubDoc.exists()) {
            const clubData = clubDoc.data();
            updatedClubs[clubId] = { ...clubData, name: clubName };
          }
        }
        setJoinedClubs(updatedClubs);
        fetchPosts(Object.keys(updatedClubs));
      }
    };

    fetchMemberData();
  }, [fetchPosts]);

  const handlePostSuccess = () => {
    const clubIds = Object.keys(joinedClubs);
    fetchPosts(clubIds);
  };

  const deleteImageFromStorage = async (imageUrl) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageUrl); // Get the reference to the image
  
      await deleteObject(imageRef); // Delete the image from storage
      console.log('Image deleted successfully from storage.');
    } catch (error) {
      console.error("Error deleting image from storage:", error);
      toast.error('Error deleting image from storage. Please try again.');
    }
  };
  
  const handleDeletePost = async (postId, postOwnerId) => {
    if (postOwnerId === currentUserId) {
      try {
        // Fetch all comments for the post
        const commentsQuery = query(collection(firestore, 'posts', postId, 'comments'));
        const commentsSnapshot = await getDocs(commentsQuery);
  
        // Delete all replies for each comment
        for (const commentDoc of commentsSnapshot.docs) {
          const commentId = commentDoc.id;
          const repliesQuery = query(collection(firestore, 'posts', postId, 'comments', commentId, 'replies'));
          const repliesSnapshot = await getDocs(repliesQuery);
  
          for (const replyDoc of repliesSnapshot.docs) {
            await deleteDoc(doc(firestore, 'posts', postId, 'comments', commentId, 'replies', replyDoc.id));
          }
  
          // Delete the comment itself
          await deleteDoc(doc(firestore, 'posts', postId, 'comments', commentId));
        }
  
        // Fetch the post data to check for the image URL
        const postDoc = await getDoc(doc(firestore, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          if (postData.imageUrl) {
            await deleteImageFromStorage(postData.imageUrl);  // Call the function to delete the image
          }
        }

        // Delete the post document
        await deleteDoc(doc(firestore, 'posts', postId));
  
        toast.success('Post and all associated data deleted successfully.');
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error('Error deleting post. Please try again.');
      }
    } else {
      toast.error('You are not authorized to delete this post.');
    }
  };
  

  const handleLikePost = async (postId) => {
    try {
      const postDoc = doc(firestore, 'posts', postId);
      const postSnapshot = await getDoc(postDoc);
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const updatedLikes = postData.likes || [];
        if (!updatedLikes.includes(currentUserId)) {
          updatedLikes.push(currentUserId);
          await updateDoc(postDoc, { likes: updatedLikes });
          toast.success('Post liked.');
        } else {
          toast.info('You have already liked this post.');
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error('Error liking post. Please try again.');
    }
  };

  const handleCommentPost = async (postId) => {
    if (!comment) {
      toast.error('Comment cannot be empty.');
      return;
    }
    try {
      const postDoc = doc(firestore, 'posts', postId);
      const postSnapshot = await getDoc(postDoc);
      const postData = postSnapshot.data();
  
      if (postData.commentsEnabled) {
        const commentsCollection = collection(firestore, 'posts', postId, 'comments');
        await addDoc(commentsCollection, {
          userId: currentUserId,
          userName: memberName.split(' (')[0], // Extract name without email
          comment,
          createdAt: Timestamp.now(),
        });
        toast.success('Comment added.');
        setComment('');
        setCommentPostId(null);
        fetchPosts(Object.keys(joinedClubs));  // <-- Call fetchPosts to update the view after the comment is added
      } else {
        toast.error('Comments are disabled by the owner.');
      }
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error('Error commenting on post. Please try again.');
    }
};
  
const handleReplyToComment = async (postId, commentId) => {
  if (!replyComment) {
    toast.error('Reply cannot be empty.');
    return;
  }
  try {
    const repliesCollection = collection(firestore, 'posts', postId, 'comments', commentId, 'replies');
    await addDoc(repliesCollection, {
      userId: currentUserId,
      userName: memberName.split(' (')[0], // Extract name without email
      comment: replyComment,
      createdAt: Timestamp.now(),
    });
    toast.success('Reply added.');
    setReplyComment('');
    setReplyToCommentId(null);
    fetchPosts(Object.keys(joinedClubs));  // <-- Refetch posts after adding a reply
  } 
  catch (error) {
    console.error("Error replying to comment:", error);
    toast.error('Error replying to comment. Please try again.');
  }
};

  const handleSharePost = async (postId) => {
    try {
      const postDoc = doc(firestore, 'posts', postId);
      const postSnapshot = await getDoc(postDoc);
      if (postSnapshot.exists()) {
        const shareableLink = `https://hiretroveproject.com/posts/${postId}`;
        navigator.clipboard.writeText(shareableLink);
        toast.success('Post link copied to clipboard.');
      }
    } 
    catch (error) {
      console.error("Error sharing post:", error);
      toast.error('Error sharing post. Please try again.');
    }
  };

  const togglePostForm = (clubId, clubName) => {
    setSelectedClub({ id: clubId, name: clubName });
    setIsPostFormVisible(prev => !prev);
  };

  const handleCommentInputChange = (event) => {
    setComment(event.target.value);
  };

  const handleReplyInputChange = (event) => {
    setReplyComment(event.target.value);
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const repliesQuery = query(collection(firestore, 'posts', postId, 'comments', commentId, 'replies'));
      const repliesSnapshot = await getDocs(repliesQuery);
      for (const replyDoc of repliesSnapshot.docs) {
        await deleteDoc(doc(firestore, 'posts', postId, 'comments', commentId, 'replies', replyDoc.id));
      }
  
      await deleteDoc(doc(firestore, 'posts', postId, 'comments', commentId));
      toast.success('Comment deleted successfully.');
      fetchPosts(Object.keys(joinedClubs));  // <-- Call fetchPosts to update the list after deletion
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error('Error deleting comment. Please try again.');
    }
};

  const handleDeleteReply = async (postId, commentId, replyId) => {
    try {
      await deleteDoc(doc(firestore, 'posts', postId, 'comments', commentId, 'replies', replyId));
      toast.success('Reply deleted successfully.');
      fetchPosts(Object.keys(joinedClubs));
    } 
    catch (error) {
      console.error("Error deleting reply:", error);
      toast.error('Error deleting reply. Please try again.');
    }
  };  

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <main className="flex-grow p-4 relative">
          <h1 className="text-2xl font-bold flex items-center justify-between">Welcome {memberName} !!</h1>
          <ImagePostForm
            memberName={memberName}
            clubId={selectedClub?.id}
            clubName={selectedClub?.name}
            onPostSuccess={handlePostSuccess}
            isPostFormVisible={isPostFormVisible}
            onClose={() => setIsPostFormVisible(false)}
          />
          <div className="mt-4">
            {Object.entries(joinedClubs).map(([clubId, clubData]) => (
              <div key={clubId} className="relative border p-4 rounded-md mb-4 shadow-md">
                <h2 className="text-xl font-semibold">{clubData.name}</h2>
                  {clubData.imageUrl && (
                    <img
                      src={clubData.imageUrl}
                      alt={clubData.name}
                      className="w-12 h-12 rounded-full ml-4 object-cover"
                    />
                  )}
                <button
                  className="absolute top-4 right-4 bg-fuchsia-900 text-white p-2 rounded-md"
                  onClick={() => togglePostForm(clubId, clubData.name)}>
                  Add Post
                </button>
                {posts.filter(post => post.clubId === clubId).map(post => (
                <div key={post.id} className="border-t pt-2 mt-2">
                  <div className="flex mb-2">
                    <span className="font-bold justify-between items-center mb-2">{post.userName}</span>
                    {post.userId === currentUserId && (
                      <button
                        className="text-red-600 ml-auto"
                        onClick={() => handleDeletePost(post.id, post.userId)}>
                        <FaTrash /> Delete Post
                      </button>
                    )}
                  </div>
                  <p>{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full mt-2 h-auto object-contain mb-4 rounded-md max-h-96"
                    />
                  )}
                  <center><i><b>-- {post.caption} --</b></i></center><br></br>
                  
                  <div className="flex space-x-72 mt-2 text-zinc-950">
                    <button onClick={() => handleLikePost(post.id)}>
                      <FaHeart className="text-red-500" /> {post.likes?.length || 0} Likes
                    </button>
                    <button onClick={() => setCommentPostId(post.id)}>
                      <FaComment className="text-blue-500"/> {post.comments?.length || 0} Comments
                    </button>
                    <button onClick={() => handleSharePost(post.id)}>
                      <FaShare className="text-green-500"/> Share
                    </button>
                  </div>
                  {commentPostId === post.id && (
                    <div className="mt-2">
                      <textarea
                        value={comment}
                        onChange={handleCommentInputChange}
                        placeholder="Write a comment..."
                        className="w-full border p-2 rounded-md"
                      />
                      <button
                        onClick={() => handleCommentPost(post.id)}
                        className="bg-fuchsia-900 text-white p-2 rounded-md mt-2"
                      >
                        Comment
                      </button>
                      {post.comments.map(comment => (
                        <div key={comment.id} className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{comment.userName}</span>
                            {(comment.userId === currentUserId ||  comment.userId === post.userId ) && (
                              <button
                                className="text-red-600 ml-auto"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                              >
                                <FaTrash /> Delete Comment
                              </button>
                            )}
                          </div>
                          <p>{comment.comment}</p>
                          <div className="mt-2">
                            <textarea
                              value={replyComment}
                              onChange={handleReplyInputChange}
                              placeholder="Write a reply..."
                              className="w-full border p-2 rounded-md"
                            />
                            <button
                              onClick={() => handleReplyToComment(post.id, comment.id)}
                              className="bg-fuchsia-900 text-white p-2 rounded-md mt-2"
                            >
                              <FaReply />Reply
                            </button>
                            {comment.replies && comment.replies.map(reply => (
                              <div key={reply.id} className="border-t pt-2 mt-2 ml-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold">{reply.userName}</span>
                                  {(reply.userId === currentUserId  || reply.userId === post.userId ) && (
                                    <button
                                      className="text-red-600 ml-auto"
                                      onClick={() => handleDeleteReply(post.id, comment.id, reply.id)}
                                    >
                                      <FaTrash /> Delete Reply
                                    </button>
                                  )}
                                </div>
                                <p>{reply.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              </div>
            ))}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MemberPost;