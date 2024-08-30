import React, { useState } from "react";

const PenaltiesCard = ({ totalPenalties, selectedDateType }) => {
  const [activeIndex, setActiveIndex] = useState(5);

  // Ensure totalPenalties is an array
  if (!Array.isArray(totalPenalties)) {
    console.error("Invalid totalPenalties: expected an array");
    return null;
  }

  // Ensure totalPenalties contains valid numbers
  const numericTotalPenalties = totalPenalties.map(Number);

  // Find the highest value in totalPenalties
  const highestTotalPenalties = Math.max(...numericTotalPenalties);

  // Calculate the percentage change
  const calculatePercentageChange = () => {
    const previousPeriod = numericTotalPenalties[4] || 0;
    const currentPeriod = numericTotalPenalties[5] || 0;

    if (previousPeriod === 0 && currentPeriod === 0)
      return { percentage: 0, isPositive: true };
    if (previousPeriod === 0) return { percentage: 100, isPositive: true };
    if (currentPeriod === 0) return { percentage: -100, isPositive: false };

    const percentageChange =
      ((currentPeriod - previousPeriod) / previousPeriod) * 100;
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

  // Ensure totalPenalties[activeIndex] is a number
  const currentPenalty =
    typeof numericTotalPenalties[activeIndex] === "number"
      ? numericTotalPenalties[activeIndex]
      : 0;

  // Determine the label for the period
  const getPeriodLabel = () => {
    switch (selectedDateType) {
      case "yearly":
        return "years";
      case "monthly":
        return "months";
      case "daily":
        return "days";
      case "weekly":
        return "weeks";
      default:
        return "months";
    }
  };

  // Determine the comparison text
  const getComparisonText = () => {
    switch (selectedDateType) {
      case "yearly":
        return "Compared to previous year";
      case "monthly":
        return "Compared to previous month";
      case "daily":
        return "Compared to previous day";
      case "weekly":
        return "Compared to previous week";
      default:
        return "Compared to previous month";
    }
  };

  return (
    <div className="w-full mr-5">
      <div className="w-full border rounded-t-xl pt-3">
        <div className="px-5 py-3">
          <p className="font-bold">Penalties</p>
          <p className="text-xs">
            This is your overview of the penalties for the past 6{" "}
            {getPeriodLabel()}.
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-semibold">
              {(() => {
                const [integerPart, decimalPart] = currentPenalty
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
            <div className="flex items-end justify-between h-[86px] pt-[20px]">
              {numericTotalPenalties.map((penalty, index) => {
                // Calculate dynamic height
                const barHeight =
                  penalty === 0 ? 10 : (penalty / highestTotalPenalties) * 66;

                return (
                  <div key={index} id={index.toString()} className="ml-2">
                    <div
                      className={`rounded-lg ${
                        index === activeIndex ? "bg-[#EB5757]" : "bg-gray-300"
                      } hover:bg-[#EB5757] w-[24px] pt-5`}
                      style={{ height: `${barHeight}px` }} // Use inline styles for dynamic height
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(5)} // Ensure to pass 5 to reset
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
          {getComparisonText()}
        </div>
      </div>
    </div>
  );
};

export default PenaltiesCard;
