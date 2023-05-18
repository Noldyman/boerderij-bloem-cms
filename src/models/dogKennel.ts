import { Timestamp } from "firebase/firestore";

export interface Dog {
  id: string;
  name: string;
  dateOfBirth: Timestamp;
  description: string;
  imageUrl?: string;
}

export interface DogInput {
  name: string;
  dateOfBirth: string;
  description: string;
}
