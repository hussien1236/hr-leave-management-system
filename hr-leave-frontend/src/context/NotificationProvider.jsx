import { useEffect } from "react";
import { toast } from "react-toastify";
import echo from "../echo";

export default function NotificationProvider({ user, children }) {
  useEffect(() => {
    console.log("Setting up Echo listeners for user:", user);
    if (!user) return;

    const channel = echo.private(`leave-requests.${user.id}`);

    channel.listen("LeaveStatusUpdated", (event) => {
              console.log("LeaveStatusUpdated event received:", event);

    if (event.leave.status === "approved"){
      console.log("LeaveStatusUpdated event received:", event);
      toast.success(`✅ Your leave from ${event.leave.start_date} to ${event.leave.end_date} was approved!`);
    } else if (event.leave.status === "rejected"){
              toast.error(`❌ Your leave request was rejected. Reason: ${event.reason || "N/A"}`);
    }
    });
    console.log("Subscribed to channel:", `private-leave-requests.${user.id}`);
    return () => {
      echo.leave(`private-leave-requests.${user.id}`);
    };
  }, []);

  return children;
}
