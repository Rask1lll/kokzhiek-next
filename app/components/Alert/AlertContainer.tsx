"use client";

import { useAlertStore } from "@/app/store/alertStore";
import Alert from "./Alert";

export default function AlertContainer() {
  const alerts = useAlertStore((state) => state.alerts);
  const removeAlert = useAlertStore((state) => state.removeAlert);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} onClose={removeAlert} />
      ))}
    </div>
  );
}

