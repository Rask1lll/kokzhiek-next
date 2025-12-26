"use client";

import { useAlertStore } from "../store/alertStore";

export function useAlert() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const clearAlerts = useAlertStore((state) => state.clearAlerts);
  const alerts = useAlertStore((state) => state.alerts);

  return {
    showAlert,
    removeAlert,
    clearAlerts,
    alerts,
  };
}
