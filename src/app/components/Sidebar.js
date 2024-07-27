import React from 'react';
import { FaChevronUp } from 'react-icons/fa';
import ActiveCollector from './active-collector';
import UnpaidCollector from './unpaid-collector';

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

        <UnpaidCollector />
      </div>

      {/* cities */}
      <div className="w-full border-y font-medium bg-white">
        <button className="px-7 py-3 border-r bg-green-600 text-white">
          Butuan
        </button>
        <button className="px-7 py-3 border-r">Cabadbaran</button>
        <button className="px-7 py-3 border-r">Tagum</button>
      </div>
    </div>
  );
};

export default Sidebar;