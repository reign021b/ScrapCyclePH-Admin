"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet"; // Import Leaflet for custom icon
import "leaflet/dist/leaflet.css";
import marker from "/public/Location Icon.png"; // Adjust the path as needed

// Define your marker coordinates
const coordinates = [8.948061991080413, 125.54020391156156];

// Create the custom icon
const myIcon = new Icon({
  iconUrl: marker,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = () => {
  return (
    <div className="w-full h-full">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={coordinates} // Center the map on your marker coordinates
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates} icon={myIcon}>
          <Popup>
            Your Location
            <br />
            Coordinates: {coordinates[0]}, {coordinates[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
