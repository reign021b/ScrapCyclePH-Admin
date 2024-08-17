"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AppBar from "/src/app/components/AppBar";
import Image from "next/image";

export default function Branches() {
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
    </main>
  );
}
