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
import { TextContent } from "../models/texts";

export const initSiteInformationOrder = async (page: string) => {
  const docRef = await addDoc(collection(db, `siteinformationids`), {
    page: page,
    itemIds: [],
  });
  return { docId: docRef.id, itemOrder: [] };
};

export const getSiteInformationOrder = async (page: string) => {
  const querySnapshot = await getDocs(
    query(collection(db, `siteinformationids`), where("page", "==", page))
  );

  if (!querySnapshot.empty) {
    const docId = querySnapshot.docs[0].id;
    const itemOrder = querySnapshot.docs[0].data().itemIds;
    return { docId, itemOrder };
  }
};

export const updateSiteInformationOrder = async (id: string, newItemIds: string[]) => {
  await updateDoc(doc(db, `siteinformationids/${id}`), {
    itemIds: newItemIds,
  });
};

export const getTextContents = async (
  page: string,
  identifier: string
): Promise<TextContent[] | undefined> => {
  const querySnapshot = await getDocs(
    query(collection(db, `texts`), where("page", "==", page), where("identifier", "==", identifier))
  );
  if (!querySnapshot.empty) {
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      title: doc.data().title || "",
    }));
    return docs;
  }
};

export const getIntroText = async (page: string) => {
  const res = await getTextContents(page, "intro");
  if (res) return res[0];
};

export const postTextContent = async (
  text: string,
  page: string,
  identifier: string,
  title?: string
) => {
  const docRef = await addDoc(collection(db, `texts`), {
    text,
    page,
    identifier,
    title: title ? title : "",
  });
  return docRef.id;
};

export const updateTextContent = async (
  id: string,
  text: string,
  page: string,
  identifier: string,
  title?: string
) => {
  await updateDoc(doc(db, `texts/${id}`), {
    text,
    page,
    identifier,
    title: title ? title : "",
  });
};

export const deleteTextContent = async (id: string) => {
  await deleteDoc(doc(db, "texts/" + id));
};
