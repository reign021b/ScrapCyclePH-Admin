"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AppBar from "/src/app/components/AppBar";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import PieChart from "../components/PieChart";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns"; // Import the format function
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  const router = useRouter();
  const [operatorName, setOperatorName] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState(null);
  const [cities, setCities] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Butuan City");
  const [startDate, setStartDate] = useState(new Date());
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalBookingFee, setTotalBookingFee] = useState(0);
  const [totalPenalties, setTotalPenalties] = useState(0);
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase.rpc("get_cities");
        if (error) throw error;
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchOperator = async (session) => {
      try {
        const { data: operator, error: operatorError } = await supabase
          .from("operators")
          .select("name, is_super_admin, profile_path")
          .eq("id", session.user.id)
          .single();

        if (operatorError) throw operatorError;

        setOperatorName(operator.name);
        setIsSuperAdmin(operator.is_super_admin);
        setProfilePath(operator.profile_path?.replace(/^'|'$/g, ""));
      } catch (error) {
        console.error("Error fetching operator data:", error);
      }
    };

    const fetchTotalPayments = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc("get_total_payments");
        if (error) throw error;

        // Filter the data based on selected city and month
        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );

        // Calculate the total payments for the selected city and month
        const total = filteredData.reduce(
          (acc, item) => acc + parseFloat(item.total_payment || 0),
          0
        );
        setTotalPayments(total);
      } catch (error) {
        console.error("Error fetching total payments:", error);
        setTotalPayments(0); // Default to 0 in case of error
      }
    };

    const fetchTotalCommission = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc(
          "get_total_commission_for_dashboard"
        );
        if (error) throw error;

        // Filter the data based on selected city and month
        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );

        // Calculate the total commission for the selected city and month
        const total = filteredData.reduce(
          (acc, item) => acc + parseFloat(item.total_commission || 0),
          0
        );
        setTotalCommission(total);
      } catch (error) {
        console.error("Error fetching total commission:", error);
        setTotalCommission(0); // Default to 0 in case of error
      }
    };

    const fetchTotalBookingFee = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc(
          "get_total_booking_fee_for_dashboard"
        );
        if (error) throw error;

        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );

        const total = filteredData.reduce(
          (acc, item) => acc + parseFloat(item.total_booking_fee || 0),
          0
        );
        setTotalBookingFee(total);
      } catch (error) {
        console.error("Error fetching total booking fee:", error);
        setTotalBookingFee(0); // Default to 0 in case of error
      }
    };

    const fetchTotalPenalties = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc(
          "get_total_penalties_for_dashboard"
        );
        if (error) throw error;

        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );

        const total = filteredData.reduce(
          (acc, item) => acc + parseFloat(item.total_penalties || 0),
          0
        );
        setTotalPenalties(total);
      } catch (error) {
        console.error("Error fetching total penalties:", error);
        setTotalPenalties(0); // Default to 0 in case of error
      }
    };

    const fetchTotalReceivables = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc(
          "get_total_receivables_for_dashboard"
        );
        if (error) throw error;

        // Filter the data based on selected city and month
        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );

        // Calculate the total receivables for the selected city and month
        const total = filteredData.reduce(
          (acc, item) => acc + parseFloat(item.total_receivables || 0),
          0
        );
        setTotalReceivables(total);
      } catch (error) {
        console.error("Error fetching total receivables:", error);
        setTotalReceivables(0); // Default to 0 in case of error
      }
    };

    const fetchTotalRecentPayments = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const formattedMonth = format(startDate, "yyyy-MM");
        const { data, error } = await supabase.rpc(
          "get_total_recent_payments_for_dashboard"
        );
        if (error) throw error;

        // Filter, sort, and format the data
        const filteredData = data.filter(
          (item) => item.city === selectedCity && item.month === formattedMonth
        );
        const sortedPayments = filteredData.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        const formattedPayments = sortedPayments.map((payment) => ({
          junkshop: payment.junkshop,
          datetime: format(
            parseISO(payment.datetime),
            "MMMM d, yyyy @ hh:mm a"
          ),
          total_amount: payment.total_amount,
        }));

        setRecentPayments(formattedPayments);
      } catch (error) {
        console.error("Error fetching recent payments:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTotalRecentPayments();

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        fetchOperator(session);
        fetchTotalPayments();
        fetchTotalCommission();
        fetchTotalBookingFee();
        fetchTotalPenalties();
        fetchTotalReceivables(); // Fetch total receivables when user is authenticated
        fetchTotalRecentPayments(); // Fetch recent payments data
      }
    };

    checkUser();
  }, [router, selectedCity, startDate]);

  const formattedDate = startDate ? format(startDate, "yyyy-MM") : "";

  return (
    <main className="text-gray-700 bg-white h-screen">
      <AppBar
        operatorName={operatorName}
        isSuperAdmin={isSuperAdmin}
        profilePath={profilePath}
      />
      <div className="flex justify-between items-center border border-t-0">
        <div className="pl-5 py-3">
          <p className="font-bold">Dashboard</p>
          <p className="text-sm">
            This is your overview of this month&apos;s performance.
          </p>
        </div>
        <div className="flex relative">
          <button
            className="items-center flex border rounded-xl px-3 py-[6px] mr-4"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaMapMarkerAlt />
            <p className="px-4 text-xs font-semibold">{selectedCity}</p>
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 text-sm text-center w-[145px] border bg-white shadow-lg z-10 rounded-xl">
              <ul className="list-none m-0 p-0">
                {cities.map((city, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSelectedCity(city.city);
                      setDropdownOpen(false);
                    }}
                  >
                    {city.city}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div
            className="flex items-center border rounded-xl px-3 py-[6px] mr-4"
            style={{ width: "170px" }}
          >
            <FaCalendarAlt />
            <div className="flex-1">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                className="px-4 text-xs font-semibold w-full text-center"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="justify-center items-center mx-auto max-w-[1440px]">
        <div className="px-5 py-4">
          <p className="text-3xl font-semibold pb-2">
            {/* Split the totalPayments value into integer and decimal parts */}
            {(() => {
              const [integerPart, decimalPart] = totalPayments
                .toFixed(2)
                .split(".");
              return (
                <>
                  ₱ {integerPart.toLocaleString()}
                  <span className="text-lg">.{decimalPart}</span>
                </>
              );
            })()}
          </p>
          <p className="text-xs font-semibold">
            Last transaction:{" "}
            <span className="text-blue-400 font-semibold">+₱3,560.50</span> from
            RC Junkshop • 2 mins ago
          </p>
        </div>

        <div className="flex grid-cols-3 w-full px-5 pb-5">
          {/* Column 1 */}
          <div className="mr-5 w-full">
            {/* Start Row 1 */}
            <div className="mb-4">
              <div className="cols-span-1 w-full border rounded-t-xl mr-5">
                <div className="w-full pt-3">
                  <div className="px-5 py-3">
                    <p className="font-bold">Commission</p>
                    <p className="text-xs">
                      This is your overview of this month&apos;s performance.
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-semibold">
                        {(() => {
                          const [integerPart, decimalPart] = totalCommission
                            .toFixed(2)
                            .split(".");
                          return (
                            <>
                              ₱ {integerPart.toLocaleString()}
                              <span className="text-lg">.{decimalPart}</span>
                            </>
                          );
                        })()}
                      </p>
                      <div className="flex items-end">
                        <div className="ml-4 pt-[20px]">
                          <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-green-600  w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[32px] bg-gray-300 hover:bg-green-600 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-green-600 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-green-600 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-green-600 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[66px] bg-green-600 hover:bg-green-600 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="cols-span-1 w-full border rounded-b-xl mr-5 border-t-0 flex">
                  <div className="text-[10px] py-4 pl-5 pr-2">
                    <div className="rounded-full bg-green-100 w-[55px] justify-center items-center flex py-1 text-green-600">
                      +8.15%
                    </div>
                  </div>
                  <div className="text-[10px] flex justify-center items-center">
                    Compared to previous month
                  </div>
                </div>
              </div>
            </div>
            {/* End Row 1 */}

            {/* Start Row 2 */}
            <div className="mb-4">
              <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
                <div className="w-full">
                  <div className="px-5 py-3">
                    <p className="font-bold">Booking Fee</p>
                    <p className="text-xs">
                      This is your overview of this month&apos;s performance.
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-semibold">
                        {(() => {
                          const [integerPart, decimalPart] = totalBookingFee
                            .toFixed(2)
                            .split(".");
                          return (
                            <>
                              ₱ {integerPart.toLocaleString()}
                              <span className="text-lg">.{decimalPart}</span>
                            </>
                          );
                        })()}
                      </p>
                      <div className="flex items-end">
                        <div className="ml-4 pt-[20px]">
                          <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-blue-500  w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[32px] bg-gray-300 hover:bg-blue-500 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-blue-500 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-blue-500 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-blue-500 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                        <div className="ml-2 pt-[20px]">
                          <div className="rounded-lg h-[66px] bg-blue-500 hover:bg-blue-500 w-[24px]">
                            &nbsp;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="cols-span-1 w-full border rounded-b-xl mr-5 border-t-0 flex">
                  <div className="text-[10px] py-4 pl-5 pr-2">
                    <div className="rounded-full bg-green-100 w-[55px] justify-center items-center flex py-1 text-green-600">
                      +8.15%
                    </div>
                  </div>
                  <div className="text-[10px] flex justify-center items-center">
                    Compared to previous month
                  </div>
                </div>
              </div>
            </div>

            {/* End Row 2 */}

            {/* Start Row 3 */}
            <div className="cols-span-1 w-full border rounded-t-xl mr-5">
              <div className="w-full pt-3">
                <div className="px-5 py-3">
                  <p className="font-bold">Penalties</p>
                  <p className="text-xs">
                    This is your overview of this month&apos;s performance.
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-semibold pb-2">
                      {(() => {
                        const [integerPart, decimalPart] = totalPenalties
                          .toFixed(2)
                          .split(".");
                        return (
                          <>
                            ₱ {integerPart.toLocaleString()}
                            <span className="text-lg">.{decimalPart}</span>
                          </>
                        );
                      })()}
                    </p>
                    <div className="flex items-end justify-between">
                      <div className="ml-4 pt-[20px]">
                        <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-red-600  w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[32px] bg-gray-300 hover:bg-red-600 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-red-600 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-red-600 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-red-600 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[66px] bg-red-600 hover:bg-red-600 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="cols-span-1 w-full border rounded-b-xl mr-5 border-t-0 flex">
                <div className="text-[10px] py-4 pl-5 pr-2">
                  <div className="rounded-full bg-green-100 w-[55px] justify-center items-center flex py-1 text-green-600">
                    +8.15%
                  </div>
                </div>
                <div className="text-[10px] flex justify-center items-center">
                  Compared to previous month
                </div>
              </div>
            </div>
            {/* End Row 3 */}
          </div>

          {/* Column 2 */}
          <div className="w-full mr-5">
            {/* Start Row 1 */}
            <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
              <div className="px-5 py-3">
                <p className="font-bold">Payments Breakdown</p>
                <p className="text-xs pt-1">See latest payment transactions.</p>
              </div>
            </div>
            <div className="cols-span-1 w-full border rounded-b-xl border-t-0 mr-5 pt-3">
              <div className="px-3 pb-3 w-full flex items-center justify-center">
                <div>
                  <PieChart
                    totalPayments={totalPayments}
                    totalCommission={totalCommission}
                    totalBookingFee={totalBookingFee}
                    totalPenalties={totalPenalties}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4"></div>
            {/* Start Row 2 */}
            <div className="cols-span-1 w-full border rounded-t-xl mr-5">
              <div className="w-full pt-3">
                <div className="px-5 py-3">
                  <p className="font-bold">Receivables</p>
                  <p className="text-xs">
                    This is your overview of this month&apos;s performance.
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-semibold pb-2">
                      {(() => {
                        const [integerPart, decimalPart] = totalReceivables
                          .toFixed(2)
                          .split(".");
                        return (
                          <>
                            ₱ {integerPart.toLocaleString()}
                            <span className="text-lg">.{decimalPart}</span>
                          </>
                        );
                      })()}
                    </p>
                    <div className="flex items-end">
                      <div className="ml-4 pt-[20px]">
                        <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-yellow-400  w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[32px] bg-gray-300 hover:bg-yellow-400 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-yellow-400 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[40px] bg-gray-300 hover:bg-yellow-400 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[52px] bg-gray-300 hover:bg-yellow-400 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                      <div className="ml-2 pt-[20px]">
                        <div className="rounded-lg h-[66px] bg-yellow-400 hover:bg-yellow-400 w-[24px]">
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="cols-span-1 w-full border rounded-b-xl mr-5 border-t-0 flex">
                <div className="text-[10px] py-4 pl-5 pr-2">
                  <div className="rounded-full bg-green-100 w-[55px] justify-center items-center flex py-1 text-green-600">
                    +8.15%
                  </div>
                </div>
                <div className="text-[10px] flex justify-center items-center">
                  Compared to previous month
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="w-full">
            <div className="cols-span-1 w-full border rounded-t-xl pt-3">
              <div className="px-5 py-3">
                <p className="font-bold">Recent Payments</p>
                <p className="text-xs pt-1">See latest payment transactions.</p>
              </div>
            </div>
            <div className="flex grid-cols-3 border border-y-0 text-xs">
              <div className="w-full col-span-1 py-3 pt-5">
                <div className="pl-5">Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3 pt-5">
                <div className="text-center w-full">Date & Time</div>
              </div>
              <div className="w-full col-span-1 py-3 pt-5">
                <div className="text-center">Amount</div>
              </div>
            </div>
            <div className="grid grid-cols-3 border border-t-0 rounded-b-xl text-[11px] justify-center font-bold h-[564px] overflow-y-auto">
              {loading ? (
                <div className="col-span-3 text-center py-3">Loading...</div>
              ) : recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <React.Fragment key={index}>
                    <div className="w-full col-span-1 py-3">
                      <div className="pl-5">{payment.junkshop}</div>
                    </div>
                    <div className="w-full col-span-1 py-3">
                      <div className="text-center w-full">
                        {payment.datetime}
                      </div>
                    </div>
                    <div className="w-full col-span-1 py-3">
                      <div className="text-center">
                        ₱ {payment.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="col-span-3 text-center py-3">
                  No recent payments found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
