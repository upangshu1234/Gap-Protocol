
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNnASUnTl_WvYyn5hyyRr1RmWl0A-8SrE",
  authDomain: "gadget-addiction.firebaseapp.com",
  projectId: "gadget-addiction",
  storageBucket: "gadget-addiction.firebasestorage.app",
  messagingSenderId: "625192308034",
  appId: "1:625192308034:web:5f8a7ab7014985505f4cdb",
  measurementId: "G-1JKF6TMC9C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
