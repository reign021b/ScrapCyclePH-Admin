import React, { useEffect, useState } from "react";

const PieChart = ({
  totalPayments,
  totalCommission,
  totalBookingFee,
  totalPenalties,
}) => {
  const [CanvasJSChart, setCanvasJSChart] = useState(null);

  useEffect(() => {
    import("@canvasjs/react-charts")
      .then((module) => {
        if (module.CanvasJSChart) {
          setCanvasJSChart(() => module.CanvasJSChart);
        } else if (module.default && module.default.CanvasJSChart) {
          setCanvasJSChart(() => module.default.CanvasJSChart);
        } else {
          console.error("CanvasJSChart not found in the imported module");
        }
      })
      .catch((error) => console.error("Error importing CanvasJSChart:", error));
  }, []);

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

  const allValuesZero =
    bookingFeePercentage === 0 &&
    penaltiesPercentage === 0 &&
    commissionPercentage === 0;

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
      ) : CanvasJSChart ? (
        <CanvasJSChart options={options} />
      ) : (
        <div>Loading chart...</div>
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
