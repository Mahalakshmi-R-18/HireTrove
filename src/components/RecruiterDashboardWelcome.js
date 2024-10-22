import React from 'react';
import recruiterPostingImg from '../images/recruiterPosting.jpg'; 
import searchUserImg from '../images/searchUser.jpg';
import hiringHistoryImg from '../images/hiringHistory.jpg';
import postedRequirementsImg from '../images/postedRequirements.jpg';

const RecruiterDashboardWelcome = ({ onPageSelect }) => {
  
  return (
    <div className="flex flex-col min-h-screen justify-center items-center text-center">
      <div className="bg-opacity-60 bg-gray-900 text-white p-10 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to Recruiter Dashboard!</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          
          {/* Recruitment Posting Card */}
          <div
            onClick={() => onPageSelect('recruitment-posting')}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            <img src={recruiterPostingImg} alt="Recruitment Posting" className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="text-gray-600">Requirement Posting</p>
            </div>
          </div>

          {/* Search User Card */}
          <div
            onClick={() => onPageSelect('search-users')}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            <img src={searchUserImg} alt="Search Users" className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="text-gray-600">Search Users</p>
            </div>
          </div>

          {/* Hiring History Card */}
          <div
            onClick={() => onPageSelect('hiring-history')}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            <img src={hiringHistoryImg} alt="Hiring History" className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="text-gray-600">Hiring History</p>
            </div>
          </div>

          {/* Posted Requirements Card */}
          <div
            onClick={() => onPageSelect('posted-requirements')}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
          >
            <img src={postedRequirementsImg} alt="Posted Requirements" className="w-full h-40 object-cover" />
            <div className="p-4">
              <p className="text-gray-600">Posted Requirements</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardWelcome;
