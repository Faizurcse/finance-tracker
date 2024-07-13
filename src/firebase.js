// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTBxTbpom1uW_E3oyYbR1K29DN3xiLxgM",
  authDomain: "personal-finance-tracker-3ecb3.firebaseapp.com",
  projectId: "personal-finance-tracker-3ecb3",
  storageBucket: "personal-finance-tracker-3ecb3.appspot.com",
  messagingSenderId: "33870352824",
  appId: "1:33870352824:web:979c2fc1b42d2a84bdbf4d",
  measurementId: "G-4MFXE3JZLW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };
