import React from "react";

const CityButtons = ({ activeCity, setActiveCity }) => {
  const handleClick = (city) => {
    setActiveCity(city);
  };

  return (
    <div className="w-full border-y font-medium bg-white flex">
      <button
        className={`w-full px-7 py-3 border-r ${
          activeCity === "Butuan City" ? "bg-green-600 text-white" : "bg-white"
        }`}
        onClick={() => handleClick("Butuan City")}
      >
        Butuan
      </button>
      <button
        className={`w-full px-7 py-3 border-r ${
          activeCity === "Davao City" ? "bg-green-600 text-white" : "bg-white"
        }`}
        onClick={() => handleClick("Davao City")}
      >
        Davao
      </button>
    </div>
  );
};

export default CityButtons;
