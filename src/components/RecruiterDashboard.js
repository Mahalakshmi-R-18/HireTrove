import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import HeaderRecruiter from './HeaderRecruiter';
import SidebarRecruiter from './SidebarRecruiter';
import RecruiterPosting from './RecruiterPosting';
import SearchUser from './SearchUser';
import HiringHistory from './HiringHistory';
import RecruiterDashboardWelcome from './RecruiterDashboardWelcome';
import PostedRequirements from './PostedRequirements';

const RecruiterDashboard = () => {
  const [recruiterName, setRecruiterName] = useState('');
  const [selectedPage, setSelectedPage] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(firestore, 'users', user.uid)); // Adjust collection name if necessary
        if (userDoc.exists()) {
          setRecruiterName(userDoc.data().name); // Adjust field name if necessary
        }
      }
    };
    fetchRecruiterData();
  }, []);

  const handleMenuItemClick = (page) => {
    setSelectedPage(page);
    setSidebarOpen(false); // Close sidebar when a menu item is clicked
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderRecruiter 
        onMenuClick={toggleSidebar}
        onProfileView={() => setSelectedPage('view-profile')}
      />
      <div id="home" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex flex-col min-h-screen">
      <div className="flex flex-1">
        <SidebarRecruiter 
          isOpen={sidebarOpen} 
          onMenuItemClick={handleMenuItemClick} 
        />
        <main className="flex-grow p-4">
          {selectedPage === 'welcome' && (
            <RecruiterDashboardWelcome onPageSelect={handleMenuItemClick} />
          )}
          {selectedPage === 'recruitment-posting' && (
            <RecruiterPosting />
          )}
          {selectedPage === 'search-users' && (
              <SearchUser />
          )}
          {selectedPage === 'hiring-history' && (
             <HiringHistory />
          )}
          {selectedPage === 'posted-requirements' && (
             <PostedRequirements />
          )}
        </main>
      </div>
    </div></div>
  );
};

export default RecruiterDashboard;
