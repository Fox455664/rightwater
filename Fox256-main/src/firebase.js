import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, doc, updateDoc, getDoc, onSnapshot, query, where, orderBy, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, signInWithPopup } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBVkdyjJi3l-QB1KpSQJle_P9ujHQ2LTn0",
  authDomain: "right-water.firebaseapp.com",
  projectId: "right-water",
  storageBucket: "right-water.firebasestorage.app",
  messagingSenderId: "134412024932",
  appId: "1:134412024932:web:be47e36b50f087e2a87371",
  measurementId: "G-0RZ3XYPXR7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

export { 
  db, 
  auth, 
  storage, 
  analytics,
  googleProvider, 
  facebookProvider, 
  twitterProvider,
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
