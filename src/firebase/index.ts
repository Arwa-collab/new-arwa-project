import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 ajout auth
import firebaseConfig from "../lib/firebase/config";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 👈 créer une instance de Auth

export { app, db, auth };
