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
import { NewsitemInput, Newsitem } from "../models/news";
import { deleteImage, getImageUrl } from "./imageService";
import { listAll, ref } from "firebase/storage";

export const getNewsitemsWithImageIds = async () => {
  const listRef = ref(storage, `images/newsitems`);
  const response = await listAll(listRef);
  const idArr = response.items.map((item) => item.name);
  return idArr;
};

export const getAllNewsitems = async (newsitemsWithImageIds: string[]): Promise<Newsitem[]> => {
  const querySnapshot = await getDocs(query(collection(db, "newsitems"), orderBy("date", "desc")));
  if (!querySnapshot.empty) {
    const newNewsitems = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const id = doc.id;
        let imageUrl = "";

        const itemHasImage = newsitemsWithImageIds.includes(id);
        if (itemHasImage) {
          const newUrl = await getImageUrl("newsitems", id);
          if (typeof newUrl === "string") imageUrl = newUrl;
        }

        return { id, ...doc.data(), imageUrl } as Newsitem;
      })
    );
    return newNewsitems;
  }
  return [];
};

export const createNewsitem = async (input: NewsitemInput) => {
  const docRef = await addDoc(collection(db, "newsitems"), { ...input });
  return docRef.id;
};

export const updateNewsItem = async (id: string, input: NewsitemInput) => {
  await updateDoc(doc(db, "newsitems/" + id), { ...input });
};

export const deleteNewsItem = async (id: string, itemHasImage: boolean) => {
  await deleteDoc(doc(db, "newsitems/" + id));
  if (itemHasImage) await deleteImage("newsitems", id);
};
