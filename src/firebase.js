// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiDsWpz0J_X4rPsQYUJcUyLVazRtiA8dk",
  authDomain: "planejador-semanal.firebaseapp.com",
  projectId: "planejador-semanal",
  storageBucket: "planejador-semanal.appspot.com",
  messagingSenderId: "1059522956155",
  appId: "1:1059522956155:web:02bc9030ff589be44b8bde",
  databaseURL: "https://planejador-semanal-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export default database