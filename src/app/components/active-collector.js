import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";
import { supabase } from "/utils/supabase/client";

async function fetchDailyBookingsSummary(city) {
  try {
    const { data, error } = await supabase.rpc(
      "get_booking_statistics_for_today",
      {
        city_name: city, // Pass the city as a parameter
      }
    );
    if (error) {
      console.error("Error fetching daily bookings summary:", error);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    return [];
  }
}

const ActiveCollector = ({ activeCity }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDailyBookingsSummary(activeCity);
        setSummaryData(data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data.");
      }
    };

    getData();
    const intervalId = setInterval(getData, 8000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeCity]); // Re-run the effect when activeCity changes

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      {summaryData.length === 0 ? (
        <p className="text-center">No data available for {activeCity}</p>
      ) : (
        summaryData.map((item, index) => {
          const totalTrade = item.total_trade?.toFixed(2) ?? "0.00";
          const totalCommission = item.total_commission?.toFixed(2) ?? "0.00";
          const completedBooking = item.completed_booking ?? 0;
          const totalNumberOfBookings = item.total_number_of_bookings ?? 0;
          const cancelledBooking = item.cancelled_booking ?? 0;

          return (
            <button
              key={index}
              className="border p-5 mb-4 rounded-md transition duration-100 hover:bg-gray-50 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 mx-2"
            >
              <div className="flex mb-3">
                <Image
                  alt={`Profile picture of ${item.liner_name}`}
                  src={item.profile_picture}
                  width={80}
                  height={100}
                  className="rounded-md mr-4"
                />
                <div className="flex-col flex-grow">
                  <p className="font-semibold">
                    {item.liner_name}{" "}
                    <span className="text-xs">({item.junkshop_name})</span>
                  </p>
                  <div className="flex flex-grow text-sm w-full mt-1 mb-2">
                    <p className="flex-grow">
                      Trade: ₱{Number(totalTrade).toLocaleString()}
                    </p>
                    <p className="flex-grow">
                      Comm.: ₱{Number(totalCommission).toLocaleString()}
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
