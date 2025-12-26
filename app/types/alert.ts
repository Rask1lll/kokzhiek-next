export type AlertType = "success" | "error" | "warning" | "info" | "hint";

export type Alert = {
  id: string;
  message: string;
  type: AlertType;
  duration?: number;
};
