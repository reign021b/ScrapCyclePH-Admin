import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

const Map = ({ bookings = [] }) => {
  const center = [8.948061991080413, 125.54020391156156];

  const myIcon = useMemo(
    () =>
      new Icon({
        iconUrl:
          "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/avatars/8237_among_us_vibing.gif",
        iconSize: [32, 35],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

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
        {bookings.map((booking) => {
          const coordinatesString = booking.coordinates;

          if (!coordinatesString || !coordinatesString.includes(","))
            return null;

          const [latitudeStr, longitudeStr] = coordinatesString
            .replace(/[{}]/g, "")
            .trim()
            .split(",");
          const latitude = parseFloat(latitudeStr.trim());
          const longitude = parseFloat(longitudeStr.trim());

          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates for booking ID: ${booking.id}`);
            return null;
          }

          const leafletCoordinates = L.latLng(latitude, longitude);

          return (
            <Marker
              key={booking.id}
              position={leafletCoordinates}
              icon={myIcon}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
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
