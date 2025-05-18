import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  entite: string;
  role: "employe" | "responsable";
}

export const createUserDocument = async (userData: UserData) => {
  try {
    await setDoc(doc(db, "users", userData.uid), userData);
    console.log("Utilisateur enregistré dans Firestore");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
  }
};
