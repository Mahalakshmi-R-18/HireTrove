import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { getAuth } from 'firebase/auth';

const HiringHistory = () => {
  const [hiringHistory, setHiringHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user.uid);
      console.log("Current Recruiter ID:", user.uid); // Debugging log
    }
  }, []);

  // Fetch hiring history
  useEffect(() => {
    const fetchHiringHistory = async () => {
      try {
        if (currentUser) {
          const hiringsQuery = query(
            collection(firestore, 'hirings'),
            where('recruiterId', '==', currentUser),
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(hiringsQuery);
          const hiringData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            hiringData.push({ ...data, id: doc.id, createdAt: data.createdAt.toDate() });
          });

          setHiringHistory(hiringData);
          console.log("Hiring History:", hiringData); // Debugging log
        }
      } catch (err) {
        if (err.code === 'failed-precondition') {
          setError('The required index is still building. Please try again later.');
        } else {
          setError('An error occurred while fetching the hiring history.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHiringHistory();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Hiring History</h1>

      {hiringHistory.length > 0 ? (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Hiring Date</th>
              <th className="py-2 px-4 border-b">Member Name(s)</th>
              <th className="py-2 px-4 border-b">Skill Required</th>
              <th className="py-2 px-4 border-b">Number of Members</th>
            </tr>
          </thead>
          <tbody>
            {hiringHistory.map((hiring) => (
              <tr key={hiring.id} className="text-center">
                <td className="py-2 px-4 border-b">
                  {hiring.createdAt.toLocaleDateString()} {hiring.createdAt.toLocaleTimeString()}
                </td>
                <td className="py-2 px-4 border-b">{hiring.memberNames.join(', ')}</td>
                <td className="py-2 px-4 border-b">{hiring.skillsRequired}</td>
                <td className="py-2 px-4 border-b">{hiring.numberOfMembers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hiring history available.</p>
      )}
    </div>
  );
};

export default HiringHistory;
