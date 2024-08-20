import React from "react";
import CanvasJSReact from "@canvasjs/react-charts";

const { CanvasJS, CanvasJSChart } = CanvasJSReact;

const PieChart = () => {
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
          { y: 40.07, label: "Booking Fee", color: "#2D9CDB" },
          { y: 2.96, label: "Penalties", color: "#EB5757" },
          { y: 56.96, label: "Commission", color: "#27AE60" },
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
    <div style={{ width: "350px", height: "350px" }}>
      <CanvasJSChart options={options} />
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
