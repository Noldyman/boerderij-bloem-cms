import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "../app/firebase";
import { Image } from "../models/images";

export const getCoverImageUrls = async (page: string): Promise<Image[]> => {
  const listRef = ref(storage, `images/coverphotos/${page}`);
  const response = await listAll(listRef);

  const coverImgUrls = await Promise.all(
    response.items.map(async (item) => {
      const id = item.name;
      const imgRef = ref(storage, item.fullPath);
      const imgUrl = await getDownloadURL(imgRef);
      return { id, imgUrl };
    })
  );
  return coverImgUrls;
};

export const getImageUrl = async (dir: string, id: string) => {
  const imgRef = ref(storage, `images/${dir}/${id}`);
  const imgUrl = await getDownloadURL(imgRef);
  return imgUrl;
};

export const postImage = async (dir: string, blob: Blob): Promise<Image> => {
  const id = crypto.randomUUID();
  const imgRef = ref(storage, `images/${dir}/${id}`);
  await uploadBytes(imgRef, blob);
  const imgUrl = URL.createObjectURL(blob);
  return { id, imgUrl };
};

export const deleteImage = async (dir: string, id: string) => {
  const imgRef = ref(storage, `images/${dir}/${id}`);
  await deleteObject(imgRef).catch((err) => {
    if (!err.message.includes("storage/object-not-found")) throw Error(err);
  });
};

export const updateImage = async (dir: string, blob: Blob, id: string) => {
  const imgRef = ref(storage, `images/${dir}/${id}`);
  await uploadBytes(imgRef, blob);
};
