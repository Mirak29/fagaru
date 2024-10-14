// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApv_24-8oOEHbKvy4QyV4t1AzGqbDgQLk",
  authDomain: "fagaru-e48b1.firebaseapp.com",
  projectId: "fagaru-e48b1",
  storageBucket: "fagaru-e48b1.appspot.com",
  messagingSenderId: "1063652159776",
  appId: "1:1063652159776:web:674f773e5c4d4ea861a745",
  measurementId: "G-QVXFQ1PT6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
