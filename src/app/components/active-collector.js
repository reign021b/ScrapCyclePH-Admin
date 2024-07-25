import React from 'react';
import Image from "next/image";

// icons
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";

const ActiveCollector = () => {
  return (
    <button className="border p-5 mb-4 rounded-md transition duration-100 hover:bg-gray-50 w-full text-left">
      <div className="flex mb-3">
        <Image
          alt=""
          src={`https://i.pinimg.com/564x/ef/80/97/ef8097fe4ac4fc38e5c12f1447b76f01.jpg`}
          width={70}
          height={70}
          className="rounded-md mr-4"
        />
        <div className="flex-col flex-grow">
          <p className="font-semibold">
            Peter Himeno <span className="text-xs">(RC Junkshop)</span>
          </p>
          <div className="flex flex-grow text-sm w-full mt-1 mb-2">
            <p className="flex-grow">Trade: ₱5,670</p>
            <p className="flex-grow">Comm.: ₱570</p>
          </div>
          <div className="flex text-md">
            <div className="flex flex-grow items-center justify-start">
              <div className="mr-4 text-green-600">
                <FaCheckCircle />
              </div>
              <p>13</p>
            </div>
            <div className="flex flex-grow items-center justify-start">
              <div className="mr-4 text-gray-400 rotate-45">
                <FaRegCircle />
              </div>
              <p>7</p>
            </div>
            <div className="flex flex-grow items-center justify-start">
              <div className="mr-4 text-red-600 rotate-45">
                <FaPlusCircle />
              </div>
              <p>5</p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-full h-2.5 w-full bg-gray-200">
        <div className="h-full w-3/4 bg-green-600 rounded-full" />
      </div>
    </button>
  );
};

export default ActiveCollector;
