// src/components/AppBar.js
"use client";

import Image from "next/image";
import { usePathname } from "next/navigation"; // Use usePathname for the app directory
import LogoutButton from "./Auth/LogoutButton";

export default function AppBar({ operatorName, isSuperAdmin, profilePath }) {
  const pathname = usePathname(); // Get the current path

  return (
    <div className="flex justify-between items-center w-full px-4 bg-white border">
      <div>
        <a href="/" className="mr-auto">
          <Image
            src={`/scrapcycle-logo.png`}
            alt="Scrapcycle logo"
            width={230}
            height={50}
          />
        </a>
      </div>
      <div className="flex items-center">
        <div>
          <a href="/">
            <p
              className={`text-sm px-14 ${
                pathname === "/"
                  ? "text-green-600 font-bold"
                  : "text-gray-700 font-semibold"
              } hover:text-green-500`}
            >
              Live Map
            </p>
          </a>
        </div>
        <div>
          <a href="/dashboard">
            <p
              className={`text-sm px-14 ${
                pathname === "/dashboard"
                  ? "text-green-600 font-bold"
                  : "text-gray-700 font-semibold"
              } hover:text-green-500`}
            >
              Dashboard
            </p>
          </a>
        </div>
        <div>
          <a href="/branches">
            <p
              className={`text-sm px-14 ${
                pathname === "/branches"
                  ? "text-green-600 font-bold"
                  : "text-gray-700 font-semibold"
              } hover:text-green-500`}
            >
              Branches
            </p>
          </a>
        </div>
      </div>
      <div className="flex items-center">
        <p className="font-semibold p-3">
          {operatorName} ({isSuperAdmin ? "Super Admin" : "Admin"})
        </p>
        <Image
          src={
            profilePath ||
            "https://i.pinimg.com/564x/5b/01/dd/5b01dd38126870d000aee1ed5c8daa80.jpg"
          }
          alt="Profile picture"
          width={50}
          height={50}
          className="rounded-full"
        />
        <p className="px-1"></p>
        <LogoutButton className="bg-gray-100 hover:bg-green-50 border border-gray-300 hover:border-green-500 hover:text-green-600" />
      </div>
    </div>
  );
}
