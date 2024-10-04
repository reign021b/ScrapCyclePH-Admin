import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";
import { supabase } from "@/utils/supabase/client";

const fetchDailyBookingsSummary = async (city) => {
  try {
    const { data, error } = await supabase.rpc(
      "get_booking_statistics_for_today1",
      {
        city_name: city,
      }
    );
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Unexpected error fetching data:", error);
    return [];
  }
};

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  return !isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date)
    : "Invalid Date";
};

const ActiveCollector = ({ activeCity, selectedDate, onLinerIdSelect }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLinerId, setSelectedLinerId] = useState(null);
  const [bookings, setBookings] = useState([]); // State to store bookings data
  const [colorMapping, setColorMapping] = useState({}); // State to store color mapping

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const allData = await fetchDailyBookingsSummary(activeCity);
        setBookings(allData); // Store all bookings data
        const filteredData = allData.filter(
          (item) => item.schedule_date === selectedDate
        );
        setSummaryData(filteredData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [activeCity, selectedDate]);

  useEffect(() => {
    // Re-generate color mapping when bookings change
    const generateColorMapping = (bookings) => {
      const colors = [
        "#FF0000", // Red
        "#0000FF", // Blue
        "#00FF00", // Green
        "#FFFF00", // Yellow
        "#800080", // Purple
        "#FFA500", // Orange
        "#FFC0CB", // Pink
        "#00FFFF", // Cyan
      ];

      const uniqueLinerIds = [
        ...new Set(bookings.map((booking) => booking.liner_id)),
      ].sort();

      const colorMapping = {};
      uniqueLinerIds.forEach((id, index) => {
        // Assign a unique color based on the liner ID
        colorMapping[id] = colors[index % colors.length];
      });

      return colorMapping;
    };

    setColorMapping(generateColorMapping(bookings));
  }, [bookings]);

  const handleLinerClick = (linerId) => {
    if (selectedLinerId === linerId) {
      setSelectedLinerId(null);
      onLinerIdSelect(null);
    } else {
      setSelectedLinerId(linerId);
      onLinerIdSelect(linerId);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading data...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center mt-5">{error}</p>;
  }

  return (
    <>
      {summaryData.length === 0 ? (
        <div className="flex justify-center items-center">
          <p className="mt-5 text-center text-sm">
            No data available for {activeCity} on {formatDate(selectedDate)}.
          </p>
        </div>
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

          // Always use color mapping for border color
          const borderColor = colorMapping[item.liner_id] || "#000000"; // Default to black if no color

          return (
            <button
              key={index}
              className={`border-2 p-5 m-4 rounded-md transition duration-100 hover:bg-gray-50 w-full text-left focus:outline-none focus:ring-2 ${
                selectedLinerId === item.liner_id ? "ring-2 ring-offset-2" : ""
              }`}
              style={{ borderColor }}
              onClick={() => handleLinerClick(item.liner_id)}
            >
              <div className="flex mb-3">
                <Image
                  alt={`Profile picture of ${item.liner_name}`}
                  src={item.profile_picture || "/default-profile.png"}
                  width={80}
                  height={100}
                  className="rounded-md mr-4 w-24"
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
                      <p>{completedBooking}</p>
                    </div>
                    <div className="flex flex-grow items-center justify-start">
                      <div className="mr-4 text-gray-400 rotate-45">
                        <FaRegCircle />
                      </div>
                      <p>
                        {totalNumberOfBookings -
                          completedBooking -
                          cancelledBooking}
                      </p>
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
                      totalNumberOfBookings > 0 && completedBooking > 0
                        ? `${
                            (completedBooking /
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
