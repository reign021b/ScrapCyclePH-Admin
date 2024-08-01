import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "/utils/supabase/client.ts";

const BookingSidebar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase.rpc(
          "get_sidebar_bookings_for_today"
        );

        if (error) throw error;

        console.log("Fetched Bookings:", data); // Log fetched bookings

        setBookings(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="booking-sidebar my-5">
      <ul>
        {bookings.map((booking, index) => (
          <li key={index}>
            <div className="rounded-lg container m-0 p-0">
              <div className="flex my-5">
                <div className="ml-3 pl-3 pr-4">
                  <Image
                    src={booking.avatar_url}
                    alt={booking.full_name}
                    width={68}
                    height={68}
                    layout="fixed"
                    className="rounded-2xl"
                  />
                </div>
                <div className="justify-center items-center my-auto">
                  <h3 className="text-black font-semibold text-[21px]">
                    {booking.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 w-full">
                    Phone : {booking.contact_number}
                  </p>
                </div>
              </div>
              <div
                className={`my-2 p-3 w-full grid grid-cols-2 pr-16 mb-5 ${
                  booking.status === "true" ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                <div className="font-semibold text-black text-right mr-3">
                  STATUS
                </div>
                <p
                  className={`${
                    booking.status === "true"
                      ? "text-green-500"
                      : "text-orange-500"
                  } text-[13px] grid w-fit px-8 font-semibold text-left rounded-full ${
                    booking.status === "true" ? "bg-green-100" : "bg-orange-100"
                  } w-full justify-left items-left pb-1`}
                >
                  {console.log("Booking Status:", booking.status)}{" "}
                  {/* Log each booking status */}
                  {booking.status === "true" ? "Completed" : "Incomplete"}
                </p>
              </div>

              <p className="font-semibold m-3 text-black">
                {booking.address_name}
              </p>

              <div className="text-sm grid grid-cols-2 border-b w-full pb-3 m-2">
                <p className="font-bold m-3 text-black">
                  Waste Type: <br />
                  <div className="text-gray-500 font-normal mt-1">
                    {booking.waste_type}
                  </div>
                </p>
                <p className="font-bold m-3 text-black">
                  Large Recyclables: <br />
                  <div className="font-normal text-gray-500 mt-1">
                    {booking.large_recyclables ? "Yes" : "No"}
                  </div>
                </p>
                <p className="font-bold m-3 text-black">
                  Item Types: <br />
                  <div className="font-normal text-gray-500 mt-1">
                    {booking.item_types.join(", ")}
                  </div>
                </p>
                <p className="font-bold m-3 text-black">
                  Estimated Weight: <br />
                  <div className="font-normal text-gray-500 mt-1">
                    {booking.weight_quantity} kg
                  </div>
                </p>
              </div>

              <ul className="mt-5">
                {booking.items.map((item, idx) => (
                  <li key={idx}>
                    <div className="px-5 flex w-full text-black">
                      <div className="w-6 my-1 font-semibold text-gray-500">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{item.item}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity.toLocaleString()} {item.unit}(s) @ ₱
                          {item.price.toLocaleString()}/{item.unit}
                        </p>
                      </div>
                      <div className="ml-auto my-auto">
                        <p>₱ {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    <br></br>
                  </li>
                ))}
              </ul>
              <br></br>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingSidebar;
