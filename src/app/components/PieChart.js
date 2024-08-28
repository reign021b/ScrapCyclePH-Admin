import React, { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";

const { CanvasJSChart } = CanvasJSReact;

const PieChart = ({
  totalPayments,
  totalCommission,
  totalBookingFee,
  totalPenalties,
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) {
    return null; // or some fallback UI
  }

  // Calculate percentages or default to 0 if totalPayments is 0 or any value is undefined
  const calculatePercentage = (value) => {
    if (
      !totalPayments ||
      totalPayments === 0 ||
      value === undefined ||
      value === null
    ) {
      return 0;
    }
    return ((value / totalPayments) * 100).toFixed(2);
  };

  const bookingFeePercentage = parseFloat(calculatePercentage(totalBookingFee));
  const penaltiesPercentage = parseFloat(calculatePercentage(totalPenalties));
  const commissionPercentage = parseFloat(calculatePercentage(totalCommission));

  // Check if all values are 0
  const allValuesZero =
    bookingFeePercentage === 0 &&
    penaltiesPercentage === 0 &&
    commissionPercentage === 0;

  // Set chart options
  const options = {
    exportEnabled: false,
    animationEnabled: true,
    title: {},
    data: [
      {
        type: "pie",
        startAngle: 75,
        toolTipContent: "<b>{label}</b>: {y}%",
        showInLegend: true,
        legendText: "{label}",
        indexLabelFontSize: 9,
        indexLabel: "{label} {y}%",
        indexLabelMaxWidth: 100,
        dataPoints: [
          {
            y: bookingFeePercentage,
            label: "Booking Fee",
            color: "#2D9CDB",
          },
          {
            y: penaltiesPercentage,
            label: "Penalties",
            color: "#EB5757",
          },
          {
            y: commissionPercentage,
            label: "Commission",
            color: "#27AE60",
          },
        ],
      },
    ],
    legend: {
      fontSize: 12,
    },
    height: 350,
    width: 350,
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{ width: "350px", height: "350px", textAlign: "center" }}
    >
      {allValuesZero ? (
        <div className="text-sm font-semibold">No data available.</div>
      ) : (
        <CanvasJSChart options={options} />
      )}
      <style jsx global>{`
        .canvasjs-chart-credit {
          display: none !important;
        }
        .canvasjs-chart-canvas * {
          font-family: "Trebuchet MS";
        }
      `}</style>
    </div>
  );
};

export default PieChart;
