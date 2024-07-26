// src/components/StatsBar.js

import React from 'react';
import { FaCheckCircle, FaRegCircle, FaPlusCircle } from 'react-icons/fa';
import DateComponent from './dateComponent';
import ProgressBarComponent from './progressBarComponent';

const StatsBar = () => {
  return (
    <div className="bg-white border-t px-4 flex w-full text-sm">
      {/* date picker */}
      <DateComponent />

      {/* progress bar */}
      <ProgressBarComponent />

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