import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../app/firebase";
import { Terrier, TerrierInput } from "../models/irishTerriers";
import { getDownloadURL, ref } from "firebase/storage";
import { deleteImage } from "./imageService";

export const getAllTerriers = async (): Promise<Terrier[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, "terriers"), orderBy("dateOfBirth", "asc"))
  );

  if (!querySnapshot.empty) {
    const newTerriers = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const id = doc.id;
        let imageUrl = "";

        const imgRef = ref(storage, "images/terriers/" + doc.id);
        const newUrl = await getDownloadURL(imgRef);
        if (typeof newUrl === "string") imageUrl = newUrl;

        return { id, ...doc.data(), imageUrl } as Terrier;
      })
    );
    return newTerriers;
  } else return [];
};

export const createTerrier = async (input: TerrierInput) => {
  const docRef = await addDoc(collection(db, "terriers"), {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth),
  });
  return docRef.id;
};

export const updateTerrier = async (id: String, input: TerrierInput) => {
  await updateDoc(doc(db, "terriers/" + id), {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth),
  });
};

export const deleteTerrier = async (id: string) => {
  await deleteDoc(doc(db, "terriers/" + id));
  await deleteImage("terriers", id);
};
