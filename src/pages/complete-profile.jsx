'use client'

import { useState } from 'react';
import { auth } from '../firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !address || !age) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Store the profile information in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          username: username,
          address: address,
          age: age,
          isAdmin: false // Keep the role as normal user
        }, { merge: true }); // Use merge to avoid overwriting existing data

        console.log('Profile completed successfully');
        navigate('/'); // Redirect to homepage after completion
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#8e94f2] to-[#1e4287] px-4 py-8">
      <h2 className="text-center text-3xl font-bold text-white mb-4">Complete Your Profile</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-lg text-white">Username</label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <label className="text-lg text-white">Age</label>
          <input
            type="number"
            required
            className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full bg-white text-blue-600 hover:bg-gray-100 p-3 rounded-md transition duration-200">
          Complete Profile
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile; 