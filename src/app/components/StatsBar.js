// src/components/StatsBar.js

import React from 'react';
import { BsCalendar2WeekFill } from 'react-icons/bs';
import { FaCheckCircle, FaRegCircle, FaPlusCircle } from 'react-icons/fa';

const StatsBar = () => {
  return (
    <div className="bg-white border-t px-4 flex w-full text-sm">
      {/* date picker */}
      <div className="pr-4 flex items-center min-w-96 border-r py-3">
        <div className="px-3 py-1 flex items-center mr-2 rounded-full border font-bold text-green-600 border-green-500 bg-green-50">
          <div className="relative w-3 h-3 mr-2">
            <div className="absolute w-3 h-3 animate-ping rounded-full bg-green-500" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 animate-pulse rounded-full bg-green-500" />
          </div>
          <p>TODAY</p>
        </div>
        <p className="mr-auto">February 6, Wed</p>
        <button className="p-2 rounded-full transition-all duration-300 bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600">
          <BsCalendar2WeekFill />
        </button>
      </div>

      {/* progress bar */}
      <div className="flex-grow py-3 px-4 flex items-center justify-between border-r">
        <p>18/25</p>
        <div className="rounded-full h-3 mx-4 w-full bg-gray-200">
          <div className="h-full w-3/4 bg-green-600 rounded-full" />
        </div>
        <p>70%</p>
      </div>

      {/* other details */}
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-green-600">
          <FaCheckCircle />
        </div>
        <p>13</p>
      </div>
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-gray-400 rotate-45">
          <FaRegCircle />
        </div>
        <p>7</p>
      </div>
      <div className="flex items-center justify-center w-24 border-r">
        <div className="mr-4 text-lg text-red-600 rotate-45">
          <FaPlusCircle />
        </div>
        <p>5</p>
      </div>
      <div className="flex items-center justify-center border-r px-4">
        <div className="mr-4 font-semibold">Trades</div>
        <p>PHP 11,056</p>
      </div>
      <div className="flex items-center justify-center pl-4">
        <div className="mr-4 font-semibold">Comm.</div>
        <p>PHP 1,056</p>
      </div>
    </div>
  );
};

export default StatsBar;