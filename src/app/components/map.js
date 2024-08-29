import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import MapContainer and other components from react-leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Map = ({ bookings = [], setSelectedBookingId, activeCity }) => {
  const [L, setL] = useState(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  const defaultCenter = [8.948061991080413, 125.54020391156156];

  const center = useMemo(() => {
    switch (activeCity) {
      case "Butuan City":
        return [8.948061991080413, 125.54020391156156];
      case "Davao City":
        return [7.093545, 125.599351];
      default:
        return defaultCenter;
    }
  }, [activeCity]);

  const createIcon = (iconUrl, size) => {
    if (!L) return null;
    try {
      return L.icon({
        iconUrl,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]],
        popupAnchor: [0, -size[1]],
      });
    } catch (error) {
      console.error("Error creating icon:", error);
      return null;
    }
  };

  const getIcon = (booking) => {
    if (!L) return null;
    if (booking.cancelled === true) {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/cancelled-gif.gif",
        [32, 32]
      );
    } else if (booking.liner_id === null) {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/assign-liner.gif",
        [42, 40]
      );
    } else if (booking.status === "true") {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/completed-gif.gif",
        [35, 40]
      );
    } else {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/pending-gif-2.gif",
        [35, 38]
      );
    }
  };

  const handleMarkerClick = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  const mapKey = `${activeCity}-${center[0]}-${center[1]}`;

  if (!L) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        key={mapKey}
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
            .split(",")
            .map((str) => str.trim());
          const latitude = parseFloat(latitudeStr);
          const longitude = parseFloat(longitudeStr);

          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(`Invalid coordinates for booking ID: ${booking.id}`);
            return null;
          }

          const leafletCoordinates = L.latLng(latitude, longitude);
          const icon = getIcon(booking);

          return (
            <Marker
              key={booking.id}
              position={leafletCoordinates}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(booking.id),
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
