'use client';
// page.tsx
import { useState, useEffect } from 'react';
import { auth, db } from '../../utils/firebase';
import { ref, push, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Goals {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
}

export default function Home() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [nutritionData, setNutritionData] = useState<any>(null);
    const [userGoals, setUserGoals] = useState<Goals | null>(null);
    const [servings, setServings] = useState<number>(1);
    const router = useRouter();

    const appId = '7272dd70';
    const apiKey = 'ae696401282e705e1d41e0162ecb9672';

    

    useEffect(() => {
            const uid = Cookies.get('uid');
            if (uid) {
                // Fetch user goals from the database
                const goalsRef = ref(db, `users/${uid}/goals`);
                onValue(goalsRef, (snapshot) => {
                    setUserGoals(snapshot.val());
                });
            } else {
                // Redirect to login if not authenticated
                router.push('/login');
            }
    }, [router]);

    const handleSearch = async () => {
        try {
            const response = await fetch(
                `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-app-id': appId,
                        'x-app-key': apiKey,
                    },
                }
            );
            const data = await response.json();
            setSearchResults(data.common || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getNutritionData = async (foodName: string) => {
        try {
            const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-app-id': appId,
                    'x-app-key': apiKey,
                },
                body: JSON.stringify({
                    query: foodName,
                }),
            });
            const data = await response.json();
            setNutritionData(data.foods[0]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const logFood = async () => {
        try {
            const user = auth.currentUser;
            if (user && nutritionData) {
                const adjustedNutritionData = {
                    ...nutritionData,
                    nf_calories: nutritionData.nf_calories * servings,
                    nf_protein: nutritionData.nf_protein * servings,
                    nf_total_fat: nutritionData.nf_total_fat * servings,
                    nf_total_carbohydrate: nutritionData.nf_total_carbohydrate * servings,
                };
                await push(ref(db, `users/${user.uid}/foods`), adjustedNutritionData);
                // Optionally reset nutritionData and servings
                setNutritionData(null);
                setServings(1);
            }
        } catch (error) {
            console.error('Error logging food:', error);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Owen Macro Tracker</h1>
            <Link href="/dashboard">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded">
                        Back to home
                    </span>
                </Link>
                <br />
                <br />
                <h2 className="text-xl">Search for a food item</h2>
            <input
                className="border text-black p-2 mr-2"
                type="text"
                placeholder="Enter food item"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-blue-500 text-white p-2" onClick={handleSearch}>
                Search
            </button>

            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl">Search Results</h2>
                    <ul>
                        {searchResults.map((item, index) => (
                            <li key={index} className="flex items-center">
                                <span>{item.food_name}</span>
                                <button
                                    className="ml-2 text-blue-500"
                                    onClick={() => getNutritionData(item.food_name)}
                                >
                                    Get Nutrition Info
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {nutritionData && (
                <div className="mt-4">
                    <h2 className="text-xl">Nutrition Information</h2>
                    <p>Food: {nutritionData.food_name}</p>
                    <p>Calories: {nutritionData.nf_calories}</p>
                    <p>Protein: {nutritionData.nf_protein}g</p>
                    <p>Fat: {nutritionData.nf_total_fat}g</p>
                    <p>Carbohydrates: {nutritionData.nf_total_carbohydrate}g</p>
                    <div className="mt-2">
                        <label htmlFor="servings" className="mr-2">Servings:</label>
                        <input
                            id="servings"
                            type="number"
                            className="border text-black p-2"
                            value={servings}
                            onChange={(e) => setServings(parseFloat(e.target.value))}
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <button onClick={logFood} className="bg-green-500 text-white p-2 mt-2">
                        Log Food
                    </button>
                </div>
            )}
        </div>
    );
}