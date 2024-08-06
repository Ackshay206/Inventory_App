// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyJISzXphPViEQKY1OKY8jSdShI2sKkOA",
  authDomain: "inventory-management-ee963.firebaseapp.com",
  projectId: "inventory-management-ee963",
  storageBucket: "inventory-management-ee963.appspot.com",
  messagingSenderId: "339073156901",
  appId: "1:339073156901:web:f1a5a31d92f34616e47ccc",
  measurementId: "G-Q27QX1P9QY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}