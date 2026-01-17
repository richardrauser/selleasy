import "server-only";
import { initializeApp, getApps, getApp, App, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (getApps().length === 0) {
    app = initializeApp({
        credential: applicationDefault(),
        projectId: 'selleasy-app'
    });
} else {
    app = getApp();
}

const db = getFirestore(app);

export { db };
