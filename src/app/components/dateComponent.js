import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendar2WeekFill } from "react-icons/bs";

const DateComponent = ({ onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    onDateChange(formattedDate);
  }, [selectedDate, onDateChange]);

  const handleIconClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative pr-4 flex items-center min-w-[30rem] border-r py-3">
      <div className="px-3 py-1 flex items-center mr-2 rounded-full border font-bold text-green-600 border-green-500 bg-green-50">
        <div className="relative w-3 h-3 mr-2">
          <div className="absolute w-3 h-3 animate-ping rounded-full bg-green-500" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 animate-pulse rounded-full bg-green-500" />
        </div>
        <p>DATE</p>
      </div>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          setIsOpen(false); // Close the date picker on date select
        }}
        dateFormat="yyyy-MM-dd"
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        className="hidden" // Hide the default input
        popperClassName="date-picker-popper" // Add custom class
      />
      <style jsx>{`
        .date-picker-popper {
          z-index: 9999; // Ensure the date picker is above other components
          margin-top: 0; // Remove default margin
        }

        .date-picker-popper .react-datepicker {
          position: absolute; // Make sure the date picker is positioned absolutely
          left: -240px; // Adjust the left position to move the date picker to the left
          top: 100%; // Position it just below the button
          transform: translateX(
            -100%
          ); // Move the date picker left to ensure it is visible
        }
      `}</style>
      <p className="mr-auto text-[1rem] font-semibold">
        {selectedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          weekday: "short",
        })}
      </p>
      <button
        className="p-2 rounded-full transition-all duration-300 bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600"
        onClick={handleIconClick}
      >
        <BsCalendar2WeekFill />
      </button>
    </div>
  );
};

export default DateComponent;
