'use client';

import { useState } from 'react';
import { auth, db } from '../../utils/firebase'; // Adjust the import path if necessary
import { ref, push } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ExerciseLogger() {
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // User Details (These should be fetched from user's profile)
  const gender = 'male'; // Replace with dynamic data
  const weight_kg = 70;   // Replace with dynamic data
  const height_cm = 178;  // Replace with dynamic data
  const age = 18;         // Replace with dynamic data

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogExercise = async () => {
    if (!exercise || duration <= 0) {
      alert('Please enter valid exercise details.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': '7272dd70',   // Replace with your Nutritionix App ID
          'x-app-key': 'ae696401282e705e1d41e0162ecb9672', // Replace with your Nutritionix API Key
        },
        body: JSON.stringify({
          query: `${exercise} for ${duration} minutes`,
          gender,
          weight_kg,
          height_cm,
          age,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercise data.');
      }

      const data = await response.json();

      if (data.exercises && data.exercises.length > 0) {
        const exerciseData = data.exercises[0];
        setCaloriesBurned(exerciseData.nf_calories);

        // Add timestamp
        const consumed_at = new Date().toISOString();

        // Store in Firebase
        const user = auth.currentUser;
        if (user) {
          await push(ref(db, `users/${user.uid}/exercises`), {
            exercise: exerciseData.user_input,
            duration_min: exerciseData.duration_min,
            nf_calories: exerciseData.nf_calories,
            consumed_at,
          });
        }

        alert(`Exercise logged: ${exerciseData.user_input}, Calories Burned: ${exerciseData.nf_calories} kcal`);
        setExercise('');
        setDuration(0);
        setCaloriesBurned(null);
      } else {
        alert('No exercises found. Please try different input.');
      }
    } catch (error) {
      console.error('Error logging exercise:', error);
      alert('Failed to log exercise. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl mb-4">Log Exercise</h1>
      <input
        type="text"
        placeholder="Exercise Type (e.g., Running)"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleLogExercise}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Logging...' : 'Log Exercise'}
      </button>

      {caloriesBurned !== null && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <p>Exercise: {exercise}</p>
          <p>Duration: {duration} minutes</p>
          <p>Calories Burned: {caloriesBurned} kcal</p>
        </div>
      )}
    </div>
  );
}