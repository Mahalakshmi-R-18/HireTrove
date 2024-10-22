// src/components/SidebarMember.js
import React from 'react';

const SidebarMember = ({ isOpen, onMenuItemClick }) => {
  return (
    <aside className={`bg-fuchsia-950 text-white w-64 min-h-screen p-4 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <h2 className="text-xl font-bold mb-4">Member Menu</h2>
      <ul>
        <li>
          <button
            onClick={() => onMenuItemClick('join-club')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            Join Club
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('content-management')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            Post Management
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('update-skills')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            Update Skills
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarMember;
