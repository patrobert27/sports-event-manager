import React from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/auth/authSelectors";
import UserAvatar from "./UserAvatar";

export default function SidebarUserSection() {
  const { user } = useSelector(selectAuth);
  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={user} size={48} />
      <div className="flex-1">
        <div className="text-sm font-semibold text-dark truncate">{user?.first_name} {user?.last_name}</div>
        <div className="text-xs text-muted truncate">{user?.email}</div>
      </div>
    </div>
  );
}
