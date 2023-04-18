import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "../app/firebase";
import { Image } from "../models/images";
import Compressor from "compressorjs";

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
  let imgUrl = "";
  const compressedBlob = await compressImage(blob);
  const imgRef = ref(storage, `images/${dir}/${id}`);
  uploadBytes(imgRef, compressedBlob);
  imgUrl = URL.createObjectURL(compressedBlob);
  return { id, imgUrl };
};

export const updateImage = async (dir: string, blob: Blob, id: string) => {
  const compressedBlob = await compressImage(blob);
  const imgRef = ref(storage, `images/${dir}/${id}`);
  await uploadBytes(imgRef, compressedBlob);
};

export const deleteImage = async (dir: string, id: string) => {
  const imgRef = ref(storage, `images/${dir}/${id}`);
  await deleteObject(imgRef).catch((err) => {
    if (!err.message.includes("storage/object-not-found")) throw Error(err);
  });
};

const compressImage = async (blob: Blob): Promise<Blob> =>
  new Promise((res, rej) => {
    new Compressor(blob, {
      convertSize: 75000,
      quality: 0.1,
      retainExif: false,
      success(result) {
        res(result);
      },
      error(err) {
        rej(new Error(err.message));
      },
    });
  });
