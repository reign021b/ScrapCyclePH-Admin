import React, { useState } from "react";

const BookingFeeCard = ({ totalBookingFee }) => {
  const [activeIndex, setActiveIndex] = useState(5);

  // Ensure totalBookingFee is an array
  if (!Array.isArray(totalBookingFee)) {
    console.error("Invalid totalBookingFee: expected an array");
    return null;
  }

  // Ensure totalBookingFee contains valid numbers
  const numericTotalBookingFee = totalBookingFee.map(Number);

  // Find the highest value in totalBookingFee
  const highestTotalBookingFee = Math.max(...numericTotalBookingFee);

  // Calculate the percentage change
  const calculatePercentageChange = () => {
    const previousMonth = numericTotalBookingFee[4] || 0;
    const currentMonth = numericTotalBookingFee[5] || 0;

    if (previousMonth === 0 && currentMonth === 0)
      return { percentage: 0, isPositive: true };
    if (previousMonth === 0) return { percentage: 100, isPositive: true };
    if (currentMonth === 0) return { percentage: -100, isPositive: false };

    const percentageChange =
      ((currentMonth - previousMonth) / previousMonth) * 100;
    return {
      percentage: parseFloat(percentageChange.toFixed(2)),
      isPositive: percentageChange >= 0,
    };
  };

  const { percentage, isPositive } = calculatePercentageChange();
  const displayPercentage =
    percentage === 0 ? "0%" : `${Math.abs(percentage)}%`;
  const sign = percentage === 0 ? "" : isPositive ? "+" : "-";

  // Ensure totalBookingFee[activeIndex] is a number
  const currentBookingFee =
    typeof numericTotalBookingFee[activeIndex] === "number"
      ? numericTotalBookingFee[activeIndex]
      : 0;

  return (
    <div className="mb-4">
      <div className="cols-span-1 w-full border rounded-t-xl mr-5">
        <div className="w-full pt-3">
          <div className="px-5 py-3">
            <p className="font-bold">Booking Fee</p>
            <p className="text-xs">
              This is your overview of the booking fees for the past 6 months.
            </p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold">
                {(() => {
                  const [integerPart, decimalPart] = currentBookingFee
                    .toFixed(2)
                    .split(".");
                  return (
                    <>
                      ₱ {integerPart.toLocaleString()}
                      <span className="text-lg">.{decimalPart}</span>
                    </>
                  );
                })()}
              </p>
              <div className="flex items-end pt-5 h-[86px]">
                {numericTotalBookingFee.map((fee, index) => {
                  // Calculate dynamic height
                  const barHeight =
                    fee === 0 ? 10 : (fee / highestTotalBookingFee) * 66;

                  return (
                    <div
                      key={index}
                      id={index.toString()}
                      className={`ml-2 pt-[20px] rounded-lg w-[24px] ${
                        index === activeIndex ? "bg-[#2D9CDB]" : "bg-gray-300"
                      } hover:bg-[#2D9CDB]`}
                      style={{ height: `${barHeight}px` }} // Apply dynamic height
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(5)}
                    >
                      &nbsp;
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="cols-span-1 w-full border rounded-b-xl mr-5 border-t-0 flex">
          <div className="text-[10px] py-4 pl-5 pr-2">
            <div
              className={`rounded-full w-[55px] justify-center items-center flex py-1 ${
                percentage === 0
                  ? "bg-green-100 text-green-600"
                  : isPositive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {sign}
              {displayPercentage}
            </div>
          </div>
          <div className="text-[10px] flex justify-center items-center">
            Compared to previous month
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFeeCard;
