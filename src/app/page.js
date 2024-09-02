"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import StatsBar from "./components/StatsBar";
import Sidebar from "./components/Sidebar";
import Map from "./components/map";
import AppBar from "./components/AppBar";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [operatorName, setOperatorName] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeCity, setActiveCity] = useState("Davao City");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedLinerId, setSelectedLinerId] = useState(null);

  const handleLinerId = (linerId) => {
    setSelectedLinerId(linerId);
  };

  const handleClose = () => {
    setSelectedBookingId(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchOperator = async (session) => {
      try {
        const { data: operators, error: operatorError } = await supabase
          .from("operators")
          .select("name, is_super_admin, profile_path")
          .eq("id", session.user.id)
          .single();

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

        await fetchBookings();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data: bookingsData, error: bookingsError } = await supabase.rpc(
          "get_bookings_for_today"
        );

        if (bookingsError) {
          throw bookingsError;
        }

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
        fetchOperator(session);
        const intervalId = setInterval(fetchBookings, 1000);

        return () => clearInterval(intervalId);
      }
    };

    checkUser();

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    const filtered = allBookings.filter((booking) =>
      booking.schedule.startsWith(selectedDate)
    );
    setFilteredBookings(filtered);
  }, [allBookings, selectedDate]);

  if (loading) {
    return (
      <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center bg-white">
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-y-clip flex-col justify-between items-center text-slate-600 overflow-x-hidden">
      {loading ? (
        <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center">
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        </div>
      ) : (
        <>
          <></>
          <AppBar
            operatorName={operatorName}
            isSuperAdmin={isSuperAdmin}
            profilePath={profilePath}
          />
          <StatsBar
            activeCity={activeCity}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
          <div className="flex flex-grow w-full bg-white border-t">
            <Sidebar
              activeCity={activeCity}
              setActiveCity={setActiveCity}
              selectedBookingId={selectedBookingId}
              setSelectedBookingId={setSelectedBookingId}
              selectedDate={selectedDate}
              onClose={handleClose}
              onLinerIdSelect={handleLinerId}
            />
            <Map
              bookings={filteredBookings}
              setSelectedBookingId={setSelectedBookingId}
              activeCity={activeCity}
              linerId={selectedLinerId}
            />
          </div>
        </>
      )}
    </main>
  );
}
