import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from 'react-router-dom';
import Header from './Header';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    category: 'member',
    skills: []
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const skillsOptions = ["Drawing", "Painting", "Content Writing", "Video Editing", "Photography", "Art and Craft", "Poster Making"];

  useEffect(() => {
    if (formData.dob) {
      const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };

      const calculatedAge = calculateAge(formData.dob);
      setAge(calculatedAge);

      if (calculatedAge <= 15) {
        setAgeError("Age should be above 15 years");
      } else {
        setAgeError('');
      }
    }
  }, [formData.dob]);

  useEffect(() => {
    validatePassword();
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prevFormData => {
        const updatedSkills = checked
          ? [...prevFormData.skills, value]
          : prevFormData.skills.filter(skill => skill !== value);

        return { ...prevFormData, skills: updatedSkills };
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    if (password && !/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(password)) {
      setPasswordError("Password should be minimum 8 characters, 1 uppercase, and 1 special character");
    } else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError('');
    }
  };

  const validatePhoneNumber = () => {
    const phoneRegex = /^[0-9]{10}$/; // Simple phone number validation
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError("Phone number must be 10 digits");
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateForm = () => {
    if (parseInt(age) <= 15) {
      alert("Age should be above 15 years");
      return false;
    }
    if (passwordError) {
      alert(passwordError);
      return false;
    }
    if (formData.email === "admin@gmail.com" && formData.category !== "admin") {
      alert("This email is reserved for the admin category");
      return false;
    }
    if (!validatePhoneNumber()) {
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      const userDoc = {
        name: formData.name,
        dob: formData.dob,
        age: age,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        skills: formData.category === "member" ? formData.skills : [] 
      };

      await setDoc(doc(firestore, 'users', user.uid), userDoc);

      const categoryCollection = {
        admin: 'admin',
        member: 'member',
        recruiter: 'recruiter'
      }[formData.category];

      if (categoryCollection) {
        await setDoc(doc(firestore, categoryCollection, user.uid), userDoc);
      }
      const response = await fetch('http://localhost:5000/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          skills: formData.skills, // Pass skills only if applicable
        }),
      });
    
      // Check if email was sent successfully
      const result = await response.json();
      if (result.success) {
        alert('User created successfully. Please check your email for verification.');
      } else {
        alert('User created, but there was an issue sending the email.');
      }
      window.location.href = '/login';
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Header />
      <div id="signup" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex items-center justify-center min-h-screen pt-10 pb-10">
        <form onSubmit={handleSignup} className="text-center p-6 bg-fuchsia-200 bg-opacity-40 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4">USER REGISTRATION</h1>
          <label className="block text-left mb-2">
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            />
          </label>
          <label className="block text-left mb-2">
            DOB
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            />
            {ageError && <p className="text-red-500 text-xs mt-1">{ageError}</p>}
          </label>
          <label className="block text-left mb-2">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            />
          </label>
          <label className="block text-left mb-2">
            Phone Number
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </label>
          <label className="block text-left mb-2 relative">
            Password
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/5"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </label>
          <label className="block text-left mb-2 relative">
            Confirm Password
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/5"
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </label>
          <label className="block text-left mb-4">
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full p-2 border border-gray-900 rounded mt-1"
              required
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </label>
          {formData.category === 'member' && (
            <div className="text-left mb-4">
              <p>Select your skills:</p>
              {skillsOptions.map((skill) => (
                <label key={skill} className="block">
                  <input
                    type="checkbox"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {skill}
                </label>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="w-full p-2 bg-fuchsia-900 text-white rounded hover:bg-fuchsia-800 transition-colors"
          >
            Sign Up
          </button>
          <p className="mt-4">
            Already have an account? <Link to="/login" className="text-fuchsia-800 hover:text-fuchsia-900 ">Login Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
