import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaRegCircle, FaPlusCircle } from "react-icons/fa";
import DateComponent from "./dateComponent";
import ProgressBarComponent from "./progressBarComponent";
import { supabase } from "/utils/supabase/client"; // Adjust the import path as needed

const StatsBar = ({ activeCity }) => {
  // Accept activeCity as a prop
  const [completedCount, setCompletedCount] = useState(null); // State for completed bookings
  const [cancelledCount, setCancelledCount] = useState(null); // State for cancelled bookings
  const [totalCount, setTotalCount] = useState(null); // State for total bookings
  const [totalSum, setTotalSum] = useState(null); // State for total sum
  const [totalCommission, setTotalCommission] = useState(null); // State for total commission

  const fetchBookingCounts = async () => {
    try {
      // Call the Supabase function to get the total booking count for today
      const { data: totalData, error: totalError } = await supabase.rpc(
        "get_booking_count_for_today",
        { city_name: activeCity } // Use activeCity here
      );

      if (totalError) {
        throw totalError;
      }

      // Call the Supabase function to get the completed booking count for today
      const { data: completedData, error: completedError } = await supabase.rpc(
        "get_completed_booking_count_for_today",
        { city_name: activeCity } // Use activeCity here
      );

      if (completedError) {
        throw completedError;
      }

      // Call the Supabase function to get the cancelled booking count for today
      const { data: cancelledData, error: cancelledError } = await supabase.rpc(
        "get_cancelled_booking_count_for_today",
        { city_name: activeCity } // Use activeCity here
      );

      if (cancelledError) {
        throw cancelledError;
      }

      // Call the Supabase function to get the total sum for today
      const { data: sumData, error: sumError } = await supabase.rpc(
        "get_total_sum_for_today",
        { city_name: activeCity } // Use activeCity here
      );

      if (sumError) {
        throw sumError;
      }

      // Call the Supabase function to get the total commission for today
      const { data: commissionData, error: commissionError } =
        await supabase.rpc(
          "get_total_commission_for_today",
          { city_name: activeCity } // Use activeCity here
        );

      if (commissionError) {
        throw commissionError;
      }

      // Update the state with the results
      setTotalCount(totalData);
      setCompletedCount(completedData);
      setCancelledCount(cancelledData);
      setTotalSum(sumData);
      setTotalCommission(commissionData);
    } catch (error) {
      console.error("Error fetching booking counts:", error.message);
    }
  };

  useEffect(() => {
    // Fetch data initially
    fetchBookingCounts();

    // Set up interval to fetch data every 8 seconds
    const intervalId = setInterval(fetchBookingCounts, 8000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeCity]); // Depend on activeCity

  return (
    <div className="bg-white border-t px-4 flex w-full text-sm">
      {/* date picker */}
      <DateComponent />

      {/* progress bar */}
      <ProgressBarComponent
        completedCount={completedCount}
        totalCount={totalCount}
        cancelledCount={cancelledCount}
      />

      {/* other details */}
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-green-600">
          <FaCheckCircle />
        </div>
        <p>
          {completedCount !== null
            ? completedCount - cancelledCount
            : "Loading..."}
        </p>
      </div>
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-gray-400 rotate-45">
          <FaRegCircle />
        </div>
        <p>
          {totalCount !== null ? totalCount - completedCount : "Loading..."}
        </p>
      </div>
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-red-600 rotate-45">
          <FaPlusCircle />
        </div>
        <p>{cancelledCount !== null ? cancelledCount : "Loading..."}</p>
      </div>
      <div className="flex items-center justify-center border-r px-4">
        <div className="mr-4 font-semibold">Trades</div>
        <p>
          {totalSum !== null
            ? `PHP ${totalSum.toLocaleString()}`
            : "Loading..."}
        </p>
      </div>
      <div className="flex items-center justify-center pl-4">
        <div className="mr-4 font-semibold">Comm.</div>
        <p>
          {totalCommission !== null
            ? `PHP ${totalCommission.toLocaleString()}`
            : "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default StatsBar;
