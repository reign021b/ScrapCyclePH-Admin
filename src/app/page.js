"use client";

import Image from "next/image";

// icons
import { HiOutlineLogout } from "react-icons/hi";
import { BsCalendar2WeekFill } from "react-icons/bs";
import {
  FaCheckCircle,
  FaPlusCircle,
  FaRegCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import ActiveCollector from "./components/active-collector";
import UnpaidCollector from "./components/unpaid-collector";
import Map from "./components/map";

export default function Home() {
  return (
    <main className="flex h-screen overflow-y-clip flex-col items-center text-slate-600 overflow-x-hidden">
      {/* app bar */}
      <div className="flex items-center w-screen px-4 bg-white">
        <div className="mr-auto">
          <Image src={`/scrapcycle-logo.png`} alt="Scrapcycle logo" width={230} height={50} />
        </div>
        <p className="font-semibold">Genevieve Navales (Admin 1)</p>
        <Image
          src={
            "https://i.pinimg.com/564x/5b/01/dd/5b01dd38126870d000aee1ed5c8daa80.jpg"
          }
          alt=""
          height={44}
          width={44}
          className="rounded-full ml-4 mr-3"
        />
        <button className="w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600">
          <HiOutlineLogout />
        </button>
      </div>

      {/* stats bar */}
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

      {/* body */}
      <div className="flex flex-grow w-full bg-white border-t">
        {/* side bar */}
        <div className="min-w-[400px] max-w-[400px] border-r flex flex-col justify-between h-full">
          {/* collectors */}
          <div className="h-screen-sidebar overflow-scroll ml-4 pr-1 py-6 overflow-x-clip">
            {/* active */}
            <ActiveCollector />
            <ActiveCollector />
            <ActiveCollector />

            {/* unpaid */}
            <button className="flex w-full justify-between items-center mr-4 mt-6 mb-2 p-2 rounded-lg hover:bg-gray-100">
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
            <button className="px-7 py-3 border-r ">Cabadbaran</button>
            <button className="px-7 py-3 border-r ">Tagum</button>
          </div>
        </div>

        {/* map */}
        <Map />
      </div>
    </main>
  );
}
