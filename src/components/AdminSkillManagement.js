import React, { useState, useEffect } from 'react';
import { auth, firestore, storage } from '../firebase';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash } from 'react-icons/fa';

const AdminSkillManagement = () => {
  const [adminName, setAdminName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubImage, setClubImage] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [availableClubNames, setAvailableClubNames] = useState([
    "Drawing", "Painting", "Content Writing", "Video Editing", "Photography", "Art and Craft", "Poster Making"
  ]); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteClubId, setDeleteClubId] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setAdminName(userDoc.data().name);
        }
        fetchClubs();
      }
    };
    fetchAdminData();
  }, []);

  const fetchClubs = async () => {
    const clubsSnapshot = await getDocs(collection(firestore, 'clubs'));
    const clubsList = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClubs(clubsList);
  };

  const updateAvailableClubs = (clubName, action) => {
    if (action === 'add') {
      setAvailableClubNames(prev => [...prev, clubName]);
    } else if (action === 'remove') {
      setAvailableClubNames(prev => prev.filter(name => name !== clubName));
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDeleteClub = async (e) => {
    e.preventDefault();
  
    try {
      const club = clubs.find(c => c.id === deleteClubId);
      if (!club) {
        alert('Club not found.');
        return;
      }
  
      const clubDoc = doc(firestore, 'clubs', club.id);
      const clubSnapshot = await getDoc(clubDoc);
  
      if (!clubSnapshot.exists()) {
        alert('Club not found in database.');
        return;
      }
  
      const clubData = clubSnapshot.data();
      const imageUrl = clubData.imageUrl;
  
      // Delete image if present and not the default logo
      if (imageUrl && imageUrl !== '/logo192.png') {
        const imagePath = decodeURIComponent(
          imageUrl.split('/o/')[1].split('?')[0].replace(/%2F/g, '/')
        );
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      }
  
      // Delete the club document
      await deleteDoc(clubDoc);
      updateAvailableClubs(club.name, 'add');
      fetchClubs();
      toast.success('Club deleted successfully!');

      // Send delete club email notification to relevant users
      const membersSnapshot = await getDocs(collection(firestore, 'users'));
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const matchedMembers = members.filter(member => member.skills && member.skills.includes(club.name));
  
      await sendDeleteClubEmail(club.name, matchedMembers);
  
    } catch (error) {
      toast.error(`Error deleting club: ${error.message}`);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const sendDeleteClubEmail = async (clubName, matchedMembers) => {
    try {
      const response = await fetch('http://localhost:5000/sendDeleteClubEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubName,
          members: matchedMembers.map(member => member.email),
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Club deleted and emails sent to relevant members.');
      } else {
        alert('Club deleted, but there was an issue sending email notifications.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('There was an error sending email notifications.');
    }
  };

  const handleShowDeleteConfirm = (clubId) => {
    setDeleteClubId(clubId);
    setShowDeleteConfirm(true);
  };

  const handleAddClub = async () => {
    try {
      if (!clubName) {
        toast.error('Please select a club name');
        return;
      }
  
      // Handle image upload
      let imageUrl = '/logo192.png'; // default image
      if (clubImage) {
        const imageRef = ref(storage, `clubs/${clubImage.name}`);
        await uploadBytes(imageRef, clubImage);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const newClub = {
        name: clubName,
        imageUrl,
      };
  
      // Create the new club in Firestore
      await setDoc(doc(firestore, 'clubs', clubName), newClub);
      toast.success('Club created successfully!');
  
      // Update available clubs and fetch clubs again
      updateAvailableClubs(clubName, 'remove');
      fetchClubs();
      setShowForm(false);
  
      // Send club creation email notification to relevant users
      const membersSnapshot = await getDocs(collection(firestore, 'users'));
      const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Assuming you want to notify members based on skills similar to deletion
      const matchedMembers = members.filter(member => member.skills && member.skills.includes(clubName));
  
      await sendAddClubEmail(clubName, matchedMembers);
  
    } catch (error) {
      toast.error(`Error creating club: ${error.message}`);
    }
  };
  
  // New function to handle sending email notifications
  const sendAddClubEmail = async (clubName, matchedMembers) => {
    try {
        const response = await fetch('http://localhost:5000/sendAddClubEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clubName,
                members: matchedMembers.map(member => member.email),
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Club created and emails sent to relevant members.');
        } else {
            alert('Club created, but there was an issue sending email notifications.');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        alert('There was an error sending email notifications.');
    }
};

  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <main className="flex-grow p-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">Club Management</h1>
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Available Clubs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clubs.map(club => (
                  <div
                    key={club.id}
                    className="border p-4 rounded-md shadow-lg bg-fuchsia-100 relative"
                  >
                    <div className="absolute top-2 right-2">
                      <button
                        className="p-2 rounded-full bg-fuchsia-100 hover:bg-fuchsia-500"
                        onClick={() => handleShowDeleteConfirm(club.id)}
                      >
                        <FaTrash className="text-xl text-red-600 hover:text-red-800" />
                      </button>
                    </div>
                    <img src={club.imageUrl} alt="Club Logo" className="w-full h-48 object-cover mb-4 rounded-md" />
                    <h3 className="text-lg font-semibold mb-2">{club.name}</h3>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="fixed bottom-10 right-5 bg-fuchsia-800 text-white p-4 rounded-full shadow-lg"
              onClick={() => setShowForm(true)}>
              Add Club
            </button>
            {showForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md shadow-md">
                  <h2 className="text-xl font-bold mb-4">Create Club</h2>
                  <label className="block mb-2">
                    Club Name
                    <select
                      className="border p-2 w-full"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                    >
                      <option value="">Select a club</option>
                      {availableClubNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block mb-2">
                    Club Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setClubImage(e.target.files[0])}
                      className="border p-2 w-full"
                    />
                  </label>
                  <button
                    onClick={handleAddClub}
                    className="bg-fuchsia-800 text-white p-2 rounded-md"
                  >
                    Create Club
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="ml-2 border p-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md shadow-md">
                  <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                  <p>Are you sure you want to delete this club?</p>
                  <button
                    onClick={handleDeleteClub}
                    className="bg-red-600 text-white p-2 rounded-md mr-2"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border p-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminSkillManagement;
