import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ bookings = [], setSelectedBookingId }) => {
  const center = [8.948061991080413, 125.54020391156156];

  const cancelledIcon = useMemo(
    () =>
      new Icon({
        iconUrl:
          "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/cancelled-gif.gif",
        iconSize: [32, 35],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const completedIcon = useMemo(
    () =>
      new Icon({
        iconUrl:
          "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/completed-gif.gif",
        iconSize: [32, 35],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const pendingIcon = useMemo(
    () =>
      new Icon({
        iconUrl:
          "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/pending-gif-2.gif",
        iconSize: [32, 35],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const getIcon = (booking) => {
    if (booking.cancelled) {
      return cancelledIcon;
    } else if (booking.status) {
      return completedIcon;
    } else {
      return pendingIcon;
    }
  };

  const handleMarkerClick = (bookingId) => {
    // Pass the bookingId to the parent component
    setSelectedBookingId(bookingId);
  };

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

          // Assuming coordinates are in the format "latitude, longitude"
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
