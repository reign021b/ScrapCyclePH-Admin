import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/utils/supabase/client"; // Import the Supabase client

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

const shadowColors = [
  "rgba(255, 0, 0, 1)", // Red
  "rgba(0, 0, 255, 1)", // Blue
  "rgba(0, 255, 0, 1)", // Green
  "rgba(255, 255, 0, 1)", // Yellow
  "rgba(128, 0, 128, 1)", // Purple
  "rgba(255, 165, 0, 1)", // Orange
  "rgba(255, 192, 203, 1)", // Pink
  "rgba(0, 255, 255, 1)", // Cyan
];

const Map = ({ bookings = [], setSelectedBookingId, activeCity, linerId }) => {
  const [L, setL] = useState(null);
  const [collectorLocations, setCollectorLocations] = useState([]);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    const fetchCollectorLocations = async () => {
      const { data, error } = await supabase.rpc("get_collector_location");
      if (error) {
        console.error("Error fetching collector locations:", error);
      } else {
        setCollectorLocations(data);
      }
    };

    // Initial fetch
    fetchCollectorLocations();

    // Set interval to fetch every 5 seconds
    const intervalId = setInterval(fetchCollectorLocations, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const defaultCenter = [7.093545, 125.599351];

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

  // Create a mapping from liner_id and collector_id to shadow color
  const linerAndCollectorIdToShadowColor = useMemo(() => {
    const mapping = {};
    let colorIndex = 0;

    // Create a combined set of unique liner_ids and collector_ids
    const uniqueIds = [
      ...new Set([
        ...bookings.map((booking) => booking.liner_id),
        ...collectorLocations.map((collector) => collector.collector_id),
      ]),
    ]
      .filter((id) => id) // Filter out undefined or null values
      .sort(); // Sort alphabetically

    // Assign colors to each unique ID
    uniqueIds.forEach((id) => {
      mapping[id] = shadowColors[colorIndex % shadowColors.length];
      colorIndex++;
    });

    return mapping;
  }, [bookings, collectorLocations]);

  const createIcon = (iconUrl, size, shadowColor = null) => {
    if (!L) return null;

    try {
      const shadowStyle = shadowColor
        ? `filter: drop-shadow(0px 2px 4px ${shadowColor});`
        : "";

      return L.divIcon({
        className: "custom-marker-icon",
        html: `<div style="
            background-image: url(${iconUrl}); 
            width: ${size[0]}px; 
            height: ${size[1]}px; 
            background-size: ${size[0]}px ${size[1]}px; 
            ${shadowStyle}
          "></div>`,
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

    const shadowColor =
      linerAndCollectorIdToShadowColor[booking.liner_id] || null;

    if (booking.cancelled === true) {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/cancelled-gif.gif",
        [32, 32],
        shadowColor
      );
    } else if (booking.liner_id === null) {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/assign-liner.gif",
        [42, 40]
      );
    } else if (booking.status === "true") {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/completed-gif.gif",
        [35, 40],
        shadowColor
      );
    } else {
      return createIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/pending-gif-2.gif",
        [35, 38],
        shadowColor
      );
    }
  };

  const handleMarkerClick = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  const filteredBookings = useMemo(() => {
    if (!linerId) return bookings;
    return bookings.filter((booking) => booking.liner_id === linerId);
  }, [bookings, linerId]);

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
        {filteredBookings.map((booking) => {
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
        {collectorLocations.map((collector) => {
          const [latitudeStr, longitudeStr] = collector.location.split(" ");
          const latitude = parseFloat(latitudeStr);
          const longitude = parseFloat(longitudeStr);

          if (isNaN(latitude) || isNaN(longitude)) {
            console.warn(
              `Invalid coordinates for collector ID: ${collector.collector_id}`
            );
            return null;
          }

          const leafletCoordinates = L.latLng(latitude, longitude);
          const shadowColor =
            linerAndCollectorIdToShadowColor[collector.collector_id] || null;

          return (
            <Marker
              key={collector.collector_id}
              position={leafletCoordinates}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
              icon={createIcon(
                "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/CollectorIcon.png",
                [40, 40],
                shadowColor // Use color mapping for collectors
              )}
            >
              <Popup>
                <p className="font-normal">
                  Collector Name:{<br />}
                  <span className="font-semibold">{collector.full_name}</span>
                </p>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
