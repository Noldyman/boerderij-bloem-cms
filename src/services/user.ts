import { atom } from "recoil";
import { User } from "firebase/auth";
import { localStorageEffect } from "./localStorageEffect";

export const userState = atom({
  key: "User",
  default: null as User | null,
  effects: [localStorageEffect("user")],
});
