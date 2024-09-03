import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css"; // Import the CSS for the fullscreen plugin
import { supabase } from "@/utils/supabase/client";

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
      require("leaflet-fullscreen"); // Import the fullscreen plugin

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

  const createBookingIcon = (iconUrl, size, shadowColor = null) => {
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
      console.error("Error creating booking icon:", error);
      return null;
    }
  };

  const createCollectorIcon = (
    baseIconUrl,
    baseSize,
    fillColor,
    topIconUrl = null,
    topIconSize = null,
    topIconYOffset = 0
  ) => {
    if (!L) return null;

    try {
      const baseSizeActual = baseSize || [40, 40];
      const topSizeActual = topIconSize || [30, 30];

      // Embed the SVG with dynamic fill color support
      const svgContent = `
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
             width="${baseSizeActual[0]}px" height="${baseSizeActual[1]}px" viewBox="0 0 282 402"
             preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0,402) scale(0.1,-0.1)"
             fill="currentColor" stroke="none">
            <path d="M1227 4010 c-163 -19 -363 -85 -512 -171 -362 -208 -601 -536 -691
            -949 -25 -115 -25 -385 0 -518 108 -582 545 -1355 1240 -2195 l131 -158 39 43
            c74 82 293 353 398 493 593 791 924 1468 964 1975 14 183 -34 459 -110 638
            -178 414 -543 717 -986 818 -120 27 -344 39 -473 24z m275 -901 c215 -45 376
            -230 395 -454 23 -282 -212 -535 -497 -535 -220 0 -427 159 -482 369 -94 361
            221 696 584 620z"/>
          </g>
        </svg>
      `;

      const html = `
        <div style="
          position: relative;
          width: ${baseSizeActual[0]}px;
          height: ${baseSizeActual[1]}px;
          color: ${fillColor}; /* Set the fill color dynamically */
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          ">
            ${svgContent}
          </div>
          ${
            topIconUrl
              ? `
            <img src="${topIconUrl}" 
                 style="
                   position: absolute;
                   top: ${topIconYOffset}px;
                   left: ${(baseSizeActual[0] - topSizeActual[0]) / 2}px;
                   width: ${topSizeActual[0]}px;
                   height: ${topSizeActual[1]}px;
                 "
            />
          `
              : ""
          }
        </div>
      `;

      return L.divIcon({
        className: "custom-marker-icon",
        html: html,
        iconSize: baseSizeActual,
        iconAnchor: [baseSizeActual[0] / 2, baseSizeActual[1]],
        popupAnchor: [0, -baseSizeActual[1]],
      });
    } catch (error) {
      console.error("Error creating collector icon:", error);
      return null;
    }
  };

  const getBookingIcon = (booking) => {
    if (!L) return null;

    const shadowColor =
      linerAndCollectorIdToShadowColor[booking.liner_id] || null;

    if (booking.cancelled === true) {
      return createBookingIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/cancelled-gif.gif",
        [32, 32],
        shadowColor
      );
    } else if (booking.liner_id === null) {
      return createBookingIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/assign-liner.gif",
        [42, 40]
      );
    } else if (booking.status === "true") {
      return createBookingIcon(
        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/among-us-marker/completed-gif.gif",
        [35, 40],
        shadowColor
      );
    } else {
      return createBookingIcon(
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
        fullscreenControl={true} // Enable fullscreen control
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
          const icon = getBookingIcon(booking);

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
          const fillColor =
            linerAndCollectorIdToShadowColor[collector.collector_id] || null;

          const icon = createCollectorIcon(
            "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/dashboard/CollectorBaseIcon.svg",
            [33, 48], // Base icon size
            fillColor, // Use dynamic fill color
            "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/dashboard/CollectorTopIcon.png",
            [26, 26], // Top icon size
            5 // Y-offset of the top icon

          );

          return (
            <Marker
              key={collector.collector_id}
              position={leafletCoordinates}
              icon={icon}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
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
