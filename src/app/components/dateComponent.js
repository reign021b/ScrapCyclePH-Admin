import React, { useRef, useState } from "react";
import { BsCalendar2WeekFill } from "react-icons/bs";

const DateComponent = () => {
  const dateInputRef = useRef(null);
  const [displayDate, setDisplayDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  });

  const handleButtonClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    setDisplayDate(formattedDate);
  };

  return (
    <div className="pr-4 flex items-center min-w-96 border-r py-3">
      <div className="px-3 py-1 flex items-center mr-2 rounded-full border font-bold text-green-600 border-green-500 bg-green-50">
        <div className="relative w-3 h-3 mr-2">
          <div className="absolute w-3 h-3 animate-ping rounded-full bg-green-500" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 animate-pulse rounded-full bg-green-500" />
        </div>
        <p>TODAY</p>
      </div>
      <p className="mr-auto">{displayDate}</p>
      <button
        className="p-2 rounded-full transition-all duration-300 bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600"
        onClick={handleButtonClick}
      >
        <BsCalendar2WeekFill />
      </button>
      <input
        type="date"
        ref={dateInputRef}
        className="hidden"
        onChange={handleDateChange}
      />
    </div>
  );
};

export default DateComponent;
