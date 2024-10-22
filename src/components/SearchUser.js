import React, { useState } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const SearchUser = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [availableSkills] = useState([
    'Drawing', 'Painting', 'Content Writing', 'Video Editing', 
    'Photography', 'Art and Craft', 'Poster Making'
  ]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberPosts, setSelectedMemberPosts] = useState([]);
  const [viewPosts, setViewPosts] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);

  const handleSkillSelect = (e) => {
    const skill = e.target.value;
    if (skill) {
      setSelectedSkill(skill);
    }
  };

  const fetchMembersBySkill = async () => {
    setLoading(true);
    setNoResults(false);
    setError(null);

    if (!selectedSkill) {
      setError('Please select a skill.');
      setLoading(false);
      return;
    }

    try {
      const membersQuery = query(
        collection(firestore, 'member'),
        where('skills', 'array-contains', selectedSkill) // Changed to array-contains
      );

      const querySnapshot = await getDocs(membersQuery);
      const membersData = [];
      querySnapshot.forEach((doc) => {
        const memberData = doc.data();
        if (memberData.skills && Array.isArray(memberData.skills) && memberData.skills.includes(selectedSkill)) {
          membersData.push({ ...memberData, id: doc.id });
        }
      });

      const sortedMembers = membersData.sort((a, b) => b.numPosts - a.numPosts);
      setMembers(sortedMembers);

      if (membersData.length === 0) {
        setNoResults(true);
      }
    } catch (err) {
      console.error("Error fetching members: ", err);
      setError('Failed to fetch members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPosts = async (memberId, selectedSkill) => {
    setLoading(true);
    try {
      // Query posts where the 'UserUid' matches the selected member and 'skill' matches the selected skill (clubId)
      const postsQuery = query(
        collection(firestore, 'posts'), 
        where('UserUid', '==', memberId), 
        where('clubId', '==', selectedSkill) // Filtering by the selected skill
      );
  
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setSelectedMemberPosts(postsData);
    } catch (err) {
      console.error("Error fetching posts: ", err);
    } finally {
      setLoading(false);
    }
  };
  

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setViewPosts(false);
    setViewDetails(false);
  };

  const handleViewPosts = () => {
    if (selectedMember) {
      fetchMemberPosts(selectedMember.id, selectedSkill); // Pass the selected skill as clubId
      setViewPosts(true);
      setViewDetails(false);
    } else {
      console.error("No member selected.");
    }
  };
  

  const handleViewDetails = () => {
    setViewPosts(false);
    setViewDetails(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Search Users</h1>

      <div className="mb-6">
        <label htmlFor="skills-dropdown" className="block text-lg font-medium mb-2">Select a skill:</label>
        <select 
          id="skills-dropdown" 
          className="border p-2 rounded-lg w-full"
          onChange={handleSkillSelect}
        >
          <option value="">Select a skill</option>
          {availableSkills.map((skill, index) => (
            <option key={index} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      {selectedSkill && (
        <div className="mb-6">
          <h2 className="font-bold mb-2 text-lg">Selected Skill:</h2>
          <div className="flex items-center rounded-full bg-fuchsia-50">
            <span className="bg-fuchsia-50 px-3 py-1 rounded-full text-base items-center">{selectedSkill}</span>
            <button 
              className="ml-2 text-red-600 font-bold" 
              onClick={() => setSelectedSkill(null)} // Clear the selected skill
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <button 
        className="bg-fuchsia-900 hover:bg-fuchsia-700 text-white py-2 px-4 rounded-lg"
        onClick={fetchMembersBySkill}
      >
        Find Matching Members
      </button>

      {loading && <p className="mt-4">Loading...</p>}
      {noResults && <p className="mt-4 text-red-700">No members found</p>}
      {error && <p className="mt-4 text-red-700">{error}</p>}
      
      <div className="mt-6">
        {members.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Matching Members:</h2>
            <ul>
              {members.map((member) => (
                <li 
                  key={member.id} 
                  className="border-b p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex justify-between">
                    <span>{member.name} </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {selectedMember && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-bold mb-4">{selectedMember.name}'s Profile</h2>
          <div className="flex gap-4">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              onClick={handleViewPosts}
            >
              View Posts
            </button>
            <button 
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
              onClick={handleViewDetails}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {viewPosts && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">Posts by {selectedMember.name}:</h3>
          {selectedMemberPosts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            <ul>
              {selectedMemberPosts.map((post) => (
                <li key={post.id} className="border-b p-4">
                  <div className="flex flex-col">
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt={post.caption} 
                        className="w-full h-auto mb-2 rounded" 
                      />
                    )}
                    <p className="font-semibold"><i>-- {post.caption} --</i></p>
                    <p>Likes : {post.likes ? post.likes.length : 0} </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {viewDetails && selectedMember && (
        <div className="mt-6">
          <ul>
            <li><b>Name: </b> {selectedMember.name}</li>
            <li><b>Email: </b> {selectedMember.email}</li>
            <li><b>Phone: </b> {selectedMember.phone}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchUser;
