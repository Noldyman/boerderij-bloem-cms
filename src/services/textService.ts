import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../app/firebase";
import { TextContent } from "../models/texts";

export const getTextContents = async (
  page: string,
  identifier: string
): Promise<TextContent[] | undefined> => {
  const querySnapshot = await getDocs(
    query(collection(db, `texts`), where("page", "==", page), where("identifier", "==", identifier))
  );
  if (!querySnapshot.empty) {
    const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, text: doc.data().text }));
    return docs;
  }
};

export const getIntroText = async (page: string) => {
  const res = await getTextContents(page, "intro");
  if (res) return res[0];
};

export const postTextContent = async (text: string, page: string, identifier: string) => {
  await addDoc(collection(db, `texts`), {
    text,
    page,
    identifier,
  });
};

export const updateTextContent = async (
  id: string,
  text: string,
  page: string,
  identifier: string
) => {
  await updateDoc(doc(db, `texts/${id}`), {
    text,
    page,
    identifier,
  });
};
