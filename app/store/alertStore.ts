"use client";

import { create } from "zustand";
import { Alert, AlertType } from "../types/alert";

type AlertStore = {
  alerts: Alert[];
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
};

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  showAlert: (message: string, type: AlertType = "info", duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: Alert = {
      id,
      message,
      type,
      duration,
    };

    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));
  },
  removeAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },
  clearAlerts: () => {
    set({ alerts: [] });
  },
}));
