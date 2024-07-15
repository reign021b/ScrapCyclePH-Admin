import Image from "next/image";
import { HiOutlineLogout } from "react-icons/hi";
import { BsCalendar2WeekFill } from "react-icons/bs";
import { FaCheckCircle, FaPlusCircle, FaRegCircle } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center text-slate-600">
      {/* app bar */}
      <div className="flex items-center w-screen px-4 bg-white">
        <div className="mr-auto">
          <Image src={`/scrapcycle-logo.png`} width={230} height={50}></Image>
        </div>
        <p className="font-semibold">Genevieve Navales (Admin 1)</p>
        <Image
          src={
            "https://i.pinimg.com/564x/5b/01/dd/5b01dd38126870d000aee1ed5c8daa80.jpg"
          }
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
        <div className="pr-4 flex items-center min-w-[450px] border-r py-3">
          <div className="px-3 py-1 flex items-center mr-2 rounded-full border font-bold text-green-600 border-green-500 bg-green-50">
            <div className="relative w-3 h-3 mr-2">
              <div className="absolute w-3 h-3 animate-ping rounded-full bg-green-500" />
              <div className="absolute w-3 h-3 animate-pulse rounded-full bg-green-500" />
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
        <div className="min-w-[466px] border-r flex flex-col">
          {/* collectors */}
          <div className="flex-grow ml-4 my-6">
            {/* active */}
            <div className="border p-5 mr-4 rounded-md">
              <div className="flex mb-3">
                <Image
                  src={`https://i.pinimg.com/564x/ef/80/97/ef8097fe4ac4fc38e5c12f1447b76f01.jpg`}
                  width={70}
                  height={70}
                  className="rounded-md mr-2"
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
            </div>

            {/* unpaid */}
          </div>

          {/* cities */}
          <div className="w-full border-t font-medium">
            <button className="px-7 py-3 border-r bg-green-600 text-white">
              Butuan
            </button>
            <button className="px-7 py-3 border-r ">Cabadbaran</button>
            <button className="px-7 py-3 border-r ">Tagum</button>
          </div>
        </div>
      </div>
    </main>
  );
}
