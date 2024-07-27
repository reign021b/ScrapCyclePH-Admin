import React from "react";
import { FaChevronUp } from "react-icons/fa";
import ActiveCollector from "./active-collector";
import UnpaidCollector from "./unpaid-collector";
import CityButtons from "./CityButtons";

const Sidebar = () => {
  return (
    <div className="min-w-[400px] max-w-[400px] border-r flex flex-col justify-between h-full">
      {/* collectors */}
      <div className="h-screen-sidebar overflow-scroll ml-4 pr-1 py-6 overflow-x-clip">
        {/* active */}
        <ActiveCollector />

        {/* unpaid */}
        <button className="hidden w-full justify-between items-center mr-4 mt-6 mb-2 p-2 rounded-lg hover:bg-gray-100">
          <p className="font-semibold">Unpaid (1)</p>
          <FaChevronUp />
        </button>

        <UnpaidCollector className="hidden" />
      </div>

      {/* cities */}
      <CityButtons />
    </div>
  );
};

export default Sidebar;
