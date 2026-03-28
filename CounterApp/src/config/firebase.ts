import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBY_Od8OSaWIVr5pqz2mbWyyrjYVoB98BY",
  authDomain: "projeto-pi-5f81b.firebaseapp.com",
  projectId: "projeto-pi-5f81b",
  storageBucket: "projeto-pi-5f81b.firebasestorage.app",
  messagingSenderId: "696371963175",
  appId: "1:696371963175:web:cb76c688487420323bf502"
};

// Evita inicializar múltiplas vezes
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
