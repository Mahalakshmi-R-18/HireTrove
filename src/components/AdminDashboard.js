import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase'; 
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import HeaderAdmin from './HeaderAdmin'; 
import SideBarAdmin from './SidebarAdmin'; 
import AdminDashboardWelcome from './AdminDashboardWelcome';
import AdminSkillManagement from './AdminSkillManagement';
import AdminContentManagement from './AdminContentManagement';

const AdminDashboard = () => {
  const [selectedPage, setSelectedPage] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubPage, setSelectedSubPage] = useState('');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    skills: [],
    age: '',
    dob: '',
  });
  const [editableUser, setEditableUser] = useState({
    name: '',
    email: '',
    category: '',
    skills: [],
    age: '',
    dob: '',
  });
  const [categories] = useState(['admin', 'member', 'recruiter']);
  const [availableSkills] = useState(["Drawing", "Painting", "Content Writing", "Video Editing", "Photography", "Art and Craft", "Poster Making"]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      setUsers(usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } 
    catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  const handleMenuItemClick = (page) => {
    setSelectedPage(page);
    setSidebarOpen(false); // Close sidebar when a menu item is clicked
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewUser(prevState => ({
        ...prevState,
        skills: checked
          ? [...prevState.skills, value]
          : prevState.skills.filter(skill => skill !== value),
      }));
    } 
    else if (name === 'dob') {
      // Calculate age from DOB
      setNewUser(prevState => ({
        ...prevState,
        [name]: value,
        age: calculateAge(value),
      }));
    } 
    else {
      setNewUser(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleEditableInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditableUser(prevState => ({
        ...prevState,
        skills: checked
          ? [...prevState.skills, value]
          : prevState.skills.filter(skill => skill !== value),
      }));
    } 
    else if (name === 'dob') {
      setEditableUser(prevState => ({
        ...prevState,
        [name]: value,
        age: calculateAge(value),
      }));
    } else {
      setEditableUser(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleCreateUser = async () => {
    const { name, email, password, category, skills, age, dob } = newUser;
    try {
        // Check for invalid category and skills combination
        if (category === 'admin' || category === 'recruiter') {
            if (skills.length > 0) {
                alert('Skills are not allowed for admin and recruiter categories.');
                return;
            }
        }

        // Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the user data to the 'users' collection
        await setDoc(doc(firestore, 'users', user.uid), {
            name,
            email,
            category,
            skills,
            age,
            dob,
        });

        // Save the user data to the respective category collection
        await setDoc(doc(firestore, category, user.uid), {
            name,
            email,
            skills,
            age,
            dob,
        });

        // Clear the form and refresh the user list
        setNewUser({ name: '', email: '', password: '', category: '', skills: [], age: '', dob: '' });
        fetchUsers(); // Refresh the user list
    } catch (error) {
        console.error('Error creating user: ', error);
    }
};

  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        const userRef = doc(firestore, 'users', selectedUser.id);
        await updateDoc(userRef, {
          name: editableUser.name,
          email: editableUser.email,
          category: editableUser.category,
          skills: editableUser.skills,
          age: editableUser.age,
          dob: editableUser.dob,
        });
        // Update user in their respective category collection
        await updateDoc(doc(firestore, selectedUser.category, selectedUser.id), {
          name: editableUser.name,
          email: editableUser.email,
          skills: editableUser.skills,
          age: editableUser.age,
          dob: editableUser.dob,
        });
        setEditableUser({ name: '', email: '', category: '', skills: [], age: '', dob: '' });
        setSelectedUser(null);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error updating user: ', error);
      }
    }
  };

  const handleUserSelection = (e) => {
    const userId = e.target.value;
    const selected = users.find(user => user.id === userId);
    setSelectedUser(selected);
    setEditableUser(selected);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteDoc(doc(firestore, 'users', selectedUser.id));
        // Remove from any other category collections
        await deleteDoc(doc(firestore, selectedUser.category, selectedUser.id));
        setSelectedUser(null);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error deleting user: ', error);
      }
    }
  };

  const handleSubPageChange = (subPage) => {
    setSelectedSubPage(subPage);
    setNewUser({ name: '', email: '', password: '', category: '', skills: [], age: '', dob: '' }); // Reset user form
    setEditableUser({ name: '', email: '', category: '', skills: [], age: '', dob: '' }); // Reset edit form
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderAdmin 
        onMenuClick={toggleSidebar}
        onProfileView={() => setSelectedPage('view-profile')}
      />
      <div id="home" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex flex-col min-h-screen">
      <div className="flex flex-1">
        <SideBarAdmin 
          isOpen={sidebarOpen} 
          onMenuItemClick={handleMenuItemClick} 
        />
        <main className="flex-1 p-4">
          {selectedPage === 'welcome' && (
            <AdminDashboardWelcome />
          )}
          {selectedPage === 'user-management' && (
            <div>
              <h1 className="text-2xl font-bold mb-4">User Management</h1>
              <div className="flex space-x-4 mb-4">
                <button onClick={() => handleSubPageChange('create-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                  Create User
                </button>
                <button onClick={() => handleSubPageChange('read-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                  View Users
                </button>
                <button onClick={() => handleSubPageChange('update-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                  Update User
                </button>
                <button onClick={() => handleSubPageChange('delete-user')} className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors">
                  Delete User
                </button>
              </div>
              {selectedSubPage === 'create-user' && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Create User</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block mb-1">Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={newUser.name} 
                        onChange={handleInputChange} 
                        className="border border-gray-300 p-2 rounded w-4/5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={newUser.email} 
                        onChange={handleInputChange} 
                        className="border border-gray-300 p-2 rounded w-4/5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Password</label>
                      <div className="relative w-4/5">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          name="password" 
                          value={newUser.password} 
                          onChange={handleInputChange} 
                          className="border border-gray-300 p-2 rounded w-full pr-10" // Added padding-right to make room for the icon
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute inset-y-0 right-0 flex items-center px-2" // Adjusted padding to align properly
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1">Category</label>
                      <select 
                        name="category" 
                        value={newUser.category} 
                        onChange={handleInputChange} 
                        className="border border-gray-300 p-2 rounded w-4/5"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {newUser.category === 'member' && (
                      <div>
                        <label className="block mb-1">Skills</label>
                        <div className="space-y-2">
                          {availableSkills.map(skill => (
                            <div key={skill}>
                              <label>
                                <input 
                                  type="checkbox" 
                                  value={skill} 
                                  checked={newUser.skills.includes(skill)} 
                                  onChange={handleInputChange} 
                                />
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        name="dob" 
                        value={newUser.dob} 
                        onChange={handleInputChange} 
                        className="border border-gray-300 p-2 rounded w-4/5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Age</label>
                      <input 
                        type="text" 
                        value={newUser.age} 
                        readOnly 
                        className="border border-gray-300 p-2 rounded w-4/5 bg-gray-200"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleCreateUser} 
                      className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors align-middle"
                    >
                      Create User
                    </button>
                  </form>
                </div>
              )}
              {selectedSubPage === 'update-user' && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Update User</h2>
                  <select 
                    onChange={handleUserSelection} 
                    className="border border-gray-300 p-2 rounded w-4/5 mb-4"
                  >
                    <option value="">Select user to update</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  {selectedUser && (
                    <form className="space-y-4">
                      <div>
                        <label className="block mb-1">Name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={editableUser.name} 
                          onChange={handleEditableInputChange} 
                          className="border border-gray-300 p-2 rounded w-4/5"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={editableUser.email} 
                          onChange={handleEditableInputChange} 
                          className="border border-gray-300 p-2 rounded w-4/5"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Category</label>
                        <select 
                          name="category" 
                          value={editableUser.category} 
                          onChange={handleEditableInputChange} 
                          className="border border-gray-300 p-2 rounded w-4/5"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      {editableUser.category === 'member' && (
                        <div>
                          <label className="block mb-1">Skills</label>
                          <div className="space-y-2">
                            {availableSkills.map(skill => (
                              <div key={skill}>
                                <label>
                                  <input 
                                    type="checkbox" 
                                    value={skill} 
                                    checked={editableUser.skills.includes(skill)} 
                                    onChange={handleEditableInputChange} 
                                  />
                                  {skill}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block mb-1">Date of Birth</label>
                        <input 
                          type="date" 
                          name="dob" 
                          value={editableUser.dob} 
                          onChange={handleEditableInputChange} 
                          className="border border-gray-300 p-2 rounded w-4/5"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Age</label>
                        <input 
                          type="text" 
                          value={editableUser.age} 
                          readOnly 
                          className="border border-gray-300 p-2 rounded w-4/5 bg-gray-200"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleUpdateUser} 
                        className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors align-middle"
                      >
                        Update User
                      </button>
                    </form>
                  )}
                </div>
              )}
              {selectedSubPage === 'delete-user' && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Delete User</h2>
                  <select 
                    onChange={handleUserSelection} 
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                  >
                    <option value="">Select user to delete</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  {selectedUser && (
                    <div>
                      <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
                      <button 
                        type="button" 
                        onClick={handleDeleteUser} 
                        className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-700 transition-colors align-middle"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              )}
              {selectedSubPage === 'read-user' && (
                <div>
                  <h2 className="text-xl font-bold mb-2">User List</h2>
                  <ul className="space-y-4">
                    {users.map(user => (
                      <li key={user.id} className="border border-gray-300 p-4 rounded">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Category:</strong> {user.category}</p>
                        <p><strong>Skills:</strong> {user.skills.join(', ')}</p>
                        <p><strong>Date of Birth:</strong> {user.dob}</p>
                        <p><strong>Age:</strong> {user.age}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {selectedPage === 'skill-management' && (
          <AdminSkillManagement />
          )}
          {selectedPage === 'content-management' && (
          <AdminContentManagement />
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
