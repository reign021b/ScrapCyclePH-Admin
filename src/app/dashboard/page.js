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
  const [selectedCity, setSelectedCity] = useState("Tagum City");
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalCommission, setTotalCommission] = useState(Array(6).fill(0));
  const [totalBookingFee, setTotalBookingFee] = useState(Array(6).fill(0));
  const [totalPenalties, setTotalPenalties] = useState(Array(6).fill(0));
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedDateType, setSelectedDateType] = useState("monthly");
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (date) => {
    setStartDate(date);
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleDateTypeSelect = (dateType) => {
    setSelectedDateType(dateType);
    setIsOpen(false);
  };

  const getDatePickerProps = () => {
    switch (selectedDateType) {
      case "yearly":
        return {
          dateFormat: "yyyy",
          showYearPicker: true,
          showMonthYearPicker: false,
          showDayPicker: false,
        };
      case "monthly":
        return {
          dateFormat: "MMMM yyyy",
          showMonthYearPicker: true,
          showDayPicker: false,
        };
      case "weekly":
      case "daily":
        return {
          dateFormat: "MMMM d, yyyy",
          showMonthYearPicker: false,
          showDayPicker: true,
        };
      default:
        return {};
    }
  };

  const datePickerProps = getDatePickerProps();

  const getPeriodText = () => {
    switch (selectedDateType) {
      case "yearly":
        return "this year";
      case "monthly":
        return "this month";
      case "daily":
        return "today";
      case "weekly":
        return "this week";
      default:
        return "this month"; // Default to monthly if no valid type
    }
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
        // Ensure startDate is a valid Date object
        const validStartDate =
          startDate instanceof Date && !isNaN(startDate.getTime())
            ? startDate
            : new Date();

        const formattedStartDate = format(validStartDate, "yyyy-MM-dd");
        const formattedStartMonth = format(validStartDate, "yyyy-MM");
        const formattedStartYear = format(validStartDate, "yyyy");

        // Calculate weekly range based on the startDate
        const startOfWeekDate = startOfWeek(validStartDate, {
          weekStartsOn: 1,
        });
        const endOfWeekDate = endOfWeek(validStartDate, { weekStartsOn: 1 });

        const formattedStartOfWeek = format(startOfWeekDate, "yyyy-MM-dd");
        const formattedEndOfWeek = format(endOfWeekDate, "yyyy-MM-dd");

        const { data, error } = await supabase.rpc("get_total_payments");

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        const totalPayments = data.reduce((acc, item) => {
          const itemDate = new Date(item.schedule_date);
          const formattedItemDate = format(itemDate, "yyyy-MM-dd");

          let isMatchingDate = false;

          switch (selectedDateType) {
            case "daily":
              isMatchingDate = formattedItemDate === formattedStartDate;
              break;
            case "monthly":
              isMatchingDate =
                format(itemDate, "yyyy-MM") === formattedStartMonth;
              break;
            case "yearly":
              isMatchingDate = format(itemDate, "yyyy") === formattedStartYear;
              break;
            case "weekly":
              isMatchingDate =
                formattedItemDate >= formattedStartOfWeek &&
                formattedItemDate <= formattedEndOfWeek;
              break;
            default:
              isMatchingDate =
                format(itemDate, "yyyy-MM") === formattedStartMonth;
              break;
          }

          return isMatchingDate && item.city === selectedCity
            ? acc + parseFloat(item.total_payment || 0)
            : acc;
        }, 0);

        setTotalPayments(totalPayments);
      } catch (error) {
        console.error("Error fetching total payments:", error.message || error);
        setTotalPayments(0);
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
                new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000)
              ),
              end: endOfDay(currentDate),
            })
              .map((date) => format(date, "yyyy-MM-dd"))
              .slice(-6); // Limit to 6 days
            break;

          case "weekly":
            const weeks = eachWeekOfInterval({
              start: startOfWeek(
                new Date(currentDate.getTime() - 6 * 7 * 24 * 60 * 60 * 1000),
                { weekStartsOn: 1 }
              ),
              end: endOfWeek(currentDate, { weekStartsOn: 1 }),
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
            const itemDate = new Date(item.schedule_date);
            const formattedItemDate = format(itemDate, "yyyy-MM-dd");

            let isMatchingDate = false;
            switch (selectedDateType) {
              case "daily":
                isMatchingDate = formattedItemDate === range;
                break;
              case "monthly":
                isMatchingDate = format(itemDate, "yyyy-MM") === range;
                break;
              case "yearly":
                isMatchingDate = format(itemDate, "yyyy") === range;
                break;
              case "weekly":
                isMatchingDate =
                  formattedItemDate >= range.start &&
                  formattedItemDate <= range.end;
                break;
              default:
                isMatchingDate = format(itemDate, "yyyy-MM") === range;
                break;
            }

            return isMatchingDate && item.city === selectedCity;
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
        const currentDate = new Date(startDate);

        const getDateRange = () => {
          switch (selectedDateType || "monthly") {
            case "yearly":
              return eachYearOfInterval({
                start: new Date(currentDate.getFullYear() - 5, 0, 1),
                end: new Date(currentDate.getFullYear(), 11, 31),
              })
                .map((date) => format(date, "yyyy"))
                .slice(-6);

            case "monthly":
              return eachMonthOfInterval({
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
                .slice(-6);

            case "daily":
              return eachDayOfInterval({
                start: startOfDay(
                  new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000)
                ),
                end: endOfDay(currentDate),
              })
                .map((date) => format(date, "yyyy-MM-dd"))
                .slice(-6);

            case "weekly":
              return eachWeekOfInterval({
                start: startOfWeek(
                  new Date(currentDate.getTime() - 6 * 7 * 24 * 60 * 60 * 1000),
                  { weekStartsOn: 1 }
                ),
                end: endOfWeek(currentDate, { weekStartsOn: 1 }),
              })
                .map((date) => ({
                  start: format(
                    startOfWeek(date, { weekStartsOn: 1 }),
                    "yyyy-MM-dd"
                  ),
                  end: format(
                    endOfWeek(date, { weekStartsOn: 1 }),
                    "yyyy-MM-dd"
                  ),
                }))
                .slice(-6);

            default:
              return eachMonthOfInterval({
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
                .slice(-6);
          }
        };

        dateRange = getDateRange();

        const { data, error } = await supabase.rpc(
          "get_total_booking_fee_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        if (!data) {
          console.warn("No data returned from Supabase.");
          setTotalBookingFee(Array(dateRange.length).fill(0)); // Default to array of 0
          return;
        }

        const totalBookingFees = dateRange.map((range) => {
          const rangeData = data.filter((item) => {
            const itemDate = new Date(item.schedule_date);
            const formattedItemDate = format(itemDate, "yyyy-MM-dd");

            switch (selectedDateType) {
              case "weekly":
                return (
                  item.schedule_date >= range.start &&
                  item.schedule_date <= range.end &&
                  item.city === selectedCity
                );
              case "daily":
                return (
                  formattedItemDate === range && item.city === selectedCity
                );
              case "yearly":
                return (
                  format(itemDate, "yyyy") === range &&
                  item.city === selectedCity
                );
              default:
                return (
                  format(itemDate, "yyyy-MM") === range &&
                  item.city === selectedCity
                );
            }
          });

          return rangeData.reduce(
            (acc, item) => acc + parseFloat(item.total_booking_fee || 0),
            0
          );
        });

        setTotalBookingFee(totalBookingFees);
      } catch (error) {
        console.error(
          "Error fetching total booking fee:",
          error.message || error
        );
        setTotalBookingFee(Array(6).fill(0)); // Default to array of 0 in case of error
      }
    };

    const fetchTotalPenalties = async () => {
      try {
        let dateRange;
        const currentDate = new Date(startDate);

        const getDateRange = () => {
          switch (selectedDateType || "monthly") {
            case "yearly":
              return eachYearOfInterval({
                start: new Date(currentDate.getFullYear() - 5, 0, 1),
                end: new Date(currentDate.getFullYear(), 11, 31),
              })
                .map((date) => format(date, "yyyy"))
                .slice(-6);

            case "monthly":
              return eachMonthOfInterval({
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
                .slice(-6);

            case "daily":
              return eachDayOfInterval({
                start: startOfDay(
                  new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000)
                ),
                end: endOfDay(currentDate),
              })
                .map((date) => format(date, "yyyy-MM-dd"))
                .slice(-6);

            case "weekly":
              return eachWeekOfInterval({
                start: startOfWeek(
                  new Date(currentDate.getTime() - 6 * 7 * 24 * 60 * 60 * 1000),
                  { weekStartsOn: 1 }
                ),
                end: endOfWeek(currentDate, { weekStartsOn: 1 }),
              })
                .map((date) => ({
                  start: format(
                    startOfWeek(date, { weekStartsOn: 1 }),
                    "yyyy-MM-dd"
                  ),
                  end: format(
                    endOfWeek(date, { weekStartsOn: 1 }),
                    "yyyy-MM-dd"
                  ),
                }))
                .slice(-6);

            default:
              return eachMonthOfInterval({
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
                .slice(-6);
          }
        };

        dateRange = getDateRange();

        const { data, error } = await supabase.rpc(
          "get_total_penalties_for_dashboard"
        );

        if (error) {
          console.error("Error fetching data:", error.message || error);
          throw error;
        }

        if (!data) {
          console.warn("No data returned from Supabase.");
          setTotalPenalties(Array(dateRange.length).fill(0)); // Default to array of 0
          return;
        }

        const totalPenalties = dateRange.map((range) => {
          const rangeData = data.filter((item) => {
            const itemDate = new Date(item.schedule_date);
            const formattedItemDate = format(itemDate, "yyyy-MM-dd");

            switch (selectedDateType) {
              case "weekly":
                return (
                  item.schedule_date >= range.start &&
                  item.schedule_date <= range.end &&
                  item.city === selectedCity
                );
              case "daily":
                return (
                  formattedItemDate === range && item.city === selectedCity
                );
              case "yearly":
                return (
                  format(itemDate, "yyyy") === range &&
                  item.city === selectedCity
                );
              default:
                return (
                  format(itemDate, "yyyy-MM") === range &&
                  item.city === selectedCity
                );
            }
          });

          return rangeData.reduce(
            (acc, item) => acc + parseFloat(item.total_penalties || 0),
            0
          );
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
        const dateType = selectedDateType || "monthly";
        const currentDate = new Date(startDate);

        let formattedStartDate, formattedEndDate;

        switch (dateType) {
          case "yearly":
            formattedStartDate = format(startOfYear(currentDate), "yyyy");
            formattedEndDate = format(endOfYear(currentDate), "yyyy");
            break;
          case "monthly":
            formattedStartDate = format(startOfMonth(currentDate), "yyyy-MM");
            formattedEndDate = format(endOfMonth(currentDate), "yyyy-MM");
            break;
          case "daily":
            formattedStartDate = format(currentDate, "yyyy-MM-dd");
            formattedEndDate = format(currentDate, "yyyy-MM-dd");
            break;
          case "weekly":
            const startOfWeekDate = startOfWeek(currentDate, {
              weekStartsOn: 1,
            });
            const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 1 });
            formattedStartDate = format(startOfWeekDate, "yyyy-MM-dd");
            formattedEndDate = format(endOfWeekDate, "yyyy-MM-dd");
            break;
          default:
            formattedStartDate = format(startOfMonth(currentDate), "yyyy-MM");
            formattedEndDate = format(endOfMonth(currentDate), "yyyy-MM");
        }

        const { data, error } = await supabase.rpc(
          "get_total_receivables_for_dashboard"
        );

        if (error) throw error;

        const filteredData = data.filter((item) => {
          const itemDate = new Date(item.schedule_date);
          const formattedItemDate = format(
            itemDate,
            dateType === "yearly"
              ? "yyyy"
              : dateType === "monthly"
              ? "yyyy-MM"
              : "yyyy-MM-dd"
          );

          return (
            item.city === selectedCity &&
            formattedItemDate >= formattedStartDate &&
            formattedItemDate <= formattedEndDate
          );
        });

        const sortedReceivables = filteredData.sort(
          (a, b) => new Date(b.schedule_date) - new Date(a.schedule_date)
        );

        const formattedReceivables = sortedReceivables.map((receivable) => ({
          junkshop: receivable.junkshop,
          datetime: format(
            parseISO(receivable.schedule_date),
            "MMMM d, yyyy @ hh:mm a"
          ),
          total_receivables: receivable.total_receivables || 0,
        }));

        setTotalReceivables(formattedReceivables);
      } catch (error) {
        console.error("Error fetching total receivables:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTotalRecentPayments = async () => {
      try {
        const dateType = selectedDateType || "monthly";

        let formattedStartDate, formattedEndDate;
        const currentDate = new Date(startDate); // Create a new Date object to avoid mutability

        switch (dateType) {
          case "yearly":
            formattedStartDate = format(startOfYear(currentDate), "yyyy-01-01");
            formattedEndDate = format(endOfYear(currentDate), "yyyy-12-31");
            break;
          case "monthly":
            formattedStartDate = format(
              startOfMonth(currentDate),
              "yyyy-MM-dd"
            );
            formattedEndDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
            break;
          case "daily":
            formattedStartDate = format(currentDate, "yyyy-MM-dd");
            formattedEndDate = format(currentDate, "yyyy-MM-dd");
            break;
          case "weekly":
            const startOfWeekDate = startOfWeek(currentDate, {
              weekStartsOn: 1,
            });
            const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 1 });
            formattedStartDate = format(startOfWeekDate, "yyyy-MM-dd");
            formattedEndDate = format(endOfWeekDate, "yyyy-MM-dd");
            break;
          default:
            formattedStartDate = format(
              startOfMonth(currentDate),
              "yyyy-MM-dd"
            );
            formattedEndDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
        }

        const { data, error } = await supabase.rpc(
          "get_total_recent_payments_for_dashboard"
        );

        if (error) throw error;

        const filteredData = data.filter((item) => {
          const itemDate = new Date(item.paid_time);

          switch (dateType) {
            case "yearly":
              return (
                item.city === selectedCity &&
                format(itemDate, "yyyy") === format(currentDate, "yyyy")
              );
            case "monthly":
              return (
                item.city === selectedCity &&
                format(itemDate, "yyyy-MM") === format(currentDate, "yyyy-MM")
              );
            case "daily":
              return (
                item.city === selectedCity &&
                format(itemDate, "yyyy-MM-dd") === formattedStartDate
              );
            case "weekly":
              return (
                item.city === selectedCity &&
                itemDate >= parseISO(formattedStartDate) &&
                itemDate <= parseISO(formattedEndDate)
              );
            default:
              return (
                item.city === selectedCity &&
                format(itemDate, "yyyy-MM") === format(currentDate, "yyyy-MM")
              );
          }
        });

        const sortedPayments = filteredData.sort(
          (a, b) => new Date(b.paid_time) - new Date(a.paid_time)
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
  }, [router, selectedCity, startDate, selectedDateType]);

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
                This is your overview of {getPeriodText()}&apos;s performance.
              </p>
            </div>

            <div className="flex relative">
              <button
                className="items-center flex border rounded-xl px-3 py-[6px] mr-4 hover:bg-gray-100 border-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaMapMarkerAlt />
                <p className="px-4 text-xs font-semibold">{selectedCity}</p>
              </button>
              {dropdownOpen && (
                <div className="absolute top-9 left-0 mt-2 text-sm text-center w-[145px] border bg-white shadow-lg z-10 rounded-xl">
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

              <button className="items-center flex border rounded-xl px-3 py-[6px] mr-4 hover:bg-gray-100 border-gray-300">
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
                      {selectedDateType.charAt(0).toUpperCase() +
                        selectedDateType.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div className="pl-2">
                    <FaChevronDown />
                  </div>
                </button>
                {isOpen && (
                  <div className="absolute right-38 top-11 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <ul className="text-sm text-center">
                      {["Yearly", "Monthly", "Weekly", "Daily"].map(
                        (dateType) => (
                          <li
                            key={dateType.toLowerCase()}
                            onClick={() =>
                              handleDateTypeSelect(dateType.toLowerCase())
                            }
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
                    selected={
                      startDate instanceof Date && !isNaN(startDate.getTime())
                        ? startDate
                        : null
                    }
                    onChange={handleDateChange}
                    {...datePickerProps}
                    className="px-2 text-xs font-semibold text-center w-[140px] items-center mb-1"
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
                <CommissionCard
                  totalCommission={totalCommission}
                  selectedDateType={selectedDateType}
                />

                {/* End Row 1 */}

                {/* Start Row 2 */}
                <BookingFeeCard
                  totalBookingFee={totalBookingFee}
                  selectedDateType={selectedDateType}
                />

                {/* End Row 2 */}

                {/* Start Row 3 */}
                <PenaltiesCard
                  totalPenalties={totalPenalties}
                  selectedDateType={selectedDateType}
                />
                {/* End Row 3 */}
              </div>

              {/* Column 2 */}
              <div className="w-full mr-5">
                {/* Start Row 1 */}
                <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
                  <div className="px-5 py-3">
                    <p className="font-bold">Payments Breakdown</p>
                    <p className="text-xs pt-1">
                      This is your overview of the payments breakdown for{" "}
                      {getPeriodText()}.
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
                        This is your overview of the unpaid payments for{" "}
                        {getPeriodText()}.
                      </p>
                      <div className="flex items-end justify-between h-[85px]">
                        <p className="text-3xl font-semibold">
                          {(() => {
                            // Calculate total receivables
                            const total = Array.isArray(totalReceivables)
                              ? totalReceivables.reduce(
                                  (sum, item) =>
                                    sum +
                                    (parseFloat(item.total_receivables) || 0),
                                  0
                                )
                              : 0;

                            // Format the total
                            const [integerPart, decimalPart] = total
                              .toFixed(2)
                              .split(".");
                            return (
                              <>
                                ₱ {parseInt(integerPart).toLocaleString()}
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
