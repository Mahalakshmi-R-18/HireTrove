import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Header from './Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.category === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.category === 'member') {
          navigate('/member-dashboard');
        } else if (userData.category === 'recruiter') {
          navigate('/recruiter-dashboard');
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Header />
      <div id="login" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex items-center justify-center min-h-screen">
        <form onSubmit={handleLogin} className="text-center p-6 bg-fuchsia-200 bg-opacity-40 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">USER LOGIN</h1>
          <label className="block mb-2">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-96 p-2 border border-gray-900 rounded mt-1"
              required
            />
          </label>
          <label className="block mb-2 relative">
            Password
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-96 p-2 border border-gray-900 rounded mt-1 pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-12 right-0 pr-3 flex items-center text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </label>
          <button type="submit" className="w-full bg-fuchsia-950 hover:bg-fuchsia-800 text-white p-2 rounded mt-2">
            Login
          </button>
          <div className="mt-4 text-center">
            New User? <Link to="/signup" className="text-fuchsia-700">Signup here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
