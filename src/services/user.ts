import { atom } from "recoil";
import { User } from "firebase/auth";

export const userState = atom({
  key: "User",
  default: null as User | null,
});
