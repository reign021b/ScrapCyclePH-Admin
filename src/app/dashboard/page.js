"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AppBar from "/src/app/components/AppBar";
import Image from "next/image";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [operatorName, setOperatorName] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState(null);

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

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        fetchOperator(session);
      }
    };

    checkUser();
  }, [router]);

  return (
    <main className="text-gray-700 bg-white">
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
        <div className="flex">
          <button className="items-center flex border rounded-xl px-3 py-[6px] mr-4">
            <FaMapMarkerAlt />
            <p className="px-4 text-xs font-semibold">Davao City</p>
          </button>
          <button className="items-center flex border rounded-xl px-3 py-[6px] mr-4">
            <FaCalendarAlt className="" />
            <p className="px-4 text-xs font-semibold">July 2024</p>
          </button>
        </div>
      </div>
      <div className="justify-center items-center mx-auto max-w-[1440px]">
        <div className="p-5">
          <p className="text-3xl font-bold pb-2">
            ₱ 2,370,000<span className="text-lg">.75</span>
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
            <div className="mb-7">
              <div className="cols-span-1 w-full border rounded-t-xl mr-5">
                <div className="w-full pt-3">
                  <div className="p-5">
                    <p className="font-bold">Commission</p>
                    <p className="text-xs">
                      This is your overview of this month&apos;s performance.
                    </p>
                    <div className="flex">
                      <p className="text-3xl font-semibold items pt-[49px]">
                        ₱ 1,350,000<span className="text-lg">.75</span>
                      </p>
                      <div className="ml-4 pt-[35px]">
                        <div className="rounded-lg h-[50px] bg-green-600 w-[24px]">
                          &nbsp;
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
            <div className="mb-7">
              <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
                <div className="w-full">
                  <div className="p-5">
                    <p className="font-bold">Booking Fee</p>
                    <p className="text-xs">
                      This is your overview of this month&apos;s performance.
                    </p>
                    <div className="flex">
                      <p className="text-3xl font-semibold items pt-[49px]">
                        ₱ 950,000<span className="text-lg">.00</span>
                      </p>
                      <div className="ml-4 pt-[35px]">
                        <div className="rounded-lg h-[50px] bg-blue-500 w-[24px]">
                          &nbsp;
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
                <div className="p-5">
                  <p className="font-bold">Penalties</p>
                  <p className="text-xs">
                    This is your overview of this month&apos;s performance.
                  </p>
                  <div className="flex">
                    <p className="text-3xl font-semibold items pt-[49px]">
                      ₱ 70,000<span className="text-lg">.00</span>
                    </p>
                    <div className="ml-4 pt-[35px]">
                      <div className="rounded-lg h-[50px] bg-red-600 w-[24px]">
                        &nbsp;
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
            <div className="cols-span-1 w-full border rounded-t-xl mr-5 pt-3">
              <div className="p-5">
                <p className="font-bold">Payments Breakdown</p>
                <p className="text-xs pt-1">See latest payment transactions.</p>
              </div>
            </div>
            <div className="py-3"></div>
            <div className="cols-span-1 w-full border rounded-t-xl mr-5">
              <div className="w-full pt-3">
                <div className="p-5">
                  <p className="font-bold">Receivables</p>
                  <p className="text-xs">
                    This is your overview of this month&apos;s performance.
                  </p>
                  <div className="flex">
                    <p className="text-3xl font-semibold items pt-[49px]">
                      ₱ 523,000<span className="text-lg">.00</span>
                    </p>
                    <div className="ml-4 pt-[35px]">
                      <div className="rounded-lg h-[50px] bg-yellow-400 w-[24px]">
                        &nbsp;
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
              <div className="p-5">
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
            <div className="grid grid-cols-3 border border-t-0 rounded-b-xl text-[11px] justify-center font-bold pb-4">
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center w-full">
                  July 29, 2024 @ 12:30 PM
                </div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="pl-5">RC Junkshop</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">July 29, 2024 @ 12:30 PM</div>
              </div>
              <div className="w-full col-span-1 py-3">
                <div className="text-center">₱ 9,393.25</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
