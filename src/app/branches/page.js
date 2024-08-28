"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AppBar from "/src/app/components/AppBar";

export default function Branches() {
  const router = useRouter();
  const [operatorName, setOperatorName] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false); // Ensure loading is set to false after completion
      }
    };

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
        } else {
          fetchOperator(session);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setLoading(false); // Ensure loading is set to false if session check fails
      }
    };

    checkUser();
  }, [router]);

  return (
    <main className="text-gray-700 bg-white">
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
        </>
      )}
    </main>
  );
}
