'use client';

import { useState } from 'react';
import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Cookies.set('uid', user.uid); // Set a cookie with the user's ID
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Error logging in:', error);
      // Handle errors (e.g., show error message to the user)
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Log In</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border text-black p-2 mb-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border text-black p-2 mb-2 w-full"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 w-full">
        Log In
      </button>
    </div>
  );
}