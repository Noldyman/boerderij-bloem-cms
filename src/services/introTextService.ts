import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../app/firebase";
import { IntroText, IntroTextInput } from "../models/texts";

const dir = "introtexts";

export const getIntroText = async (page: string): Promise<IntroText | undefined> => {
  const querySnapshot = await getDocs(query(collection(db, dir), where("page", "==", page)));
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const introText: IntroText = {
      id: doc.id,
      text: data.text,
      page: data.page,
    };
    return introText;
  }
};

export const postIntroText = async (input: IntroTextInput): Promise<string> => {
  const docRef = await addDoc(collection(db, dir), { ...input });
  return docRef.id;
};

export const updateIntroText = async (id: string, input: IntroTextInput) => {
  await updateDoc(doc(db, `${dir}/${id}`), { ...input });
};
