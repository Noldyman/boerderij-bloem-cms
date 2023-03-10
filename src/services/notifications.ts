import { atom } from "recoil";

type Severity = "info" | "success" | "warning" | "error";
interface Notification {
  message: string;
  severity: Severity;
}

export const notificationState = atom({
  key: "Notification",
  default: { message: "", severity: "info" } as Notification,
});
