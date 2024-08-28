import React, { useState } from "react";

const PenaltiesCard = ({ totalPenalties }) => {
  const [activeIndex, setActiveIndex] = useState(5);

  // Ensure totalPenalties is an array
  if (!Array.isArray(totalPenalties)) {
    console.error("Invalid totalPenalties: expected an array");
    return null;
  }

  // Find the highest value in totalPenalties
  const highestTotalPenalties = Math.max(...totalPenalties.map(Number));

  // Calculate the percentage change
  const calculatePercentageChange = () => {
    const previousMonth = totalPenalties[4] || 0;
    const currentMonth = totalPenalties[5] || 0;

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
    percentage === 0
      ? totalPenalties[5] === 0
        ? "0%"
        : isPositive
        ? "+100%"
        : "-100%"
      : `${Math.abs(percentage)}%`;

  return (
    <div className="w-full mr-5">
      <div className="w-full border rounded-t-xl pt-3">
        <div className="px-5 py-3">
          <p className="font-bold">Penalties</p>
          <p className="text-xs">
            This is your overview of the penalties for the past 6 months.
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-semibold">
              {(() => {
                const [integerPart, decimalPart] = totalPenalties[activeIndex]
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
            <div className="flex items-end justify-between h-[86px]">
              {totalPenalties.map((penalty, index) => {
                // Calculate dynamic height
                const barHeight =
                  penalty === 0 ? 10 : (penalty / highestTotalPenalties) * 66;

                return (
                  <div
                    key={index}
                    id={index.toString()}
                    className="ml-2 pt-[20px]"
                  >
                    <div
                      className={`rounded-lg ${
                        index === activeIndex ? "bg-[#EB5757]" : "bg-gray-300"
                      } hover:bg-[#EB5757] w-[24px] h-[${barHeight}px] pt-5`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(5)}
                    >
                      &nbsp;
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border rounded-b-xl mr-5 border-t-0 flex">
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
            {percentage === 0 ? "" : isPositive ? "+" : "-"}
            {displayPercentage}
          </div>
        </div>
        <div className="text-[10px] flex justify-center items-center">
          Compared to previous month
        </div>
      </div>
    </div>
  );
};

export default PenaltiesCard;
