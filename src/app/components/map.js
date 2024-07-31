// Import necessary components
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Icon } from "leaflet"; // Import Leaflet for custom icon
import "leaflet/dist/leaflet.css";
import MarkerIcon from "leaflet/dist/images/marker-icon.png";
import MarkerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import MarkerShadow from "leaflet/dist/images/marker-shadow.png";
import { useState, useRef } from "react";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: MarkerIcon2x.src,
  iconUrl: MarkerIcon.src,
  shadowUrl: MarkerShadow.src,
});

const Map = ({ bookings = [] }) => {
  // Provide a default empty array for bookings
  // Log bookings data to the console
  // console.log("Bookings data:", bookings);

  // Define the initial map view
  const center = [8.948061991080413, 125.54020391156156];

  // Create the custom icon
  const myIcon = new Icon({
    iconUrl:
      "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/avatars/8237_among_us_vibing.gif",
    iconSize: [32, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="w-full h-full">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={center}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Render markers for each booking */}
        {bookings.map((booking) => {
          // Extract coordinates from booking data (assuming 'coordinates' field)
          const coordinatesString = booking.coordinates;

          // Check if coordinatesString is valid before processing
          if (!coordinatesString || !coordinatesString.includes(","))
            return null;

          // Remove curly braces and split into latitude, longitude
          const cleanedString = coordinatesString
            .replace(/[{}]/g, "") // Remove curly braces
            .trim(); // Trim any whitespace
          const coordinatesArray = cleanedString.split(",");
          const latitude = parseFloat(coordinatesArray[0].trim());
          const longitude = parseFloat(coordinatesArray[1].trim());

          // // Log parsed coordinates with descriptive messages
          // console.log(`\nBooking ID: ${booking.id}`);
          // console.log(`Full Name: ${booking.full_name}`);
          // console.log(`Address Name: ${booking.address_name}`);
          // console.log(`Contact Number: ${booking.contact_number}`);
          // console.log(`Waste Type: ${booking.waste_type}`);
          // console.log(`Raw Coordinates String: "${coordinatesString}"`);
          // console.log(`Cleaned Coordinates String: "${cleanedString}"`);
          // console.log(`Parsed Latitude: ${latitude}`);
          // console.log(`Parsed Longitude: ${longitude}`);

          // Check for valid latitude and longitude
          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates for booking ID: ${booking.id}`);
            return null;
          }

          // Create a Leaflet LatLng object
          const leafletCoordinates = L.latLng(latitude, longitude);

          // Create a marker with booking details in the popup
          return (
            <Marker
              key={booking.id}
              position={leafletCoordinates}
              icon={myIcon}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                },
              }}
            >
              <Popup>
                <strong>{booking.full_name}</strong>
                <br />
                {booking.address_name}
                <br />
                {booking.contact_number}
                <br />
                (Waste Type: {booking.waste_type})
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
