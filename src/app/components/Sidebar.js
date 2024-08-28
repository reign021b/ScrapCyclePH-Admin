import React from "react";
import { FaChevronUp } from "react-icons/fa";
import ActiveCollector from "./active-collector";
import BookingSidebar from "./booking-sidebar";
import UnpaidCollector from "./unpaid-collector";
import CityButtons from "./CityButtons";

const Sidebar = ({
  activeCity,
  setActiveCity,
  selectedBookingId,
  selectedDate,
  onClose,
}) => {
  return (
    <div className="min-w-[31rem] max-w-[31rem] border-r flex flex-col justify-between h-full">
      <div className="h-screen-sidebar overflow-scroll py-3 overflow-x-clip">
        {/* Conditionally render ActiveCollector based on selectedBookingId */}
        {selectedBookingId === null && (
          <ActiveCollector
            activeCity={activeCity}
            selectedDate={selectedDate}
          />
        )}

        {/* Pass selectedBookingId to BookingSidebar */}
        <BookingSidebar
          activeCity={activeCity}
          selectedBookingId={selectedBookingId}
          onClose={onClose}
        />

        <button className="hidden w-full justify-between items-center mr-4 mt-6 mb-2 p-2 rounded-lg hover:bg-gray-100">
          <p className="font-semibold">Unpaid (1)</p>
          <FaChevronUp />
        </button>

        <UnpaidCollector />
      </div>
      {/* cities */}
      <CityButtons activeCity={activeCity} setActiveCity={setActiveCity} />
    </div>
  );
};

export default Sidebar;
