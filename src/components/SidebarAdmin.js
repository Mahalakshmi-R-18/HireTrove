// src/components/SidebarAdmin.js
import React from 'react';

const SidebarAdmin = ({ isOpen, onMenuItemClick }) => {
  return (
    <aside className={`bg-fuchsia-950 text-white w-64 min-h-screen p-4 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <h2 className="text-xl font-bold mb-4">Admin Menu</h2>
      <ul>
        <li>
          <button
            onClick={() => onMenuItemClick('user-management')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            User Management
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('skill-management')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            Club Management
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuItemClick('content-management')}
            className="block p-2 rounded hover:bg-fuchsia-800 w-full text-left">
            User Post Management
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarAdmin;
