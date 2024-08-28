'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client'; // Adjust the import path if necessary
import { HiOutlineLogout } from 'react-icons/hi';

const LogoutButton = ({ className }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        // Handle error, e.g., display an error message
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Handle unexpected errors
    }
  };

  return (
    <button
      className={`w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all duration-300 ${className}`}
      onClick={handleLogout}
    >
      <HiOutlineLogout />
    </button>
  );
};

export default LogoutButton;
