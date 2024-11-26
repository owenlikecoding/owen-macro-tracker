'use client';
import { useEffect } from 'react';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
     const uid = Cookies.get('uid');
      if (uid) {
        // If the user is logged in, redirect to the dashboard
        router.push('/dashboard');
    }

  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-6">Owen Macro Tracker</h1>
      <div>
        <Link href="/login">
          <span className="bg-blue-500 text-white px-4 py-2 rounded mr-4">Log In</span>
        </Link>
        <Link href="/signup">
          <span className="bg-green-500 text-white px-4 py-2 rounded">Sign Up</span>
        </Link>
      </div>
    </div>
  );
}