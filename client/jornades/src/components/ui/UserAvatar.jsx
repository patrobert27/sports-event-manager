import React, { useState } from "react";

export default function UserAvatar({ user = {}, size = 48 }) {
  const [imageError, setImageError] = useState(false);
  const initials = `${user?.first_name?.[0] ?? "U"}${user?.last_name?.[0] ?? ""}`;
  
  const sizeClass = {
    32: "w-8 h-8 text-base",
    40: "w-10 h-10 text-lg",
    48: "w-12 h-12 text-xl",
    64: "w-16 h-16 text-2xl",
  }[size] || "w-12 h-12 text-xl";

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-white/10 ${sizeClass}`} style={{ width: size, height: size }}>
      {user?.photo && !imageError ? (
        <img 
          src={user.photo} 
          alt={`${user?.first_name ?? "User"} avatar`} 
          className="object-cover w-full h-full" 
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full font-bold text-white">{initials.toUpperCase()}</div>
      )}
    </div>
  );
}
