import { Timestamp } from "firebase/firestore";

export interface Newsitem {
  id: string;
  title: string;
  date: Timestamp;
  message: string;
  imageUrl?: string;
}

export interface NewsitemInput {
  title: string;
  date: Date;
  message: string;
  likes?: number;
}
