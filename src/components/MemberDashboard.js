// src/components/MemberDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import HeaderMember from './HeaderMember';
import SidebarMember from './SidebarMember';
import MemberDashboardWelcome from './MemberDashboardWelcome';
import MemberJoinClub from './MemberJoinClub';
import MemberPost from './MemberPost';
import MemberUpdateSkills from './MemberUpdateSkills';

const MemberDashboard = () => {
  const [memberName, setMemberName] = useState('');
  const [selectedPage, setSelectedPage] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (auth.currentUser) {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(firestore, 'users', user.uid)); // Adjust collection name if necessary
        if (userDoc.exists()) {
          setMemberName(userDoc.data().name); // Adjust field name if necessary
        }
      }
    };
    fetchMemberData();
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
      <HeaderMember 
        onMenuClick={toggleSidebar}
        onProfileView={() => setSelectedPage('view-profile')}
      />
        <div id="home" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex flex-col min-h-screen">

        <div className="flex flex-1">
        <SidebarMember 
          isOpen={sidebarOpen} 
          onMenuItemClick={handleMenuItemClick} 
        />
        <main className="flex-grow p-4">
          {selectedPage === 'welcome' && (
            <MemberDashboardWelcome />
          )}
          {selectedPage === 'view-profile' && (
            <div>
              <h1 className="text-2xl font-bold mb-4">View Profile</h1>
              <p>Display member's profile details here.</p>
            </div>
          )}
          {selectedPage === 'join-club' && (
          <MemberJoinClub />
          )}
          {selectedPage === 'content-management' && (
            <div>
              <br></br>
              <h1 className="text-2xl font-bold mb-4">Posts</h1>
              <MemberPost />
            </div>
          )}
          {selectedPage === 'update-skills' && (
            <div>
              <MemberUpdateSkills />
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
