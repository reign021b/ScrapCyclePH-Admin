import Image from "next/image";

// icons
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";

const UnpaidCollector = () => {
  return (
    <button className="border p-5 mb-4 rounded-md flex items-stretch transition duration-100 hover:bg-gray-50 text-left w-full">
      <Image
        alt=""
        src={`https://i.pinimg.com/564x/ef/80/97/ef8097fe4ac4fc38e5c12f1447b76f01.jpg`}
        width={70}
        height={70}
        className="rounded-md mr-4"
      />
      <div className="flex-col flex-grow">
        <p className="font-semibold mb-2">
          Peter Himeno <span className="text-xs">(RC Junkshop)</span>
        </p>
        <p className="flex-grow text-red-500 font-medium">
          Unpaid balance: Php 500
        </p>
        <p className="flex-grow text-red-500 font-medium">April 4, 2024</p>
      </div>
    </button>
  );
};

export default UnpaidCollector;
