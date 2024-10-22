import React, { useState } from 'react';
import joinClubImg from '../images/club.jpg'; 
import updateSkillsImg from '../images/skills.jpg';
import contentManagementImg from '../images/contentManagement.jpg';
import JoinClub from './MemberJoinClub';
import PostManagement from './MemberPost';
import UpdateSkills from './MemberUpdateSkills';

const MemberDashboardWelcome = () => {
  const [selectedPage, setSelectedPage] = useState('');

  // Handle navigation based on the button click
  const handlePageSelect = (page) => {
    setSelectedPage(page);
  };

  // Render content based on selected page
  const renderPageContent = () => {
    switch (selectedPage) {
      case 'join-club':
        return <JoinClub />;
      case 'content-management':
        return <PostManagement />;
      case 'update-skills':
        return <UpdateSkills />;
      default:
        return renderWelcomePage(); // Default welcome page
    }
  };

  // Function to render the welcome page content
  const renderWelcomePage = () => (
    <div className="flex flex-col min-h-screen justify-center items-center text-center">
      {/* Hero Section */}
      <div className="bg-opacity-60 bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Member Dashboard!</h1>
        <p className="text-lg mb-6">
          Manage your clubs, update skills, and engage with the community. Let's get started!
        </p>
        <button
          onClick={() => handlePageSelect('join-club')}
          className="px-6 py-3 bg-fuchsia-700 text-white rounded-full hover:bg-fuchsia-900 transition duration-300">
          Join a Club
        </button>
      </div>

      {/* Card Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Join Club Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">
          <img src={joinClubImg} alt="Join a Club" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Join a Club</h2>
            <p className="text-gray-700 mb-4">Explore clubs and join the ones that suit your interests.</p>
            <button
              onClick={() => handlePageSelect('join-club')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
              Explore Clubs
            </button>
          </div>
        </div>

        {/* Update Skills Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">
          <img src={updateSkillsImg} alt="Update Skills" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Update Your Skills</h2>
            <p className="text-gray-700 mb-4">Keep your skills up-to-date by adding new expertise and knowledge.</p>
            <button
              onClick={() => handlePageSelect('update-skills')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
              Update Skills
            </button>
          </div>
        </div>

        {/* Content Management Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">
          <img src={contentManagementImg} alt="Manage Content" className="w-full h-48 object-cover" />
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Manage Your Content</h2>
            <p className="text-gray-700 mb-4">Create posts, share content, and engage with the community.</p>
            <button
              onClick={() => handlePageSelect('content-management')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-300">
              Manage Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {renderPageContent()}
    </div>
  );
};

export default MemberDashboardWelcome;
