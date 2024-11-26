'use client';

import { useState } from 'react';
import { auth, db } from '../../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Cookies  from 'js-cookie';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Cookies.set('uid', user.uid); // Set a cookie with the user's ID

      // Save user goals in the database
      await set(ref(db, `users/${user.uid}/goals`), {
        calories: Number(calories),
        protein: Number(protein),
        fats: Number(fats),
        carbs: Number(carbs),
      });

      router.push('/dashboard'); // Redirect to dashboard after signup
    } catch (error) {
      console.error('Error signing up:', error);
      // Handle errors
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Sign Up</h1>
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
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        placeholder="Calories Goal"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className="border text-black p-2 mb-2 w-full"
      />
      <input
        type="number"
        placeholder="Protein Goal (g)"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
        className="border text-black p-2 mb-2 w-full"
      />
      <input
        type="number"
        placeholder="Fats Goal (g)"
        value={fats}
        onChange={(e) => setFats(e.target.value)}
        className="border text-black p-2 mb-2 w-full"
      />
      <input
        type="number"
        placeholder="Carbs Goal (g)"
        value={carbs}
        onChange={(e) => setCarbs(e.target.value)}
        className="border text-black text-blackp-2 mb-2 w-full"
      />
      <button onClick={handleSignup} className="bg-blue-500 text-white p-2 w-full">
        Sign Up
      </button>
    </div>
  );
}