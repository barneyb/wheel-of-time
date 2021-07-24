// Firebase App (the core Firebase SDK) is always required and must be listed first
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAcSFZtUcfHEL9El6OF2KotAr-04gY65wc",
    authDomain: "wheel-of-time-817f4.firebaseapp.com",
    projectId: "wheel-of-time-817f4",
    storageBucket: "wheel-of-time-817f4.appspot.com",
    messagingSenderId: "761595868148",
    appId: "1:761595868148:web:bc96b7e517751a15cc7fa1",
    measurementId: "G-9EZTLDCV71",
};

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === "development") {
    var firebaseEmulators = {
        "auth": {
            "host": "localhost",
            "port": 9099,
        },
        "firestore": {
            "host": "localhost",
            "port": 8080,
        },
    };
    console.log("Automatically connecting Firebase SDKs to running emulators:");
    Object.keys(firebaseEmulators).forEach(function (key) {
        console.log('\t' + key + ': http://' + firebaseEmulators[key].host + ':' + firebaseEmulators[key].port);
    });

    if (firebaseEmulators.firestore && typeof firebase.firestore === 'function') {
        firebase.firestore()
            .useEmulator(
                firebaseEmulators.firestore.host,
                firebaseEmulators.firestore.port,
            );
    }

    if (firebaseEmulators.functions && typeof firebase.functions === 'function') {
        firebase.functions()
            .useEmulator(
                firebaseEmulators.functions.host,
                firebaseEmulators.functions.port,
            );
    }

    if (firebaseEmulators.auth && typeof firebase.auth === 'function') {
        firebase.auth()
            .useEmulator('http://' + firebaseEmulators.auth.host + ':' + firebaseEmulators.auth.port);
    }
}

export const analytics = firebase.analytics();

export const auth = firebase.auth();

export const firestore = firebase.firestore();

export default firebase;
