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
import { Dog, DogInput } from "../models/dogKennel";
import { getDownloadURL, ref } from "firebase/storage";
import { deleteImage } from "./imageService";

export const getAllDogs = async (dir: string): Promise<Dog[]> => {
  const querySnapshot = await getDocs(query(collection(db, dir), orderBy("dateOfBirth", "asc")));

  if (!querySnapshot.empty) {
    const newDog = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const id = doc.id;
        let imageUrl = "";

        const imgRef = ref(storage, `images/${dir}/${doc.id}`);
        const newUrl = await getDownloadURL(imgRef);
        if (typeof newUrl === "string") imageUrl = newUrl;

        return { id, ...doc.data(), imageUrl } as Dog;
      })
    );
    return newDog;
  } else return [];
};

export const createDog = async (input: DogInput, dir: string) => {
  const docRef = await addDoc(collection(db, dir), {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth),
  });
  return docRef.id;
};

export const updateDog = async (id: String, input: DogInput, dir: string) => {
  await updateDoc(doc(db, dir + "/" + id), {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth),
  });
};

export const deleteDog = async (id: string, dir: string) => {
  await deleteDoc(doc(db, dir + "/" + id));
  await deleteImage(dir, id);
};
