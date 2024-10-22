import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserProfile = ({ onClose }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        console.log('Current User:', user); // Debug log
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          console.log('User Data:', userDoc.data()); // Debug log
          setUserData(userDoc.data());
        } else {
          console.log('No such document!');
        }
      } else {
        console.log('No user is signed in.');
      }
    };
    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  // Debug log to inspect userData
  console.log('User Data for Display:', userData);

  // Determine if skills should be displayed based on user category
  const shouldDisplaySkills = userData.category === 'member';
  const skills = shouldDisplaySkills && Array.isArray(userData.skills) && userData.skills.length > 0
    ? userData.skills.join(', ') // Join skills with a space
    : 'N/A';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <table className="min-w-full bg-white">
          <tbody>
            <tr>
              <th className="text-left py-2 px-4 border-b">Name</th>
              <td className="py-2 px-4 border-b">{userData.name}</td>
            </tr>
            <tr>
              <th className="text-left py-2 px-4 border-b">Email</th>
              <td className="py-2 px-4 border-b">{userData.email}</td>
            </tr>
            <tr>
              <th className="text-left py-2 px-4 border-b">Date of Birth</th>
              <td className="py-2 px-4 border-b">{userData.dob}</td>
            </tr>
            <tr>
              <th className="text-left py-2 px-4 border-b">Category</th>
              <td className="py-2 px-4 border-b">{userData.category}</td>
            </tr>
            <tr>
              <th className="text-left py-2 px-4 border-b">Age</th>
              <td className="py-2 px-4 border-b">{userData.age}</td>
            </tr>
            {shouldDisplaySkills && (
              <tr>
                <th className="text-left py-2 px-4 border-b">Skills</th>
                <td className="py-2 px-4 border-b">{skills}</td>
              </tr>
            )}
          </tbody>
        </table>
        <button 
          onClick={onClose} 
          className="mt-4 px-4 py-2 bg-fuchsia-900 text-white rounded hover:bg-fuchsia-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
