import { Timestamp } from "firebase/firestore";

export interface Terrier {
  id: string;
  name: string;
  dateOfBirth: Timestamp;
  description: string;
  imageUrl?: string;
}
