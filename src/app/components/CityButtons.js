// src/app/components/CityButtons.js
import React, { useState } from "react";

const CityButtons = () => {
  const [activeCity, setActiveCity] = useState("Butuan City");

  const handleClick = (city) => {
    setActiveCity(city);
    console.log(`City selected: ${city}`);
  };

  return (
    <div className="w-full border-y font-medium bg-white">
      <button
        className={`px-7 py-3 border-r ${
          activeCity === "Butuan City" ? "bg-green-600 text-white" : "bg-white"
        }`}
        onClick={() => handleClick("Butuan City")}
      >
        Butuan
      </button>
      <button
        className={`px-7 py-3 border-r ${
          activeCity === "Cabadbaran City"
            ? "bg-green-600 text-white"
            : "bg-white"
        }`}
        onClick={() => handleClick("Cabadbaran City")}
      >
        Cabadbaran
      </button>
      <button
        className={`px-7 py-3 border-r ${
          activeCity === "Tagum City" ? "bg-green-600 text-white" : "bg-white"
        }`}
        onClick={() => handleClick("Tagum City")}
      >
        Tagum
      </button>
    </div>
  );
};

export default CityButtons;
