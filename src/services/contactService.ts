import { addDoc, collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from "../app/firebase";
import { ContactDetails } from "../models/contact";

export const getContactInfo = async () => {
  const querySnapshot = await getDocs(query(collection(db, `contactinfo`)));
  if (!querySnapshot.empty) {
    const id = querySnapshot.docs[0].id;
    const data = querySnapshot.docs[0].data();

    return {
      id,
      details: {
        contacts: data.contacts,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        phoneNumber: data.phoneNumber,
        email: data.email,
      },
    };
  }
};

export const createContactDetails = async (input: ContactDetails) => {
  const docRef = await addDoc(collection(db, `contactinfo`), {
    ...input,
  });
  return docRef.id;
};

export const updateContactDetails = async (detailsDocId: string, input: ContactDetails) => {
  await updateDoc(doc(db, `contactinfo/${detailsDocId}`), {
    ...input,
  });
};
