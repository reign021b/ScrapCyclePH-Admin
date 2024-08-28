import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaRegCircle, FaPlusCircle } from "react-icons/fa";
import DateComponent from "./dateComponent";
import ProgressBarComponent from "./progressBarComponent";
import { supabase } from "@/utils/supabase/client"; // Adjust the import path as needed

const StatsBar = ({ activeCity, onDateChange, selectedDate }) => {
  const [completedCount, setCompletedCount] = useState(null);
  const [cancelledCount, setCancelledCount] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [totalSum, setTotalSum] = useState(null);
  const [totalCommission, setTotalCommission] = useState(null);

  const fetchBookingCounts = async () => {
    try {
      const fetchCounts = async (rpcName, column) => {
        const { data, error } = await supabase.rpc(rpcName, {
          city_name: activeCity,
        });
        if (error) throw error;

        // Filter the data based on the selectedDate
        const filteredData = data?.filter(
          (item) => item.schedule_date === selectedDate
        );

        // Aggregate the filtered data
        return filteredData.reduce((sum, item) => sum + (item[column] || 0), 0);
      };

      const [
        totalCount,
        completedCount,
        cancelledCount,
        totalSum,
        totalCommission,
      ] = await Promise.all([
        fetchCounts("get_booking_count_for_today", "booking_count"),
        fetchCounts(
          "get_completed_booking_count_for_today",
          "completed_booking_count"
        ),
        fetchCounts(
          "get_cancelled_booking_count_for_today",
          "cancelled_booking_count"
        ),
        fetchCounts("get_total_sum_for_today", "total_sum"),
        fetchCounts("get_total_commission_for_today", "total_commission"),
      ]);

      setTotalCount(totalCount);
      setCompletedCount(completedCount);
      setCancelledCount(cancelledCount);
      setTotalSum(totalSum);
      setTotalCommission(totalCommission);
    } catch (error) {
      console.error("Error fetching booking counts:", error.message);
    }
  };

  useEffect(() => {
    fetchBookingCounts();
  }, [activeCity, selectedDate]); // Fetch data when activeCity or selectedDate changes

  return (
    <div className="bg-white border-t px-4 flex w-full text-sm">
      <DateComponent onDateChange={onDateChange} />

      <ProgressBarComponent
        completedCount={completedCount}
        totalCount={totalCount}
        cancelledCount={cancelledCount}
      />

      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-green-600">
          <FaCheckCircle />
        </div>
        <p>{completedCount !== null ? completedCount : "Loading..."}</p>
      </div>
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-gray-400 rotate-45">
          <FaRegCircle />
        </div>
        <p>
          {totalCount !== null
            ? totalCount - completedCount - cancelledCount
            : "Loading..."}
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
            ? `PHP ${totalSum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "Loading..."}
        </p>
      </div>
      <div className="flex items-center justify-center pl-4">
        <div className="mr-4 font-semibold">Comm.</div>
        <p>
          {totalCommission !== null
            ? `PHP ${totalCommission.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default StatsBar;
