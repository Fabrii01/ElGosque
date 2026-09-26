import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3ZR1Gqd8GCt1P8vkpFazp2109jL6ddDU",
  authDomain: "el-gosque-app.firebaseapp.com",
  projectId: "el-gosque-app",
  storageBucket: "el-gosque-app.firebasestorage.app",
  messagingSenderId: "675576027119",
  appId: "1:675576027119:web:dfd1ded4cfcaf91fcec81a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos y la autenticación
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);