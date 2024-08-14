"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import LogoutButton from "./components/Auth/LogoutButton";
import StatsBar from "./components/StatsBar";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [operatorName, setOperatorName] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState(null);
  const [allBookings, setAllBookings] = useState([]); // Store all bookings
  const [filteredBookings, setFilteredBookings] = useState([]); // Store filtered bookings
  const [activeCity, setActiveCity] = useState("Butuan City"); // State for active city
  const [selectedBookingId, setSelectedBookingId] = useState(null); // State for selected booking ID
  const [selectedDate, setSelectedDate] = useState(""); // State for selected date

  const handleClose = () => {
    setSelectedBookingId(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchOperator = async (session) => {
      try {
        // Fetch operator details including profile_path and is_super_admin
        const { data: operators, error: operatorError } = await supabase
          .from("operators")
          .select("name, is_super_admin, profile_path")
          .eq("id", session.user.id)
          .single(); // Use .single() if you expect only one row

        if (operatorError) {
          console.error("Error fetching operator:", operatorError);
        } else if (operators) {
          setOperatorName(operators.name);
          setIsSuperAdmin(operators.is_super_admin);
          const cleanedProfilePath = operators.profile_path?.replace(
            /^'|'$/g,
            ""
          );
          setProfilePath(cleanedProfilePath);
        }
        // Fetch bookings for today
        await fetchBookings();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        // Call the function without parameters
        const { data: bookingsData, error: bookingsError } = await supabase.rpc(
          "get_bookings_for_today"
        );

        if (bookingsError) {
          throw bookingsError;
        }

        // Update state with the fetched data
        setAllBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error.message);
      }
    };

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        fetchOperator(session); // Fetch operator details
        // Set up interval to fetch bookings every 8 seconds
        const intervalId = setInterval(fetchBookings, 8000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      }
    };

    checkUser();

    // Subscribe to real-time changes in the 'operators' table
    const channel = supabase
      .channel("operators")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operators" },
        (payload) => {
          if (payload.new && payload.new.id === session?.user.id) {
            setOperatorName(payload.new.name);
            setIsSuperAdmin(payload.new.is_super_admin);
            const cleanedProfilePath = payload.new.profile_path?.replace(
              /^'|'$/g,
              ""
            );
            setProfilePath(cleanedProfilePath);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    // Filter bookings by selected date whenever `allBookings` or `selectedDate` changes
    const filtered = allBookings.filter((booking) =>
      booking.schedule.startsWith(selectedDate)
    );
    setFilteredBookings(filtered);
  }, [allBookings, selectedDate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex h-screen overflow-y-clip flex-col items-center text-slate-600 overflow-x-hidden">
      {/* app bar */}
      <div className="flex items-center w-screen px-4 bg-white">
        <a href="/" className="mr-auto">
          <Image
            src={`/scrapcycle-logo.png`}
            alt="Scrapcycle logo"
            width={230}
            height={50}
          />
        </a>
        <p className="font-semibold pr-3">
          {operatorName} ({isSuperAdmin ? "Super Admin" : "Admin"})
        </p>
        <Image
          src={
            profilePath ||
            "https://i.pinimg.com/564x/5b/01/dd/5b01dd38126870d000aee1ed5c8daa80.jpg"
          }
          alt="Profile picture"
          width={50}
          height={50}
          className="rounded-full mr-3"
        />
        <LogoutButton className="bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600" />
      </div>

      {/* stats bar */}
      <StatsBar activeCity={activeCity} onDateChange={handleDateChange} />

      {/* body */}
      <div className="flex flex-grow w-full bg-white border-t">
        {/* side bar */}
        <Sidebar
          activeCity={activeCity}
          setActiveCity={setActiveCity}
          selectedBookingId={selectedBookingId}
          setSelectedBookingId={setSelectedBookingId}
          selectedDate={selectedDate}
          onClose={handleClose}
        />
        {/* map */}
        <Map
          bookings={filteredBookings} // Pass filtered bookings to the map
          setSelectedBookingId={setSelectedBookingId}
          activeCity={activeCity}
        />
      </div>
    </main>
  );
}
