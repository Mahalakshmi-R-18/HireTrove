import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { collection, addDoc, getDocs, query, where, setDoc , orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecruiterPosting = () => {
  const [selectedSkill, setSelectedSkill] = useState("");
  const [availableSkills] = useState(['Drawing', 'Painting', 'Content Writing', 'Video Editing', 'Photography', 'Art and Craft', 'Poster Making']);
  const [members, setMembers] = useState([]);
  const [numMembersRequired, setNumMembersRequired] = useState(1);
  const [postedRequirements, setPostedRequirements] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null); // To track selected requirement

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user.uid);
      console.log("Current User ID:", user.uid); // Debugging log
    }
  }, []);

  const handleSkillSelect = (e) => {
    const selectedSkill = e.target.value;
    
    if (availableSkills.includes(selectedSkill)) {
      setSelectedSkill(selectedSkill);
    } else {
      setSelectedSkill("");
      toast.error("Invalid skill selection. Please select a valid skill from the list.");
    }
  };
  
  const fetchMembersBySkill = async () => {
    setSearchTriggered(true);
    if (selectedSkill) {
      try {
        const membersQuery = query(
          collection(firestore, 'member'),
          where('skills', 'array-contains', selectedSkill)
        );
  
        const querySnapshot = await getDocs(membersQuery);
        const membersData = [];
        querySnapshot.forEach((doc) => {
          membersData.push({ ...doc.data(), id: doc.id });
        });
  
        const hiredMembersQuery = query(
          collection(firestore, 'hirings'),
          where('recruiterId', '==', currentUser)
        );
  
        const hiredMembersSnapshot = await getDocs(hiredMembersQuery);
        const hiredMemberIds = hiredMembersSnapshot.docs.map(doc => doc.data().memberNames).flat();
  
        const filteredMembers = membersData.filter(member => !hiredMemberIds.includes(member.name));
  
        const sortedMembers = filteredMembers.sort((a, b) => b.numPosts - a.numPosts);
  
        if (sortedMembers.length < numMembersRequired) {
          const message = `We have only ${sortedMembers.length} member(s) available for the skill ${selectedSkill}.`;
          toast.info(message);
        }
  
        setMembers(sortedMembers);
        console.log("Fetched Members:", sortedMembers); // Debugging log
      } catch (error) {
        console.error("Error fetching members by skill:", error);
        toast.error("Failed to fetch members. Please try again.");
      }
    }
  };
  

  const handlePostRequirement = async () => {
    if (selectedSkill && numMembersRequired > 0) {
      try {
        const recruiterDocRef = doc(firestore, 'recruiter', currentUser);
        const recruiterDoc = await getDoc(recruiterDocRef);
  
        if (!recruiterDoc.exists()) {
          console.error("Recruiter document not found!");
          toast.error("Recruiter information not found!");
          return;
        }
  
        const recruiterName = recruiterDoc.data().name; // Get the recruiter name
  
        // Check if the current recruiter already posted this requirement
        const existingRequirementQuery = query(
          collection(firestore, 'requirements'),
          where('recruiterId', '==', currentUser),
          where('skill', '==', selectedSkill)
        );
  
        const existingRequirementSnapshot = await getDocs(existingRequirementQuery);
  
        if (!existingRequirementSnapshot.empty) {
          // If a requirement with the same skill already exists for the current recruiter, update it
          const existingRequirementDoc = existingRequirementSnapshot.docs[0];
          const existingRequirementId = existingRequirementDoc.id;
  
          // Update the requirement with the new number of members
          const updatedRequirement = {
            skill: selectedSkill,
            numMembersRequired: numMembersRequired,
            recruiterId: currentUser,
            recruiterName: recruiterName,
            createdAt: new Date(),
          };
  
          await setDoc(doc(firestore, 'requirements', existingRequirementId), updatedRequirement);
          setPostedRequirements((prev) => prev.map((req) => 
            req.id === existingRequirementId ? { ...updatedRequirement, id: existingRequirementId } : req
          ));
          toast.success("Requirement updated successfully.");
  
        } else {
          // If no existing requirement, create a new one
          const newRequirement = {
            skill: selectedSkill,
            numMembersRequired: numMembersRequired,
            recruiterId: currentUser,
            recruiterName: recruiterName,
            createdAt: new Date(),
          };
  
          const docRef = await addDoc(collection(firestore, 'requirements'), newRequirement);
          setPostedRequirements((prev) => [...prev, { ...newRequirement, id: docRef.id }]);
          toast.success("New requirement posted successfully.");
        }
  
        setNumMembersRequired(1);
        fetchMembersBySkill(); // Trigger search after posting a new requirement
      } catch (error) {
        console.error("Error posting requirement:", error);
        toast.error("Failed to post the requirement. Please try again.");
      }
    } else {
      alert("Please select a skill and specify the number of members required.");
    }
  };
  
  
  const handleDeleteRequirement = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'requirements', id));
      setPostedRequirements((prev) => prev.filter((req) => req.id !== id));
      alert("Requirement deleted successfully.");
    } catch (error) {
      console.error("Error deleting requirement:", error);
    }
  };

  const fetchRequirements = async () => {
    const requirementsQuery = query(collection(firestore, 'requirements'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(requirementsQuery);
    const requirementsData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requirementsData.push({ ...data, id: doc.id, createdAt: data.createdAt.toDate() });
    });
    setPostedRequirements(requirementsData);
  };

  const handleMemberClick = async (memberId) => {
    try {
      const memberDoc = doc(firestore, 'member', memberId);
      const memberSnapshot = await getDoc(memberDoc);

      if (memberSnapshot.exists()) {
        setSelectedMember({ id: memberId, ...memberSnapshot.data() });
        console.log("Selected Member:", memberSnapshot.data()); // Debugging log
      } else {
        console.error("No such member found!");
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  const handleHireMember = async (memberId) => {
    if (!selectedMember || !selectedSkill) {
      toast.error("Please select a skill and member before hiring.");
      return;
    }
  
    try {
      const recruiterDocRef = doc(firestore, 'recruiter', currentUser);
      const recruiterDoc = await getDoc(recruiterDocRef);
  
      if (!recruiterDoc.exists()) {
        console.error("Recruiter document not found!");
        toast.error("Recruiter information not found!");
        return;
      }
  
      const recruiterName = recruiterDoc.data().name;
      const hiringData = {
        recruiterId: currentUser,
        recruiterName: recruiterName,
        numberOfMembers: 1,
        memberNames: [selectedMember.name],
        skillsRequired: selectedSkill,
        createdAt: new Date(),
      };
  
      await addDoc(collection(firestore, 'hirings'), hiringData);
      toast.success(`Member ${selectedMember.name} hired successfully.`);
      console.log("Hired Member Data:", hiringData);
  
      // Sending email notification to hired member
      try {
        const response = await fetch('http://localhost:5000/sendHireNotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: selectedMember.email,
            recruiterName: recruiterName,
            skill: selectedSkill,
          }),
        });
  
        const result = await response.json();
        if (result.success) {
          toast.success(`Email notification sent to ${selectedMember.name}.`);
        } else {
          toast.error('Error sending email notification.');
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
        toast.error('There was an error sending the email notification.');
      }
  
      // Refresh members after hiring
      fetchMembersBySkill();
    } catch (error) {
      console.error("Error hiring member:", error);
      toast.error("Error hiring member, please try again.");
    }
  };
  
  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleRequirementClick = (requirement) => {
    // Set selected skill and number of members
    setSelectedSkill(requirement.skill);
    setNumMembersRequired(requirement.numMembersRequired);
    
    // Fetch members again with the selected skill and number of members
    fetchMembersBySkill();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8"> Requirements Posting</h1>

      <div className="mb-6">
        <label htmlFor="skills-dropdown" className="block text-lg font-medium mb-2">Select a skill:</label>
        <select 
          id="skills-dropdown" 
          className="border p-2 rounded-lg w-full"
          value={selectedSkill}
          onChange={handleSkillSelect}
        >
          <option value="">Select a skill</option>
          {availableSkills.map((skill, index) => (
            <option key={index} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="num-members" className="block text-lg font-medium mb-2">Number of members required:</label>
        <input 
          type="number" 
          id="num-members" 
          className="border p-2 rounded-lg w-full" 
          value={numMembersRequired} 
          onChange={(e) => setNumMembersRequired(Number(e.target.value))}
          min="1"
        />
      </div>

      <button 
        className="bg-fuchsia-900 hover:bg-fuchsia-700 text-white py-2 px-4 rounded-lg"
        onClick={handlePostRequirement}>
        Post Requirement
      </button>

      {members.length > 0 && searchTriggered && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Available Members:</h2>
          <ul>
            {members.map((member) => (
              <li 
                key={member.id} 
                className="border-b p-4 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => handleMemberClick(member.id)}
              >
                <p>{member.name}</p>
                {selectedMember && selectedMember.id === member.id && (
                  <div className="mt-2 pl-4">
                    <p><strong>Email:</strong> {selectedMember.email}</p>
                    <p><strong>Contact:</strong> {selectedMember.phone}</p>
                    <button 
                      className="bg-fuchsia-900 hover:bg-fuchsia-700 text-white py-1 px-2 rounded-lg mt-2"
                      onClick={() => handleHireMember(member.id)}>
                      Hire Member
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {postedRequirements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Posted Requirements:</h2>
          <ul>
          {postedRequirements.map((requirement) => (
  <li 
    key={requirement.id} 
    className="flex justify-between items-center border-b p-4 hover:bg-gray-100 transition cursor-pointer"
    onClick={() => handleRequirementClick(requirement)} // Trigger search when a card is clicked
  >
    <div>
      <p><strong>Skill:</strong> {requirement.skill}</p>
      <p><strong>Members Required:</strong> {requirement.numMembersRequired}</p>
      <p><strong>Posted by Recruiter ID:</strong> {requirement.recruiterId}</p>
      <p><strong>Posted by Recruiter Name:</strong> {requirement.recruiterName}</p>
      <p><strong>Posted on:</strong> {requirement.createdAt.toLocaleDateString()}</p>
    </div>
    <div className="flex items-center">
      <button 
        className="ml-4 bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded-lg"
        onClick={() => handleDeleteRequirement(requirement.id)}
      >
        Delete
      </button>
    </div>
  </li>
))}

          </ul>
        </div>
      )}
    </div>
  );
};

export default RecruiterPosting;
