import { useState, useEffect } from "react";
import { FaCheck, FaChevronDown, FaTimes } from "react-icons/fa";
import { supabase } from "/utils/supabase/client";
import ProfileImage from "./ProfileImage";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { IoMdCalendar } from "react-icons/io";
import { format, endOfToday } from "date-fns";
import { FiEdit } from "react-icons/fi";
import { MdOutlineNoteAdd } from "react-icons/md";

const BookingSidebar = ({ activeCity, selectedBookingId, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedLiners, setSelectedLiners] = useState({});
  const [assignedLiners, setAssignedLiners] = useState(new Map());
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const selectedBooking = bookings.find(
      (booking) => booking.id === selectedBookingId
    );
    if (selectedBooking) {
      if (selectedBooking.schedule) {
        setStartDate(new Date(selectedBooking.schedule));
      }
      setNote(selectedBooking.notes || "");
      setIsEditing(!selectedBooking.notes);
    }
  }, [selectedBookingId, bookings]);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleAddOrUpdateNote = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ notes: note })
        .eq("id", selectedBookingId);

      if (error) throw error;

      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, notes: note }
            : booking
        )
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error adding/updating note:", error);
    }
  };

  const handleEditNote = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    const selectedBooking = bookings.find(
      (booking) => booking.id === selectedBookingId
    );
    if (selectedBooking && selectedBooking.schedule_datetime) {
      setStartDate(new Date(selectedBooking.schedule_datetime));
    }
  }, [selectedBookingId, bookings]);

  const handleDateChange = (date) => {
    if (date && selectedBookingId) {
      // Find the selected booking
      const selectedBooking = bookings.find(
        (booking) => booking.id === selectedBookingId
      );

      if (selectedBooking && selectedBooking.schedule_datetime) {
        // Parse the existing datetime
        const existingDate = new Date(selectedBooking.schedule_datetime);

        // Create a new date object combining the new date with the existing time
        const newDate = new Date(date);
        newDate.setUTCHours(existingDate.getUTCHours());
        newDate.setUTCMinutes(existingDate.getUTCMinutes());
        newDate.setUTCSeconds(existingDate.getUTCSeconds());
        newDate.setUTCMilliseconds(existingDate.getUTCMilliseconds());

        // Format the new date to match your database format
        const formattedDate = newDate.toISOString();

        // Update the state
        setStartDate(newDate);
        setIsOpen(false);

        // Update the database
        updateBookingInDatabase(selectedBookingId, formattedDate)
          .then(() => {
            console.log("Booking updated successfully");
            handleClose();
          })
          .catch((error) => {
            console.error("Failed to update booking:", error);
            // Handle the error (e.g., show an error message to the user)
            alert("Failed to update booking. Please try again.");
          });
      } else {
        console.error("Selected booking or schedule_datetime not found");
      }
    } else {
      console.error("Date or selectedBookingId is missing");
    }
  };

  const updateBookingInDatabase = async (bookingId, newDateTime) => {
    const formattedDateTime = newDateTime.replace("T", " ").replace("Z", "");

    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({ schedule: formattedDateTime })
        .eq("id", bookingId)
        .single();

      if (error) throw error;

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, ...data } : booking
        )
      );

      return data;
    } catch (error) {
      console.error("Error updating booking:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchDropdownOptions(); // Fetch dropdown options when selectedBookingId changes
    fetchBookings(); // Fetch bookings when selectedBookingId changes
  }, [selectedBookingId]);

  const fetchDropdownOptions = async () => {
    try {
      const { data, error } = await supabase.rpc("get_liner_dropdown");

      if (error) {
        console.error("Error fetching dropdown options:", error.message);
        return;
      }

      // Filter options by activeCity
      const filteredOptions = data.filter(
        (option) => option.city === activeCity
      );

      setDropdownOptions(filteredOptions || []);

      // Create a map of dropdown options by their ID
      const dropdownMap = new Map(
        filteredOptions.map((option) => [option.id, option])
      );
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
        "get_sidebar_bookings_for_today"
      );

      if (error) {
        console.error("Error fetching bookings:", error.message);
        setLoading(false);
        return;
      }
      setBookings(data);

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
    <div className="booking-sidebar relative">
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
              Phone: {selectedBooking["phone_number"]}
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
              {(() => {
                const currentLiner = selectedLiners[selectedBooking.id];
                const assignedLinerId = assignedLiners.get(selectedBooking.id);
                const assignedLiner = dropdownOptions.find(
                  (option) => option.id === assignedLinerId
                );

                if (currentLiner) {
                  return `${currentLiner.full_name} (${currentLiner.business_name})`;
                }
                if (assignedLiner) {
                  return `${assignedLiner.full_name || "Unknown"} (${
                    assignedLiner.business_name || "Unknown"
                  })`;
                }
                return "Assign Liner";
              })()}
            </span>
            <FaChevronDown className="w-4 h-4" />
          </button>

          {dropdownOpen === selectedBooking.id && (
            <div className="absolute w-2/3 bg-white border rounded-lg shadow-lg mt-1 z-10 top-8 left-28">
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
            selectedBooking.cancelled === true
              ? "bg-red-50"
              : selectedBooking.status === "true"
              ? "bg-green-50"
              : "bg-yellow-50"
          }`}
        >
          <div className="font-semibold text-black text-right mr-3">STATUS</div>
          <div
            className={`${
              selectedBooking.cancelled === true
                ? "text-red-500"
                : selectedBooking.status === "true"
                ? "text-green-500"
                : "text-orange-500"
            } text-[13px] grid w-fit px-8 font-semibold text-left rounded-full ${
              selectedBooking.cancelled === true
                ? "bg-red-100"
                : selectedBooking.status === "true"
                ? "bg-green-100"
                : "bg-orange-100"
            } justify-left items-center`}
          >
            {selectedBooking.cancelled === true
              ? "Cancelled"
              : selectedBooking.status === "true"
              ? "Completed"
              : "Incomplete"}
          </div>
        </div>

        <hr className="mb-3" />

        <div className="px-3 font-medium text-gray-900 mb-5">
          <div className="flex items-center justify-between">
            <p className="mr-2">Notes: </p>
            <div>
              {isEditing ? (
                <>
                  <div className="flex justify-between">
                    <textarea
                      className="border border-black w-[21rem] h-[5rem] rounded-xl border-r-0 rounded-r-none p-2"
                      style={{ resize: "none" }}
                      value={note}
                      onChange={handleNoteChange}
                    ></textarea>
                    <div className="min-h-[5rem] flex items-center border border-black border-l-0 rounded-2xl rounded-l-none p-2">
                      <button
                        className="bg-green-400 p-2 rounded-xl border border-gray-600"
                        onClick={handleAddOrUpdateNote}
                      >
                        {selectedBooking?.notes ? (
                          <FaCheck />
                        ) : (
                          <MdOutlineNoteAdd />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex ">
                    <div className="w-[21rem] min-h-[5rem] rounded-xl border-r-0 rounded-r-none flex items-center px-2">
                      <p>{selectedBooking?.notes}</p>
                    </div>
                    <div className="min-h-[5rem] flex items-center border-l-0 rounded-2xl rounded-l-none p-2">
                      <button
                        className=" bg-yellow-300 p-2 rounded-xl border border-gray-600"
                        onClick={handleEditNote}
                      >
                        <FiEdit />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <hr className="mt-2 mb-3" />

        {selectedBooking.cancelled_reason && (
          <>
            <div className="text-center w-full text-black mb-4">
              <span className="font-semibold">Reason: </span>
              {selectedBooking.cancelled_reason}
            </div>
            <hr />
          </>
        )}
        {selectedBooking.image_path && (
          <div className="flex justify-center w-full mt-2">
            <Image
              src={`https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/${selectedBooking.image_path}`}
              width={300}
              height={300}
              alt="booking image"
              style={{ borderRadius: "0.8rem" }}
            />{" "}
          </div>
        )}
        <hr className="mt-5" />
        <div className="font-semibold m-3 text-black">
          <span className="text-sm font-normal">Schedule Time: </span>
          {selectedBooking.schedule_time}
        </div>
        <div className="flex m-3 text-black items-center">
          <span className="text-sm font-normal">Schedule Date: </span>
          <div className="">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="h-[42px] bg-white hover:bg-neutral-100 border border-gray-400 ml-3 px-4 py-2 rounded-md flex items-center"
            >
              <IoMdCalendar className="text-2xl" />
              <p className="text-sm mx-2">
                {format(startDate, "MMMM d, yyyy")}
              </p>
              <FaChevronDown className="text-xs" />
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  inline
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            )}
          </div>
        </div>
        <div className="font-semibold m-3 text-black">
          <span className="text-sm font-normal">Payment Method: </span>
          {selectedBooking.payment_method}
        </div>
        {selectedBooking.gcash_number && (
          <div className="font-semibold m-3 text-black">
            <span className="text-sm font-normal">GCash Number: </span>
            {selectedBooking.gcash_number}
          </div>
        )}
        <div className="font-semibold m-3 text-black">
          <span className="text-sm font-normal">Address: </span>{" "}
          {selectedBooking.address_name}
        </div>
        <div className="font-semibold m-3 text-black">
          <span className="text-sm font-normal">Coordinates: </span>{" "}
          {selectedBooking.coordinates.replace(/{|}/g, "")}
        </div>
        <hr className="mt-5" />
        <div className="text-sm grid grid-cols-2 border-b w-full pb-3 m-2">
          <div className="font-bold m-3 text-black">
            Waste Type: <br />
            <p className="text-gray-500 font-normal mt-1">
              {selectedBooking["waste_type"]}
            </p>
          </div>

          <div className="font-bold m-3 text-black">
            Large Recyclables: <br />
            <p className="font-normal text-gray-500 mt-1">
              {selectedBooking.large_recyclables ? "Yes" : "No"}
            </p>
          </div>
          <div className="font-bold m-3 text-black">
            Item Types: <br />
            <p className="font-normal text-gray-500 mt-1">
              {selectedBooking["item_types"]?.join(", ")}
            </p>
          </div>
          <div className="font-bold m-3 text-black">
            Estimated Weight: <br />
            <p className="font-normal text-gray-500 mt-1">
              {selectedBooking["estimated_weight"]}
            </p>
          </div>
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
        {selectedBooking.items.length === 0 && <hr className="mt-5" />}
        {selectedBooking.commission && (
          <div className="m-5 mx-32 text-sm text-black flex justify-between">
            Commission:{" "}
            <span className="font-semibold">{selectedBooking.commission}</span>
          </div>
        )}
        {selectedBooking.booking_fee && selectedBooking.items.length > 0 && (
          <div className="m-5 mx-32 text-sm text-black flex justify-between">
            Booking Fee:{" "}
            <span className="font-semibold">{selectedBooking.booking_fee}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSidebar;
