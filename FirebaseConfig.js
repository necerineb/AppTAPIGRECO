import {initializeApp} from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAO4DMndvtOoDwJd33zEs7mLWVkl067Cf0",
    authDomain: "tapigrecodata.firebaseapp.com",
    databaseURL: "https://tapigrecodata-default-rtdb.firebaseio.com",
    projectId: "tapigrecodata",
    storageBucket: "tapigrecodata.appspot.com",
    messagingSenderId: "842448114294",
    appId: "1:842448114294:web:7cdef1200d63cbb2be4557"
};

const app = initializeApp(firebaseConfig);


export default app;
