"use client";

import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const Map = () => {
  useEffect(() => {
    // This useEffect is just to ensure leaflet.css is loaded
  }, []);

  return (
    <div className="w-full h-full">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={[8.9475, 125.5406]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default Map;
