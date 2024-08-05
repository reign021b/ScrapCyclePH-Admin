import React, { useEffect, useState } from "react";

const ProfileImage = ({ fullName = "" }) => {
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (fullName) {
      const names = fullName.split(" ");
      const init = (names[0]?.charAt(0) || "") + (names[1]?.charAt(0) || "");
      setInitials(init.toUpperCase());
    } else {
      setInitials("");
    }
  }, [fullName]);

  return (
    <div
      id="profileImage"
      className="w-20 h-20 rounded-3xl bg-green-600 text-white text-3xl flex items-center justify-center my-5"
    >
      {initials}
    </div>
  );
};

export default ProfileImage;
