// src/components/MemberJoinClub.js
import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  arrayRemove,
  arrayUnion, // Added here
  deleteField,
} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MemberJoinClub = () => {
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [clubs, setClubs] = useState([]);
  const [memberSkills, setMemberSkills] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState({});

  useEffect(() => {
    const fetchMemberData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMemberName(userData.name);
          setMemberEmail(userData.email);
          setMemberSkills(userData.skills || []);
          fetchClubs(userData.skills || []);
          fetchJoinedClubs(user.uid);
        }
      }
    };
    fetchMemberData();
  }, []);

  const fetchJoinedClubs = async (userId) => {
    const membershipDoc = await getDoc(doc(firestore, 'memberships', userId));
    if (membershipDoc.exists()) {
      setJoinedClubs(membershipDoc.data().clubs || {});
    }
  };

  const fetchClubs = async (skills) => {
    const clubsSnapshot = await getDocs(collection(firestore, 'clubs'));
    const clubsList = clubsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((club) => skills.includes(club.id));

    setClubs(clubsList);
  };

  const handleJoinClub = async (clubId, clubName) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to join a club.');
      return;
    }

    if (joinedClubs[clubId]) {
      toast.info(`You have already joined the club: ${clubName}`);
      return;
    }

    try {
      const clubDoc = doc(firestore, 'clubs', clubId);
      await updateDoc(clubDoc, { members: arrayUnion(user.uid) });

      const membershipDoc = doc(firestore, 'memberships', user.uid);
      await setDoc(
        membershipDoc,
        {
          name: memberName,
          uid: user.uid,
          clubs: {
            ...joinedClubs,
            [clubId]: clubName,
          },
        },
        { merge: true }
      );

      setJoinedClubs((prevState) => ({
        ...prevState,
        [clubId]: clubName,
      }));

      // Send join club email
      await sendJoinClubEmail(memberEmail, clubName);

      toast.success(`Successfully joined the club: ${clubName}`);
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('There was an error joining the club. Please try again.');
    }
  };

  const handleLeaveClub = async (clubId, clubName) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to leave a club.');
      return;
    }

    try {
      const clubDoc = doc(firestore, 'clubs', clubId);
      await updateDoc(clubDoc, {
        members: arrayRemove(user.uid),
      });

      const membershipDoc = doc(firestore, 'memberships', user.uid);
      await updateDoc(membershipDoc, {
        [`clubs.${clubId}`]: deleteField(),
      });

      setJoinedClubs((prevState) => {
        const updatedClubs = { ...prevState };
        delete updatedClubs[clubId];
        return updatedClubs;
      });

      // Send leave club email
      await sendLeaveClubEmail(memberEmail, clubName);

      toast.success(`Successfully left the club: ${clubName}`);
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error('There was an error leaving the club. Please try again.');
    }
  };

  const sendJoinClubEmail = async (email, clubName) => {
    try {
      await fetch('http://localhost:5000/sendJoinClubEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, clubName }),
      });
    } catch (error) {
      console.error('Error sending join club email:', error);
    }
  };

  const sendLeaveClubEmail = async (email, clubName) => {
    try {
      await fetch('http://localhost:5000/sendLeaveClubEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, clubName }),
      });
    } catch (error) {
      console.error('Error sending leave club email:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <main className="flex-grow p-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">Join a Club</h1>
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Clubs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="border p-4 rounded-md shadow-lg bg-fuchsia-100 relative"
                  >
                    <img
                      src={club.imageUrl}
                      alt="Club Logo"
                      className="w-full h-48 object-cover mb-4 rounded-md"
                    />
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{club.name}</h3>
                      {joinedClubs[club.id] ? (
                        <button
                          className="bg-red-600 text-white p-2 rounded-md"
                          onClick={() => handleLeaveClub(club.id, club.name)}
                        >
                          Leave Club
                        </button>
                      ) : (
                        <button
                          className="bg-green-600 text-white p-2 rounded-md"
                          onClick={() => handleJoinClub(club.id, club.name)}
                        >
                          Join Club
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MemberJoinClub;
