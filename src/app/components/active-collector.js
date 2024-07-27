import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from 'react-icons/fa';
import { supabase } from '/utils/supabase/client'; // Adjust path if necessary

// Function to fetch daily bookings summary from Supabase
async function fetchDailyBookingsSummary() {
  try {
    const { data, error } = await supabase.rpc('get_booking_statistics_for_today');

    if (error) {
      console.error('Error fetching daily bookings summary:', error);
      return [];
    }

    console.log('Fetched data:', data); // Log fetched data for debugging
    return data;
  } catch (error) {
    console.error('Unexpected error fetching data:', error);
    return [];
  }
}

const ActiveCollector = () => {
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    async function getData() {
      const data = await fetchDailyBookingsSummary();
      setSummaryData(data);
    }

    getData();
  }, []);

  useEffect(() => {
    console.log('Summary Data:', summaryData); // Log state update for debugging
  }, [summaryData]);

  if (summaryData.length === 0) {
    return <p>No data available</p>;
  }

  return (
    <div>
      {summaryData.map((item, index) => {
        // Default to 0 if item values are null
        const totalTrade = item.total_trade ? item.total_trade.toFixed(2) : '0.00';
        const totalCommission = item.total_commission ? item.total_commission.toFixed(2) : '0.00';
        const completedBooking = item.completed_booking || 0;
        const totalNumberOfBookings = item.total_number_of_bookings || 0;
        const cancelledBooking = item.cancelled_booking || 0;

        return (
          <button key={index} className="border p-5 mb-4 rounded-md transition duration-100 hover:bg-gray-50 w-full text-left">
            <div className="flex mb-3">
              <Image
                alt=""
                src="https://i.pinimg.com/564x/ef/80/97/ef8097fe4ac4fc38e5c12f1447b76f01.jpg"
                width={70}
                height={70}
                className="rounded-md mr-4"
              />
              <div className="flex-col flex-grow">
                <p className="font-semibold">
                  {item.liner_name} <span className="text-xs">({item.junkshop_name})</span>
                </p>
                <div className="flex flex-grow text-sm w-full mt-1 mb-2">
                  <p className="flex-grow">Trade: ₱{totalTrade}</p>
                  <p className="flex-grow">Comm.: ₱{totalCommission}</p>
                </div>
                <div className="flex text-md">
                  <div className="flex flex-grow items-center justify-start">
                    <div className="mr-4 text-green-600">
                      <FaCheckCircle />
                    </div>
                    <p>{completedBooking}</p>
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
                className="h-full bg-green-600 rounded-full"
                style={{
                  width: totalNumberOfBookings > 0
                    ? `${(completedBooking / totalNumberOfBookings) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ActiveCollector;
