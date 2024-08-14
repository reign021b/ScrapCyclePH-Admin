import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";
import { supabase } from "@/utils/supabase/client";

async function fetchDailyBookingsSummary(city, selectedDate) {
  try {
    const { data, error } = await supabase.rpc(
      "get_booking_statistics_for_today",
      {
        city_name: city, // Pass the city as a parameter
      }
    );
    if (error) {
      throw error;
    }
    // Filter data based on selectedDate
    const filteredData = data.filter(
      (item) => item.schedule_date === selectedDate
    );
    return filteredData;
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    return [];
  }
}

const ActiveCollector = ({ activeCity, selectedDate }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDailyBookingsSummary(activeCity, selectedDate);
        setSummaryData(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data.");
      }
    };

    getData();
    const intervalId = setInterval(getData, 8000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeCity, selectedDate]); // Re-run the effect when activeCity or selectedDate changes

  if (error) {
    return <p className="text-red-600 text-center mt-5">{error}</p>;
  }

  return (
    <>
      {summaryData.length === 0 ? (
        <p className="mt-5 text-center text-lg">
          No data available for {activeCity} on{" "}
          {(() => {
            const [year, month, day] = selectedDate.split("-");
            const date = new Date(year, month - 1, day);
            // Check if the date is valid
            return !isNaN(date.getTime())
              ? new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(date)
              : "Invalid Date";
          })()}
          .
        </p>
      ) : (
        summaryData.map((item, index) => {
          const totalTrade = item.total_trade
            ? parseFloat(item.total_trade).toFixed(2)
            : "0.00";
          const totalCommission = item.total_commission
            ? parseFloat(item.total_commission).toFixed(2)
            : "0.00";
          const completedBooking = item.completed_booking || 0;
          const totalNumberOfBookings = item.total_number_of_bookings || 0;
          const cancelledBooking = item.cancelled_booking || 0;

          return (
            <button
              key={index}
              className="border p-5 m-4 rounded-md transition duration-100 hover:bg-gray-50 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 mx-2"
            >
              <div className="flex mb-3">
                <Image
                  alt={`Profile picture of ${item.liner_name}`}
                  src={item.profile_picture || "/default-profile.png"}
                  width={80}
                  height={100}
                  className="rounded-md mr-4"
                />
                <div className="flex-col flex-grow">
                  <p className="font-semibold">
                    {item.liner_name}{" "}
                    <span className="text-xs">
                      ({item.junkshop_name || "Unknown"})
                    </span>
                  </p>
                  <div className="flex flex-grow text-sm w-full mt-1 mb-2">
                    <p className="flex-grow">
                      Trade: ₱
                      {Number(totalTrade)
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                    <p className="flex-grow">
                      Comm.: ₱
                      {Number(totalCommission)
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  </div>

                  <div className="flex text-md">
                    <div className="flex flex-grow items-center justify-start">
                      <div className="mr-4 text-green-600">
                        <FaCheckCircle />
                      </div>
                      <p>{completedBooking - cancelledBooking}</p>
                    </div>
                    <div className="flex flex-grow items-center justify-start">
                      <div className="mr-4 text-gray-400 rotate-45">
                        <FaRegCircle />
                      </div>
                      <p>{totalNumberOfBookings - completedBooking}</p>
                    </div>
                    <div className="flex flex-grow items-center justify-start">
                      <div className="mr-4 text-red-600 rotate-45">
                        <FaPlusCircle />
                      </div>
                      <p>{cancelledBooking}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-full h-2.5 w-full bg-gray-200">
                <div
                  className="flex h-full bg-green-600 rounded-full"
                  style={{
                    width:
                      totalNumberOfBookings > 0
                        ? `${
                            ((completedBooking - cancelledBooking) /
                              (totalNumberOfBookings - cancelledBooking)) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>
            </button>
          );
        })
      )}
    </>
  );
};

export default ActiveCollector;
