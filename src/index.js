import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, getRedirectResult, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore, connectFirestoreEmulator,
  doc,
  addDoc,
  setDoc,
  collection,
  query,
  getDoc,
  getDocs,
  where,
  onSnapshot
} from "firebase/firestore";

import { firebaseConfig, inEmulation, firebaseEmulators } from './config';

const firebaseApp = initializeApp(firebaseConfig);
console.log("got firebaseApp:", firebaseApp, firebaseConfig);

const db = getFirestore(firebaseApp);
connectFirestoreEmulator(db, firebaseEmulators.firestore.host, firebaseEmulators.firestore.port);

const auth = getAuth();
connectAuthEmulator(auth, `https://${firebaseEmulators.auth.host}:${firebaseEmulators.auth.port}`);

function addAssets(assetsList) {
  let sceneElem = document.querySelector("a-scene");
  let frag = document.createDocumentFragment();
  console.log("adding scene assets:", assetsList);
  // assets
  for (let assetInfo of assetsList) {
    let elem = document.createElement("a-assets-item");
    for (let [name, value] of Object.entries(assetInfo)) {
      elem.setAttribute(name, value);
    }
    frag.appendChild(elem);
  }
  let assetElem = sceneElem.querySelector("a-assets");
  assetElem.appendChild(frag);
}

function addEntities(entityList) {
  let sceneNode = document.querySelector("a-scene");
  let fragment = document.createDocumentFragment();
  let excludeAttributeProperties = new Set(["a-type", "a-path", "_depth"])

  for (let entity of entityList) {
    let elem = document.createElement("a-" + entity["a-type"]);
    let parentNode;
    if (entity.parentId) {
      // try the fragment first
      parentNode = fragment.getElementById(entity.parentId);
      if (!parentNode) {
        parentNode = document.getElementById(entity.parentId);
      }
      if (!parentNode) {
        console.warn("Missing parentNode for child", entity["a-path"], entity.parentId);
        continue;
      }
    } else {
      parentNode = fragment;
    }
    for (let [name, value] of Object.entries(entity)) {
      if (excludeAttributeProperties.has(name)) {
        continue;
      }
      elem.setAttribute(name, value);
    }
    parentNode.appendChild(elem);
  }
  if (fragment.childElementCount) {
    sceneNode.appendChild(fragment);
  }
}

async function initScene(sceneData) {
  console.log("Querying for assets....");
  const assetsSnapshot = await getDocs(collection(db, "assets"));
  const entitiesSnapshot = await getDocs(collection(db, "entities"));

  let remoteAssets = assetsSnapshot.docs.map(doc => doc.data());
  addAssets(remoteAssets);

  let remoteEntities = entitiesSnapshot.docs.map(doc => doc.data());
  console.log("remoteEntities:", remoteEntities);
  let sortedEntities = window.sortedEntities = [];
  for (let entity of remoteEntities) {
    if (!entity._depth) {
      entity._depth = entity["a-path"].split(" > ").length;
    }
    sortedEntities.push(entity);
  }
  sortedEntities.sort((a, b) => {
    return a._depth > b._depth;
  });
  console.log("sortedEntities:", sortedEntities);
  addEntities(sortedEntities);
}

window.addEventListener("DOMContentLoaded", async () => {
  initScene();
});

