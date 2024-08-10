import { useState, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { supabase } from "/utils/supabase/client";
import ProfileImage from "./ProfileImage";

const BookingSidebar = ({ selectedBookingId, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Store open state for specific booking
  const [selectedLiners, setSelectedLiners] = useState({}); // Map to track selected liners per booking
  const [assignedLiners, setAssignedLiners] = useState(new Map()); // Track assigned liners per booking
  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    fetchDropdownOptions(); // Initial fetch
    fetchBookings(); // Fetch bookings initially

    const intervalId = setInterval(fetchDropdownOptions, 8000); // Fetch dropdown options every 8 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Empty dependency array means this runs once on mount

  const fetchDropdownOptions = async () => {
    try {
      const { data, error } = await supabase.rpc("get_liner_dropdown");

      if (error) {
        console.error("Error fetching dropdown options:", error.message);
        return;
      }
      setDropdownOptions(data || []); // Ensure data is always an array

      // Create a map of dropdown options by their ID for quick lookup
      const dropdownMap = new Map(data.map((option) => [option.id, option]));
      setSelectedLiners((prevLiners) => {
        const updatedLiners = { ...prevLiners };
        bookings.forEach((booking) => {
          if (booking.liner_id && dropdownMap.has(booking.liner_id)) {
            updatedLiners[booking.id] = dropdownMap.get(booking.liner_id);
          }
        });
        return updatedLiners;
      });
    } catch (error) {
      console.error("Unexpected error in fetchDropdownOptions:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.rpc(
        "get_sidebar_bookings_for_today_ver2"
      );

      if (error) {
        console.error("Error fetching bookings:", error.message);
        setLoading(false);
        return;
      }
      setBookings(data);

      // Initialize assigned liners state based on fetched bookings
      const linersMap = new Map();
      data.forEach((booking) => {
        if (booking.liner_id) {
          linersMap.set(booking.id, booking.liner_id);
        }
      });
      setAssignedLiners(linersMap);
    } catch (error) {
      console.error("Unexpected error in fetchBookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownClick = (bookingId) => {
    setDropdownOpen(dropdownOpen === bookingId ? null : bookingId);
  };

  const handleOptionClick = async (bookingId, option) => {
    if (assignedLiners.has(bookingId)) {
      alert("This booking already has a liner assigned.");
      return;
    }

    setSelectedLiners((prev) => ({
      ...prev,
      [bookingId]: option,
    }));
    setAssignedLiners((prev) => new Map(prev).set(bookingId, option.id));

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ liner_id: option.id })
        .eq("id", bookingId);

      if (error) {
        console.error("Error updating booking:", error.message);
      } else {
        // Optionally refresh bookings or handle post-update logic
      }
    } catch (error) {
      console.error("Unexpected error in handleOptionClick:", error);
    }

    setDropdownOpen(null);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const selectedBooking = bookings.find(
    (booking) => booking.id === selectedBookingId
  );

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!selectedBooking) {
    return <div className="text-center"></div>;
  }

  return (
    <div className="booking-sidebar my-5 relative">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <FaTimes className="w-6 h-6" />
      </button>
      <div className="rounded-lg container m-0 p-0">
        <div className="flex my-5">
          <div className="ml-3 pl-3 pr-4">
            <ProfileImage fullName={selectedBooking.full_name || ""} />
          </div>
          <div className="justify-center items-center my-auto">
            <h3 className="text-black font-semibold text-[21px]">
              {selectedBooking.full_name}
            </h3>
            <p className="text-sm text-gray-500 w-full">
              Phone: {selectedBooking["Phone Number"]}
            </p>
          </div>
        </div>

        <div className="flex relative mb-4 justify-center items-center">
          <div className="font-semibold text-lg text-black pb-3 pr-3">
            Liner:{" "}
          </div>
          <button
            className="flex w-2/3 text-center items-center justify-center border border-green-500 rounded-2xl py-1 px-4 mb-4 text-black hover:bg-gray-100"
            onClick={() => handleDropdownClick(selectedBooking.id)}
          >
            <span className="mr-2">
              {selectedLiners[selectedBooking.id]
                ? `${selectedLiners[selectedBooking.id].full_name} (${
                    selectedLiners[selectedBooking.id].business_name
                  })`
                : assignedLiners.has(selectedBooking.id)
                ? `${
                    dropdownOptions.find(
                      (option) =>
                        option.id === assignedLiners.get(selectedBooking.id)
                    )?.full_name || "Unknown"
                  } (${
                    dropdownOptions.find(
                      (option) =>
                        option.id === assignedLiners.get(selectedBooking.id)
                    )?.business_name || "Unknown"
                  })`
                : "Assign Liner"}
            </span>
            <FaChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen === selectedBooking.id && (
            <div className="absolute w-1/2 bg-white border rounded-lg shadow-lg mt-1 z-10">
              <ul>
                {dropdownOptions.map((option) => (
                  <li
                    key={option.id}
                    onClick={() =>
                      handleOptionClick(selectedBooking.id, option)
                    }
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {option.full_name} ({option.business_name})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className={`my-2 p-3 w-full grid grid-cols-2 pr-16 mb-5 ${
            selectedBooking.cancelled
              ? "bg-red-50"
              : selectedBooking.status
              ? "bg-green-50"
              : "bg-yellow-50"
          }`}
        >
          <div className="font-semibold text-black text-right mr-3">STATUS</div>
          <p
            className={`${
              selectedBooking.cancelled
                ? "text-red-500"
                : selectedBooking.status
                ? "text-green-500"
                : "text-orange-500"
            } text-[13px] grid w-fit px-8 font-semibold text-left rounded-full ${
              selectedBooking.cancelled
                ? "bg-red-100"
                : selectedBooking.status
                ? "bg-green-100"
                : "bg-orange-100"
            } w--fit justify-left items-center`}
          >
            {selectedBooking.cancelled
              ? "Cancelled"
              : selectedBooking.status
              ? "Completed"
              : "Incomplete"}
          </p>
        </div>

        <p className="font-semibold m-3 text-black">
          {selectedBooking.address_name}
        </p>

        <div className="text-sm grid grid-cols-2 border-b w-full pb-3 m-2">
          <p className="font-bold m-3 text-black">
            Waste Type: <br />
            <div className="text-gray-500 font-normal mt-1">
              {selectedBooking["Waste Type"]}
            </div>
          </p>

          <p className="font-bold m-3 text-black">
            Large Recyclables: <br />
            <div className="font-normal text-gray-500 mt-1">
              {selectedBooking.large_recyclables ? "Yes" : "No"}
            </div>
          </p>
          <p className="font-bold m-3 text-black">
            Item Types: <br />
            <div className="font-normal text-gray-500 mt-1">
              {selectedBooking["Item Types"]?.join(", ")}
            </div>
          </p>
          <p className="font-bold m-3 text-black">
            Estimated Weight: <br />
            <div className="font-normal text-gray-500 mt-1">
              {selectedBooking["Estimated Weight"]} kg
            </div>
          </p>
        </div>

        <ul className="mt-5 text-sm">
          {selectedBooking.items.length > 0 ? (
            selectedBooking.items.map((item, idx) => (
              <li key={idx}>
                <div className="px-5 w-full text-black grid grid-cols-6 items-center justify-between">
                  <div className="col-span-1 w-1/12 text-gray-500 font-semibold">
                    {idx + 1}
                  </div>
                  <div className="col-span-4">
                    <h5 className="font-semibold">{item.item}</h5>
                    <p className="text-gray-500">
                      {item.quantity} {item.unit} @ ₱
                      {parseFloat(item.price)
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                      /{item.unit}
                    </p>
                  </div>
                  <div className="col-span-1 font-semibold text-right">
                    ₱
                    {(parseFloat(item.price) * parseFloat(item.quantity))
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                  </div>
                </div>
                <div className="text-center m-4 mt-0 text-gray-300 font-extralight">
                  _______________________________________________________________________________
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500">No items found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BookingSidebar;
