// src/app/components/CityButtons.js
import React from "react";

const CityButtons = () => {
  const handleClick = (city) => {
    console.log(`City selected: ${city}`);
  };

  return (
    <div className="w-full border-y font-medium bg-white">
      <button
        className="px-7 py-3 border-r bg-green-600 text-white"
        onClick={() => handleClick("Butuan City")}
      >
        Butuan
      </button>
      <button
        className="px-7 py-3 border-r"
        onClick={() => handleClick("Cabadbaran City")}
      >
        Cabadbaran
      </button>
      <button
        className="px-7 py-3 border-r"
        onClick={() => handleClick("Tagum City")}
      >
        Tagum
      </button>
    </div>
  );
};

export default CityButtons;
