'use strict';

const useEmulator = true;

if (useEmulator){
  process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
}
const fs = require('fs');
const fba = require('firebase-admin');
const serviceAccount = require('./.fightertest-firebase-adminsdk.json');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
              .usage("Usage: $0 --cmd ")
              .default("cmd", "help").argv;

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, connectFirestoreEmulator, Timestamp, FieldValue, query, getDocs, where } = require('firebase-admin/firestore');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig

if (useEmulator) {
  firebaseConfig = {
    apiKey: "fake-api-key",
    projectId: "fightertest",
  }
} else {
  console.log("Can Only run with the emulator so far");
}

fba.initializeApp({
  ...firebaseConfig,
  // credential: fba.credential.cert(serviceAccount)
});

const db = getFirestore();

async function listEntities() {
  const entitiesSnapshot = await db.collection('entities').orderBy('id').get();
  entitiesSnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  console.log(`deleteQueryBatch of ${batchSize} size`);
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    console.log("deleting doc: ", doc.id);
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function reset() {
  for (let collectionName of ["entities", "assets"]) {
    const collectionRef = db.collection(collectionName);
    const batchSize = 5;
    const query = collectionRef.limit(5);

    await new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
}

async function importScene(sceneData) {
  console.log("game data:", sceneData);

  // Get a new write batch
  const batch = db.batch();

  const entitiesCollectionRef = db.collection("entities");
  const assetsCollectionRef = db.collection("assets");

  console.log(`importing ${sceneData.entities.length} entities, ${sceneData.assets.length} assets`);
  for (let docData of sceneData.assets) {
    console.log("importing asset:", docData.id);
    // populate the asset document
    const docRef = assetsCollectionRef.doc(docData.id);
    batch.set(docRef, docData);
  }
  for (let docData of sceneData.entities) {
    console.log("importing entity:", docData.id);
    // populate the entities document
    const docRef = entitiesCollectionRef.doc(docData.id);
    batch.set(docRef, docData);
  }
  // Commit the batch
  await batch.commit();
  await listEntities();
}

async function run() {
  switch (argv.cmd ? argv.cmd.toLowerCase() : "help") {
    case "reset":
      await reset();
      break;
    case "import":
      let filename = argv.input;
      if (filename && fs.existsSync(filename)) {
        await reset();
        let json = fs.readFileSync(filename);
        let sceneData = JSON.parse(json);
        await importScene(sceneData);
      } else {
        console.log("Usage: $0 --cmd import --input ./scene.json");
      }
      break;
    default: 
      console.log("Usage: $0 --cmd commandname");
      console.log("Available commands: reset, import");
  }
}

if (require.main === module) {
  run();
}
