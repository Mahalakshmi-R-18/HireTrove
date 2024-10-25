import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { firestore, storage, auth } from '../firebase';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

const ImagePostForm = ({ clubId, clubName, members, onPostSuccess, isPostFormVisible, onClose }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    const fetchMemberData = async (user) => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMemberName(`${userData.name} (${userData.email})`);
        } else {
          toast.error('User not found in Firestore.');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        //toast.error('Failed to fetch user data.');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchMemberData(user);
      } else {
        toast.error('User not authenticated.');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setImage(file);
    } else {
      toast.error('Image file must be less than 10MB.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('Please select an image.');
      return;
    }
    
    if (!caption.trim()) { // Ensure caption is not empty
      toast.error('Caption cannot be empty.');
      return;
    }

    setLoading(true); // Set loading state

    try {
      const imageUrl = await uploadImage(image);
      const postData = {
        caption,
        imageUrl,
        commentsEnabled,
        userName: memberName,
        UserUid: currentUserId,
        clubId,
        createdAt: new Date(),
        likes: [],
        comments: [],
      };

      await addDoc(collection(firestore, 'posts'), postData);
      toast.success('Post created successfully.');
      await notifyMembersAboutNewPost( memberName, clubName, members);

      onPostSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const notifyMembersAboutNewPost = async (userName, clubName, members) => {
    try {
      console.log("Notifying members:", members); // Log members to check the data
  
      const response = await fetch('http://localhost:5000/sendNewPostNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, clubName, members }),
      });
  
      const result = await response.json();
      console.log('Notification response:', result); // Log full response for debugging
  
      if (!response.ok) {
        throw new Error(result.message || 'Unknown error occurred while sending notifications.');
      }
  
      console.log('Notification sent successfully.');
    } catch (error) {
      console.error('Error sending post notification:', error.message || error);
      toast.error('Failed to notify members about the new post.');
    }
  };
  
  
  const uploadImage = async (image) => {
    const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  return isPostFormVisible ? (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <form className="bg-white p-4 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Create Post for {clubName}</h2>
        <label className="block mb-3">
          <span className="block mb-1 font-semibold">Image:</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="block w-full p-2 border border-gray-300 rounded"
            required 
          />
        </label>
        <label className="block mb-3">
          <span className="block mb-1 font-semibold">Caption:</span>
          <textarea 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
          />
        </label>
        <label className="block mb-4 items-center">
          <input 
            type="checkbox"
            checked={commentsEnabled}
            onChange={(e) => setCommentsEnabled(e.target.checked)}
            className="mr-2"
          />
          <span className="font-semibold">Enable Comments</span>
        </label>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className={`bg-fuchsia-900 text-white p-2 rounded-md mr-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
          <button 
            type="button"
            className="p-2 bg-gray-500 text-white rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  ) : null;
};

export default ImagePostForm;
