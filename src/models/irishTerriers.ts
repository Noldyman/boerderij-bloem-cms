import { Timestamp } from "firebase/firestore";

export interface Terrier {
  id: string;
  name: string;
  dateOfBirth: Timestamp;
  description: string;
  imageUrl?: string;
}

export interface TerrierInput {
  name: string;
  dateOfBirth: string;
  description: string;
}
