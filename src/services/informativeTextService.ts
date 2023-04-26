import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../app/firebase";
import { InformativeTextCollection, InformativeTextCollectionInput } from "../models/texts";

const dir = "informativetexts";

export const getInformativeTextCollection = async (
  page: string
): Promise<InformativeTextCollection | undefined> => {
  const querySnapshot = await getDocs(query(collection(db, dir), where("page", "==", page)));
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const introText: InformativeTextCollection = {
      id: doc.id,
      page: data.page,
      infoTexts: data.infoTexts,
    };
    return introText;
  }
};

export const postInformativeTextCollection = async (
  input: InformativeTextCollectionInput
): Promise<string> => {
  const docRef = await addDoc(collection(db, dir), { ...input, infoTexts: [...input.infoTexts] });
  return docRef.id;
};

export const updateInformativeTextCollection = async (
  id: string,
  input: InformativeTextCollectionInput
) => {
  await updateDoc(doc(db, `${dir}/${id}`), { ...input, infoTexts: [...input.infoTexts] });
};

export const deleteInformativeTextCollection = async (id: string) => {
  await deleteDoc(doc(db, `${dir}/${id}`));
};
