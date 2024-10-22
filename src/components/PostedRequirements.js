import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase';

const PostedRequirements = () => {
  const [postedRequirements, setPostedRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posted requirements
  useEffect(() => {
    const fetchPostedRequirements = async () => {
      try {
        const requirementsQuery = query(
          collection(firestore, 'hirings'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(requirementsQuery);
        const requirementsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requirementsData.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
          });
        });

        setPostedRequirements(requirementsData);
      } catch (err) {
        if (err.code === 'failed-precondition') {
          setError('The required index is still building. Please try again later.');
        } else {
          setError('An error occurred while fetching the posted requirements.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostedRequirements();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Posted Requirements</h1>

      {postedRequirements.length > 0 ? (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Hiring Date</th>
              <th className="py-2 px-4 border-b">Recruiter Name</th>
              <th className="py-2 px-4 border-b">Member Name(s)</th>
              <th className="py-2 px-4 border-b">Skill Required</th>
              <th className="py-2 px-4 border-b">Number of Members</th>
            </tr>
          </thead>
          <tbody>
            {postedRequirements.map((requirement) => (
              <tr key={requirement.id} className="text-center">
                <td className="py-2 px-4 border-b">
                  {requirement.createdAt.toLocaleDateString()} {requirement.createdAt.toLocaleTimeString()}
                </td>
                <td className="py-2 px-4 border-b">{requirement.recruiterName}</td>
                <td className="py-2 px-4 border-b">{requirement.memberNames.join(', ')}</td>
                <td className="py-2 px-4 border-b">{requirement.skillsRequired || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{requirement.numberOfMembers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No posted requirements available.</p>
      )}
    </div>
  );
};

export default PostedRequirements;
