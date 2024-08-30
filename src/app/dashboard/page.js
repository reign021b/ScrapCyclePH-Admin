"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AppBar from "/src/app/components/AppBar";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";
import PieChart from "../components/PieChart";
import DatePicker from "react-datepicker";
import {
  parseISO,
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
} from "date-fns";
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
  const [selectedCity, setSelectedCity] = useState("Davao City");
  const [startDate, setStartDate] = useState(new Date());
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalCommission, setTotalCommission] = useState(Array(6).fill(0));
  const [totalBookingFee, setTotalBookingFee] = useState(Array(6).fill(0));
  const [totalPenalties, setTotalPenalties] = useState(Array(6).fill(0));
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateType, setSelectedDateType] = useState("monthly");
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDateTypeSelect = (dateType) => {
    setSelectedDateType(dateType);
    setIsOpen(false);
  };

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
        let dateRange;

        // Ensure startDate is a valid Date object
        const validStartDate =
          startDate instanceof Date && !isNaN(startDate.getTime())
            ? startDate
            : new Date();

        switch (selectedDateType || "monthly") {
          case "yearly":
            dateRange = eachYearOfInterval({
              start: new Date(validStartDate.getFullYear() - 5, 0, 1),
              end: new Date(validStartDate.getFullYear(), 11, 31),
            }).map((date) => format(date, "yyyy"));
            break;

          case "monthly":
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(
                  validStartDate.getFullYear(),
                  validStartDate.getMonth() - 5,
                  1
                )
              ),
              end: endOfMonth(validStartDate),
            }).map((date) => format(date, "yyyy-MM"));
            break;

          case "daily":
            dateRange = eachDayOfInterval({
              start: startOfDay(
                new Date(validStartDate.setDate(validStartDate.getDate() - 30))
              ),
              end: endOfDay(new Date()),
            }).map((date) => format(date, "yyyy-MM-dd"));
            break;

          case "weekly":
            dateRange = eachWeekOfInterval({
              start: startOfWeek(
                new Date(validStartDate.setDate(validStartDate.getDate() - 42)),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }).map((date) => ({
              start: format(date, "yyyy-MM-dd"),
              end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
            }));
            break;

          default:
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(
                  validStartDate.getFullYear(),
                  validStartDate.getMonth() - 5,
                  1
                )
              ),
              end: endOfMonth(validStartDate),
            }).map((date) => format(date, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc("get_total_payments");

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalPayments = data.reduce((acc, item) => {
          const itemDate = new Date(item.schedule_date);

          // Convert itemDate to format for comparison
          const formattedItemDate = format(itemDate, "yyyy-MM-dd");
          const formattedStartDate = format(validStartDate, "yyyy-MM-dd");

          const isMatchingDate =
            selectedDateType === "daily"
              ? formattedItemDate === formattedStartDate
              : selectedDateType === "monthly"
              ? format(itemDate, "yyyy-MM") ===
                format(validStartDate, "yyyy-MM")
              : selectedDateType === "yearly"
              ? format(itemDate, "yyyy") === format(validStartDate, "yyyy")
              : false;

          return isMatchingDate && item.city === selectedCity
            ? acc + parseFloat(item.total_payment || 0)
            : acc;
        }, 0);

        setTotalPayments(totalPayments);
      } catch (error) {
        console.error("Error fetching total payments:", error.message || error);
        setTotalPayments(0); // Default to 0 in case of error
      }
    };

    const fetchTotalCommission = async () => {
      try {
        let dateRange;
        const currentDate = new Date(startDate);

        switch (selectedDateType || "monthly") {
          case "yearly":
            dateRange = eachYearOfInterval({
              start: new Date(currentDate.getFullYear() - 5, 0, 1),
              end: new Date(currentDate.getFullYear(), 11, 31),
            })
              .map((date) => format(date, "yyyy"))
              .slice(-6); // Limit to 6 years
            break;

          case "monthly":
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 5,
                  1
                )
              ),
              end: endOfMonth(currentDate),
            })
              .map((date) => format(date, "yyyy-MM"))
              .slice(-6); // Limit to 6 months
            break;

          case "daily":
            dateRange = eachDayOfInterval({
              start: startOfDay(
                new Date(currentDate.setDate(currentDate.getDate() - 5))
              ),
              end: endOfDay(new Date()),
            })
              .map((date) => format(date, "yyyy-MM-dd"))
              .slice(-6); // Limit to 6 days
            break;

          case "weekly":
            const weeks = eachWeekOfInterval({
              start: startOfWeek(
                new Date(currentDate.setDate(currentDate.getDate() - 42)),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }).map((date) => ({
              start: format(
                startOfWeek(date, { weekStartsOn: 1 }),
                "yyyy-MM-dd"
              ),
              end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
            }));
            dateRange = weeks.slice(-6); // Limit to 6 weeks
            break;

          default:
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 5,
                  1
                )
              ),
              end: endOfMonth(currentDate),
            })
              .map((date) => format(date, "yyyy-MM"))
              .slice(-6); // Default to 6 months
        }

        const { data, error } = await supabase.rpc(
          "get_total_commission_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalCommissions = dateRange.map((range) => {
          const rangeData = data.filter((item) => {
            if (selectedDateType === "weekly") {
              return (
                item.schedule_date >= range.start &&
                item.schedule_date <= range.end &&
                item.city === selectedCity
              );
            }
            return (
              (selectedDateType === "daily"
                ? item.schedule_date === range
                : format(new Date(item.schedule_date), "yyyy-MM") === range) &&
              item.city === selectedCity
            );
          });

          return rangeData.reduce(
            (acc, item) => acc + parseFloat(item.total_commission || 0),
            0
          );
        });

        setTotalCommission(totalCommissions);
      } catch (error) {
        console.error(
          "Error fetching total commission:",
          error.message || error
        );
        setTotalCommission(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalBookingFee = async () => {
      try {
        let dateRange;

        switch (selectedDateType || "monthly") {
          case "yearly":
            dateRange = eachYearOfInterval({
              start: new Date(startDate.getFullYear() - 5, 0, 1),
              end: new Date(startDate.getFullYear(), 11, 31),
            }).map((date) => format(date, "yyyy"));
            break;

          case "monthly":
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
            break;

          case "daily":
            dateRange = eachDayOfInterval({
              start: startOfDay(
                new Date(startDate.setDate(startDate.getDate() - 30))
              ),
              end: endOfDay(new Date()),
            }).map((date) => format(date, "yyyy-MM-dd"));
            break;

          case "weekly":
            dateRange = eachWeekOfInterval({
              start: startOfWeek(
                new Date(startDate.setDate(startDate.getDate() - 42)),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }).map((date) => ({
              start: format(date, "yyyy-MM-dd"),
              end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
            }));
            break;

          default:
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_booking_fee_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalBookingFees = dateRange.map((range) => {
          if (selectedDateType === "weekly") {
            const weekData = data.filter(
              (item) =>
                item.schedule_date >= range.start &&
                item.schedule_date <= range.end &&
                item.city === selectedCity
            );
            return weekData.reduce(
              (acc, item) => acc + parseFloat(item.total_booking_fee || 0),
              0
            );
          } else {
            const rangeData = data.filter(
              (item) =>
                (selectedDateType === "daily"
                  ? item.schedule_date === range
                  : format(new Date(item.schedule_date), "yyyy-MM") ===
                    range) && item.city === selectedCity
            );
            return rangeData.reduce(
              (acc, item) => acc + parseFloat(item.total_booking_fee || 0),
              0
            );
          }
        });

        setTotalBookingFee(totalBookingFees);
      } catch (error) {
        console.error(
          "Error fetching total booking fees:",
          error.message || error
        );
        setTotalBookingFee(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalPenalties = async () => {
      try {
        let dateRange;

        switch (selectedDateType || "monthly") {
          case "yearly":
            dateRange = eachYearOfInterval({
              start: new Date(startDate.getFullYear() - 5, 0, 1),
              end: new Date(startDate.getFullYear(), 11, 31),
            }).map((date) => format(date, "yyyy"));
            break;

          case "monthly":
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
            break;

          case "daily":
            dateRange = eachDayOfInterval({
              start: startOfDay(
                new Date(startDate.setDate(startDate.getDate() - 30))
              ),
              end: endOfDay(new Date()),
            }).map((date) => format(date, "yyyy-MM-dd"));
            break;

          case "weekly":
            dateRange = eachWeekOfInterval({
              start: startOfWeek(
                new Date(startDate.setDate(startDate.getDate() - 42)),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }).map((date) => ({
              start: format(date, "yyyy-MM-dd"),
              end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
            }));
            break;

          default:
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_penalties_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalPenalties = dateRange.map((range) => {
          if (selectedDateType === "weekly") {
            const weekData = data.filter(
              (item) =>
                item.schedule_date >= range.start &&
                item.schedule_date <= range.end &&
                item.city === selectedCity
            );
            return weekData.reduce(
              (acc, item) => acc + parseFloat(item.total_penalties || 0),
              0
            );
          } else {
            const rangeData = data.filter(
              (item) =>
                (selectedDateType === "daily"
                  ? item.schedule_date === range
                  : format(new Date(item.schedule_date), "yyyy-MM") ===
                    range) && item.city === selectedCity
            );
            return rangeData.reduce(
              (acc, item) => acc + parseFloat(item.total_penalties || 0),
              0
            );
          }
        });

        setTotalPenalties(totalPenalties);
      } catch (error) {
        console.error(
          "Error fetching total penalties:",
          error.message || error
        );
        setTotalPenalties(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalReceivables = async () => {
      try {
        let dateRange;

        switch (selectedDateType || "monthly") {
          case "yearly":
            dateRange = eachYearOfInterval({
              start: new Date(startDate.getFullYear() - 5, 0, 1),
              end: new Date(startDate.getFullYear(), 11, 31),
            }).map((date) => format(date, "yyyy"));
            break;

          case "monthly":
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
            break;

          case "daily":
            dateRange = eachDayOfInterval({
              start: startOfDay(
                new Date(startDate.setDate(startDate.getDate() - 30))
              ),
              end: endOfDay(new Date()),
            }).map((date) => format(date, "yyyy-MM-dd"));
            break;

          case "weekly":
            dateRange = eachWeekOfInterval({
              start: startOfWeek(
                new Date(startDate.setDate(startDate.getDate() - 42)),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(new Date(), { weekStartsOn: 1 }),
            }).map((date) => ({
              start: format(date, "yyyy-MM-dd"),
              end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
            }));
            break;

          default:
            dateRange = eachMonthOfInterval({
              start: startOfMonth(
                new Date(startDate.getFullYear(), startDate.getMonth() - 5, 1)
              ),
              end: endOfMonth(startDate),
            }).map((date) => format(date, "yyyy-MM"));
        }

        const { data, error } = await supabase.rpc(
          "get_total_receivables_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalReceivables = dateRange.reduce((acc, range) => {
          const filteredData = data.filter((item) => {
            if (selectedDateType === "weekly") {
              return (
                item.schedule_date >= range.start &&
                item.schedule_date <= range.end &&
                item.city === selectedCity
              );
            }
            return (
              (selectedDateType === "daily"
                ? item.schedule_date === range
                : format(new Date(item.schedule_date), "yyyy-MM") === range) &&
              item.city === selectedCity
            );
          });
          return (
            acc +
            filteredData.reduce(
              (sum, item) => sum + parseFloat(item.total_receivables || 0),
              0
            )
          );
        }, 0);

        setTotalReceivables(totalReceivables);
      } catch (error) {
        console.error(
          "Error fetching total receivables:",
          error.message || error
        );
        setTotalReceivables(0); // Default to 0 in case of error
      }
    };

    const fetchTotalRecentPayments = async () => {
      try {
        const dateType = selectedDateType || "monthly";

        let formattedStartDate, formattedEndDate;

        switch (dateType) {
          case "yearly":
            formattedStartDate = format(startOfYear(startDate), "yyyy-01-01");
            formattedEndDate = format(endOfYear(startDate), "yyyy-12-31");
            break;
          case "monthly":
            formattedStartDate = format(startOfMonth(startDate), "yyyy-MM-dd");
            formattedEndDate = format(endOfMonth(startDate), "yyyy-MM-dd");
            break;
          case "daily":
            formattedStartDate = format(startDate, "yyyy-MM-dd");
            formattedEndDate = format(startDate, "yyyy-MM-dd");
            break;
          case "weekly":
            const startOfWeekDate = startOfWeek(startDate, { weekStartsOn: 1 });
            const endOfWeekDate = endOfWeek(startDate, { weekStartsOn: 1 });
            formattedStartDate = format(startOfWeekDate, "yyyy-MM-dd");
            formattedEndDate = format(endOfWeekDate, "yyyy-MM-dd");
            break;
          default:
            formattedStartDate = format(startOfMonth(startDate), "yyyy-MM-dd");
            formattedEndDate = format(endOfMonth(startDate), "yyyy-MM-dd");
        }

        const { data, error } = await supabase.rpc(
          "get_total_recent_payments_for_dashboard"
        );

        if (error) throw error;

        // Assuming the data format is correct, proceed to filter and sort
        const filteredData = data.filter(
          (item) =>
            item.city === selectedCity &&
            format(parseISO(item.schedule_date), "yyyy-MM") ===
              format(startDate, "yyyy-MM")
        );

        const sortedPayments = filteredData.sort(
          (a, b) => new Date(b.schedule_date) - new Date(a.schedule_date)
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
        setLoading(false);
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
        fetchTotalReceivables();
        fetchTotalRecentPayments();
      }
    };

    checkUser();

    const interval = setInterval(() => {
      fetchTotalPayments();
      fetchTotalCommission();
      fetchTotalBookingFee();
      fetchTotalPenalties();
      fetchTotalReceivables();
      fetchTotalRecentPayments();
    }, 8000);

    return () => clearInterval(interval);
  }, [router, selectedCity, startDate]);

  const paidPercentage =
    (totalPayments / (totalReceivables + totalPayments)) * 100 || 0;

  return (
    <main className="text-gray-700 bg-white h-screen">
      {loading ? (
        <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center">
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
          <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
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
                className="items-center flex border rounded-xl px-3 py-[6px] mr-4 hover:bg-gray-100"
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

              <button className="items-center flex border rounded-xl px-3 py-[6px] mr-4 hover:bg-gray-100">
                <FaBuilding />
                <div>
                  <p className="px-4 text-xs font-semibold">All Junkshops</p>
                </div>
              </button>
              <div className="items-start justify-center flex">
                <button
                  onClick={handleDropdownToggle}
                  className="items-center flex border rounded-xl rounded-e-none px-3 py-[6px] bg-white border-gray-300 hover:bg-gray-100"
                >
                  <div className="pl-3 py-[6px]">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="px-4 text-xs font-semibold">
                      {selectedDateType}
                    </p>
                  </div>
                  <div className="pl-2">
                    <FaChevronDown />
                  </div>
                </button>
                {isOpen && (
                  <div className="absolute right-38 top-9 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10]">
                    <ul className="text-sm text-center">
                      {["yearly", "monthly", "weekly", "daily"].map(
                        (dateType) => (
                          <li
                            key={dateType}
                            onClick={() => handleDateTypeSelect(dateType)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {dateType}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div
                className="flex justify-center
                 items-center border border-l-0 border-gray-300 rounded-xl rounded-s-none py-[6px] mr-4"
                style={{ width: "150px" }}
              >
                <div className="">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    className="px-2 text-xs font-semibold text-center w-[120px] items-center mb-1"
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
