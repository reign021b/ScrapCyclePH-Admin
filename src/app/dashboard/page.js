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
import CommissionCard from "./components/CommissionCard";
import BookingFeeCard from "./components/BookingFeeCard";
import PenaltiesCard from "./components/PenaltiesCard";

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
  const [totalCommission, setTotalCommission] = useState(Array(6).fill(0));
  const [totalBookingFee, setTotalBookingFee] = useState(Array(6).fill(0));
  const [totalPenalties, setTotalPenalties] = useState(Array(6).fill(0));
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
        const months = [];
        const currentMonth = new Date(startDate);

        // Generate an array of months from 5 months ago to the current month
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentMonth);
          month.setMonth(month.getMonth() - i);
          months.push(format(month, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_commission_for_dashboard"
        );
        if (error) throw error;

        // Filter the data based on the months array
        const filteredData = data.filter((item) => months.includes(item.month));

        // Calculate the total commission for each month
        const totalCommissions = months.map((month) => {
          const monthData = filteredData.filter((item) => item.month === month);
          return monthData.reduce(
            (acc, item) => acc + parseFloat(item.total_commission || 0),
            0
          );
        });

        setTotalCommission(totalCommissions);
      } catch (error) {
        console.error("Error fetching total commission:", error);
        setTotalCommission(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalBookingFee = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const months = [];
        const currentMonth = new Date(startDate);

        // Generate an array of months from 5 months ago to the current month
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentMonth);
          month.setMonth(month.getMonth() - i);
          months.push(format(month, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_booking_fee_for_dashboard"
        );
        if (error) throw error;

        // Filter the data based on the months array
        const filteredData = data.filter((item) => months.includes(item.month));

        // Calculate the total booking fee for each month
        const totalBookingFees = months.map((month) => {
          const monthData = filteredData.filter((item) => item.month === month);
          return monthData.reduce(
            (acc, item) => acc + parseFloat(item.total_booking_fee || 0),
            0
          );
        });

        setTotalBookingFee(totalBookingFees);
      } catch (error) {
        console.error("Error fetching total booking fees:", error);
        setTotalBookingFee(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalPenalties = async () => {
      try {
        const formattedMonth = format(startDate, "yyyy-MM");
        const months = [];
        const currentMonth = new Date(startDate);

        // Generate an array of months from 5 months ago to the current month
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentMonth);
          month.setMonth(month.getMonth() - i);
          months.push(format(month, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_penalties_for_dashboard"
        );
        if (error) throw error;

        // Filter the data based on the months array and selected city
        const filteredData = data.filter(
          (item) => months.includes(item.month) && item.city === selectedCity
        );

        // Calculate the total penalties for each month
        const totalPenalties = months.map((month) => {
          const monthData = filteredData.filter((item) => item.month === month);
          return monthData.reduce(
            (acc, item) => acc + parseFloat(item.total_penalties || 0),
            0
          );
        });

        setTotalPenalties(totalPenalties);
      } catch (error) {
        console.error("Error fetching total penalties:", error);
        setTotalPenalties(Array(6).fill(0)); // Default to array of 0 in case of error
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

  const paidPercentage =
    (totalPayments / (totalReceivables + totalPayments)) * 100 || 0;

  return (
    <main className="text-gray-700 bg-white h-screen">
      {loading ? (
        <div class="flex gap-2 w-screen h-screen m-auto justify-center items-center">
          <div class="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div class="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div class="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        </div>
      ) : (
        <>
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
                <div className="flex">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    className="px-2 text-xs font-semibold w-full text-center"
                    popperPlacement="bottom-end"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="justify-center items-center mx-auto max-w-[1440px]">
            <div className="px-5 py-4">
              <p className="text-3xl font-semibold">
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
              <div className="">
                {loading ? (
                  <p className="text-xs font-semibold text-center">
                    Loading...
                  </p>
                ) : recentPayments.length > 0 ? (
                  <p className="text-xs font-semibold">
                    Last transaction:{" "}
                    <span className="text-[#2F80ED] font-semibold">
                      +₱{recentPayments[0].total_amount.toFixed(2)}
                    </span>{" "}
                    from {recentPayments[0].junkshop} •{" "}
                    {recentPayments[0].datetime}
                  </p>
                ) : (
                  <p className="text-xs font-semibold">
                    No recent payments found.
                  </p>
                )}
              </div>
            </div>

            <div className="flex grid-cols-3 w-full px-5 pb-5">
              {/* Column 1 */}
              <div className="mr-5 w-full">
                {/* Start Row 1 */}
                <CommissionCard totalCommission={totalCommission} />
                {/* End Row 1 */}

                {/* Start Row 2 */}
                <BookingFeeCard totalBookingFee={totalBookingFee} />

                {/* End Row 2 */}

                {/* Start Row 3 */}
                <PenaltiesCard totalPenalties={totalPenalties} />
                {/* End Row 3 */}
              </div>

              {/* Column 2 */}
              <div className="w-full mr-5">
                {/* Start Row 1 */}
                <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
                  <div className="px-5 py-3">
                    <p className="font-bold">Payments Breakdown</p>
                    <p className="text-xs pt-1">
                      This is your overview of the payments breakdown for this
                      month.
                    </p>
                  </div>
                </div>
                <div className="cols-span-1 w-full border rounded-b-xl border-t-0 mr-5 pt-3">
                  <div className="px-3 pb-3 w-full flex items-center justify-center">
                    <div>
                      <PieChart
                        totalPayments={totalPayments}
                        totalCommission={totalCommission[5]}
                        totalBookingFee={totalBookingFee[5]}
                        totalPenalties={totalPenalties[5]}
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
                        This is your overview of the unpaid payments for this
                        month.
                      </p>
                      <div className="flex items-end justify-between h-[85px]">
                        <p className="text-3xl font-semibold">
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
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="cols-span-1 w-full border justify-center rounded-b-xl border-t-0 flex">
                    <div className="flex items-end justify-center">
                      <div className="py-[17px]">
                        <div className="rounded-lg h-[22px] bg-gray-200 w-[400px] relative">
                          <div
                            className={`flex items-center justify-center text-[10px] text-gray-800 font-semibold rounded-lg h-[22px] bg-[#F2C94C] ${
                              paidPercentage === 0 ? "justify-start" : ""
                            }`}
                            style={{ width: `${paidPercentage}%` }}
                          >
                            {paidPercentage > 0 && (
                              <span className="drop-shadow-lg">{`${paidPercentage.toFixed(
                                2
                              )}%`}</span>
                            )}
                          </div>
                          {paidPercentage === 0 && (
                            <div className="flex justify-center">
                              <span className="drop-shadow-lg absolute text-center ml-2 text-[10px] text-gray-800 font-semibold">
                                0.00%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="w-full">
                <div className="cols-span-1 w-full border rounded-t-xl pt-3">
                  <div className="px-5 py-3">
                    <p className="font-bold">Recent Payments</p>
                    <p className="text-xs pt-1">
                      See latest payment transactions.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 border border-y-0 text-xs">
                  <div className="w-full col-span-1 py-3 pt-5">
                    <div className="pl-5">Junkshop</div>
                  </div>
                  <div className="w-full col-span-2 py-3 pt-5">
                    <div className="text-center w-full">Date & Time</div>
                  </div>
                  <div className="w-full col-span-1 py-3 pt-5">
                    <div className="text-center">Amount</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 border border-t-0 rounded-b-xl text-[11px] justify-center font-bold h-[564px] overflow-y-auto">
                  {loading ? (
                    <div className="col-span-3 text-center py-3">
                      Loading...
                    </div>
                  ) : recentPayments.length > 0 ? (
                    recentPayments.map((payment, index) => (
                      <React.Fragment key={index}>
                        <div className="w-full col-span-1 py-3">
                          <div className="pl-5">{payment.junkshop}</div>
                        </div>
                        <div className="w-full col-span-2 py-3">
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
                    <div className="col-span-4 text-center py-3">
                      No recent payments found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
