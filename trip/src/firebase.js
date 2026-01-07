import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBPW0vJ3V7TaVT57dr-xti_VuU5vH78T6M",
    authDomain: "travelsphere-ab5ac.firebaseapp.com",
    projectId: "travelsphere-ab5ac",
    storageBucket: "travelsphere-ab5ac.firebasestorage.app",
    messagingSenderId: "960358922926",
    appId: "1:960358922926:web:bc39217f64030cdef70b3f",
    measurementId: "G-8JYEQQHXBV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };
