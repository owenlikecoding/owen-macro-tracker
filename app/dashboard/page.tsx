'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../utils/firebase'; // Adjust the import path if necessary
import { ref, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Cookies from 'js-cookie';
interface Goal {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface Food {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  consumed_at: string;
}

interface Exercise {
  exercise: string;
  duration_min: number;
  nf_calories: number;
  consumed_at: string;
}
export default function Dashboard() {
  const [goals, setGoals] = useState<Goal | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    caloriesBurned: 0,
  });
  const router = useRouter();

  useEffect(() => {
      const uid = Cookies.get('uid');
      if (uid) {
        // Fetch user goals from the database
        const goalsRef = ref(db, `users/${uid}/goals`);
      onValue(goalsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGoals(data as Goal);
        }
      });

      // Fetch logged foods from the database
      const foodsRef = ref(db, `users/${uid}/foods`);
      onValue(foodsRef, (snapshot) => {
        const data = snapshot.val();
        const foodList: Food[] = data ? Object.values(data) as Food[] : [];
        setFoods(foodList);
      });

      // Fetch logged exercises from the database
      const exercisesRef = ref(db, `users/${uid}/exercises`);
      onValue(exercisesRef, (snapshot) => {
        const data = snapshot.val();
        const exerciseList: Exercise[] = data ? Object.values(data) as Exercise[] : [];
        setExercises(exerciseList);
      });
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }

  }, [router]);

  useEffect(() => {
    const totalConsumed = foods.reduce((acc, food) => acc + (food.nf_calories || 0), 0);
    const totalBurned = exercises.reduce((acc, exercise) => acc + (exercise.nf_calories || 0), 0);

    setTotals({
      calories: totalConsumed,
      protein: foods.reduce((acc, food) => acc + (food.nf_protein || 0), 0),
      fats: foods.reduce((acc, food) => acc + (food.nf_total_fat || 0), 0),
      carbs: foods.reduce((acc, food) => acc + (food.nf_total_carbohydrate || 0), 0),
      caloriesBurned: totalBurned,
    });
  }, [foods, exercises]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  // Calculate percentages for progress bars
  const calculatePercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getNetCalories = () => {
    return totals.calories - totals.caloriesBurned;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Your Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="mb-8 flex space-x-4">
        <Link href="/logfood">
          <span className="bg-blue-500 text-white px-4 py-2 rounded">
            Log New Food
          </span>
        </Link>
        <Link href="/exercise">
          <span className="bg-purple-500 text-white px-4 py-2 rounded">
            Log Exercise
          </span>
        </Link>
      </div>

      {/* Goals with Circular Progress Bars */}
      {goals && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Net Calories */}
          <div className="flex flex-col items-center">
            <CircularProgressbar
              value={calculatePercentage(getNetCalories(), goals.calories)}
              text={`${Math.round(calculatePercentage(getNetCalories(), goals.calories))}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor:
                  getNetCalories() >= goals.calories
                    ? 'green'
                    : `rgba(62, 152, 199, ${calculatePercentage(
                        getNetCalories(),
                        goals.calories
                      ) / 100})`,
                textColor: '#3e98c7',
                trailColor: '#d6d6d6',
              })}
            />
            <p className="mt-2">Net Calories</p>
            <p>
              {getNetCalories()} / {goals.calories} kcal
            </p>
          </div>

          {/* Protein */}
          <div className="flex flex-col items-center">
            <CircularProgressbar
              value={calculatePercentage(totals.protein, goals.protein)}
              text={`${Math.round(calculatePercentage(totals.protein, goals.protein))}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${calculatePercentage(
                  totals.protein,
                  goals.protein
                ) / 100})`,
                textColor: '#3e98c7',
                trailColor: '#d6d6d6',
              })}
            />
            <p className="mt-2">Protein</p>
            <p>
              {totals.protein}g / {goals.protein}g
            </p>
          </div>

          {/* Fats */}
          <div className="flex flex-col items-center">
            <CircularProgressbar
              value={calculatePercentage(totals.fats, goals.fats)}
              text={`${Math.round(calculatePercentage(totals.fats, goals.fats))}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${calculatePercentage(
                  totals.fats,
                  goals.fats
                ) / 100})`,
                textColor: '#3e98c7',
                trailColor: '#d6d6d6',
              })}
            />
            <p className="mt-2">Fats</p>
            <p>
              {totals.fats}g / {goals.fats}g
            </p>
          </div>

          {/* Carbs */}
          <div className="flex flex-col items-center">
            <CircularProgressbar
              value={calculatePercentage(totals.carbs, goals.carbs)}
              text={`${Math.round(calculatePercentage(totals.carbs, goals.carbs))}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${calculatePercentage(
                  totals.carbs,
                  goals.carbs
                ) / 100})`,
                textColor: '#3e98c7',
                trailColor: '#d6d6d6',
              })}
            />
            <p className="mt-2">Carbs</p>
            <p>
              {totals.carbs}g / {goals.carbs}g
            </p>
          </div>
        </div>
      )}

      {/* Logged Exercises */}
      {exercises.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Logged Exercises</h2>
          {exercises.map((exercise, index) => (
            <div key={index} className="border p-4 mb-4 rounded shadow">
              <p className="font-semibold">Exercise: {exercise.exercise}</p>
              <p>Duration: {exercise.duration_min} minutes</p>
              <p>Calories Burned: {exercise.nf_calories} kcal</p>
              <p className="text-sm text-gray-600">
                Logged At: {new Date(exercise.consumed_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Logged Foods */}
      {foods.length > 0 ? (
        <div>
          <h2 className="text-2xl mb-4">Logged Foods</h2>
          {foods.map((food, index) => (
            <div key={index} className="border p-4 mb-4 rounded shadow">
              <p className="font-semibold">Food: {food.food_name}</p>
              <p>Calories: {food.nf_calories} kcal</p>
              <p>Protein: {food.nf_protein}g</p>
              <p>Fat: {food.nf_total_fat}g</p>
              <p>Carbs: {food.nf_total_carbohydrate}g</p>
              <p className="text-sm text-gray-600">
                Consumed At: {new Date(food.consumed_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No foods logged yet.</p>
      )}
    </div>
  );
}