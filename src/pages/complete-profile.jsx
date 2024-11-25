'use client'

import { useState } from 'react';
import { auth } from '../firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    if (!username.trim() || !address.trim() || !birthDate) {
      setError("Please fill in all fields.");
      return false;
    }

    if (username.length > 30) {
      setError("Username must be less than 30 characters.");
      return false;
    }

    const age = calculateAge(birthDate);
    if (age < 13) {
      setError("You must be at least 13 years old to use this service.");
      return false;
    }
    if (age > 120) {
      setError("Please enter a valid birth date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found");

      await setDoc(doc(db, 'users', user.uid), {
        username: username.trim(),
        address: address.trim(),
        birthDate: birthDate,
        age: calculateAge(birthDate),
        isAdmin: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Profile completed successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || "An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#8e94f2] to-[#1e4287] px-4 py-8">
      <h2 className="text-center text-3xl font-bold text-white mb-4">Complete Your Profile</h2>
      {error && <p className="text-red-500 bg-white/80 p-2 rounded-md text-center mb-4">{error}</p>}
      <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-lg text-white">Username</label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg text-white">Address</label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg text-white">Birth Date</label>
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full bg-white text-blue-600 hover:bg-gray-100 p-3 rounded-md transition duration-200 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile; 