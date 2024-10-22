import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AdminContentManagement = () => {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [memberClubs, setMemberClubs] = useState({});
  const [memberPosts, setMemberPosts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersCollection = collection(firestore, 'member');
        const membersQuery = query(membersCollection);
        const querySnapshot = await getDocs(membersQuery);
        const membersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  const fetchClubsForMember = async (memberId) => {
    try {
      const membershipDoc = await getDoc(doc(firestore, 'memberships', memberId));
      if (membershipDoc.exists()) {
        const clubsData = membershipDoc.data().clubs || {};
        setMemberClubs(prevState => ({ ...prevState, [memberId]: clubsData }));
      } else {
        console.error("No membership data found for member:", memberId);
      }
    } catch (error) {
      console.error("Error fetching clubs for member:", error);
    }
  };

  const fetchPostsForMemberAndClub = async (memberId, clubId) => {
    setLoading(true);
    try {
      const postsCollection = collection(firestore, 'posts');
      const postsQuery = query(postsCollection, where('UserUid', '==', memberId), where('clubId', '==', clubId));
      const querySnapshot = await getDocs(postsQuery);
      const postsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch comments for each post
      for (const post of postsList) {
        post.comments = await fetchCommentsForPost(post.id);
      }

      setMemberPosts(prevState => ({
        ...prevState,
        [memberId]: { ...prevState[memberId], [clubId]: postsList },
      }));
    } catch (error) {
      console.error("Error fetching posts for member and club:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      const commentsCollection = collection(firestore, 'posts', postId, 'comments');
      const commentsQuery = query(commentsCollection);
      const querySnapshot = await getDocs(commentsQuery);

      const commentsList = await Promise.all(querySnapshot.docs.map(async doc => {
        const commentData = { id: doc.id, ...doc.data() };
        commentData.replies = await fetchRepliesForComment(postId, doc.id, commentData);
        return commentData;
      }));

      return commentsList;
    } catch (error) {
      console.error("Error fetching comments for post:", error);
      return [];
    }
  };

  const fetchRepliesForComment = async (postId, commentId, commentData) => {
    try {
      const repliesCollection = collection(firestore, 'posts', postId, 'comments', commentId, 'replies');
      const repliesQuery = query(repliesCollection);
      const repliesSnapshot = await getDocs(repliesQuery);

      const repliesList = repliesSnapshot.docs.map(replyDoc => ({
        id: replyDoc.id,
        ...replyDoc.data(),
      }));

      return repliesList;
    } catch (error) {
      console.error("Error fetching replies for comment:", error);
      return [];
    }
  };

  const handleMemberClick = (memberId) => {
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
    } else {
      setSelectedMemberId(memberId);
      fetchClubsForMember(memberId);
    }
  };

  const handleClubClick = (memberId, clubId) => {
    if (selectedClubId === clubId) {
      setSelectedClubId(null);
    } else {
      setSelectedClubId(clubId);
      fetchPostsForMemberAndClub(memberId, clubId);
    }
  };

  return (
    <div className="p-10 bg-transparent min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-fuchsia-900">Content Management</h1>
      <div className="space-y-6">
        {members.map(member => (
          <div key={member.id} className="border p-5 rounded-md shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <h2
              className="text-xl font-bold cursor-pointer flex items-center justify-between"
              onClick={() => handleMemberClick(member.id)}
            >
              <span>{member.name} ({member.email})</span>
              <span className="text-fuchsia-900">
                {selectedMemberId === member.id ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>

            {selectedMemberId === member.id && (
              <div className="mt-4">
                {Object.entries(memberClubs[member.id] || {}).map(([clubId, clubName]) => (
                  <div key={clubId} className="ml-4 mb-3 border-l-2 border-fuchsia-950 pl-4">
                    <h3
                      className="text-lg font-semibold cursor-pointer flex items-center justify-between"
                      onClick={() => handleClubClick(member.id, clubId)}
                    >
                      <span>{clubName}</span>
                      <span className="text-fuchsia-900">
                        {selectedClubId === clubId ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </h3>

                    {selectedClubId === clubId && (
                      <div className="ml-4 mt-2 bg-gray-50 p-4 rounded-md shadow-md">
                        {loading ? (
                          <p className="text-gray-500">Loading posts...</p>
                        ) : (
                          memberPosts[member.id]?.[clubId]?.length > 0 ? (
                            memberPosts[member.id][clubId].map(post => (
                              <div key={post.id} className="border p-4 rounded-md mb-4 bg-white shadow-sm">
                                <h4 className="text-md font-semibold">{post.clubName}</h4>
                                <p className="text-gray-700 mb-2">{post.caption}</p>
                                {post.imageUrl && (
                                  <img
                                    src={post.imageUrl}
                                    alt={post.caption}
                                    className="w-full h-auto object-contain max-h-64 rounded-md"
                                  />
                                )}
                                <p className="text-gray-600 mt-2">Likes: {post.likes ? post.likes.length : 0}</p>

                                {/* Display comments */}
                                {post.comments && post.comments.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="font-bold text-gray-800">Comments:</h5>
                                    {post.comments.map(comment => (
                                      <div key={comment.id} className="mt-2 border-t pt-2">
                                        <p className="text-gray-600">
                                          <strong>{comment.userName}:</strong> {comment.comment}
                                        </p>
                                        {/* Display replies */}
                                        <h5 className="font-bold text-gray-800">Replies:</h5>
                                        {comment.replies && comment.replies.length > 0 && (
                                          <div className="ml-4">
                                            {comment.replies.map(reply => (
                                              <p key={reply.id} className="text-gray-500">
                                                <strong>{reply.userName}:</strong> {reply.comment}
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No posts available for this club.</p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminContentManagement;
