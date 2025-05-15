import admin from "firebase-admin";

import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync(new URL("./final-proj.json", import.meta.url)));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export default db;