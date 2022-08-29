const documentUrl = new URL(document.documentURI);
let inEmulation = false;
switch (documentUrl.host) {
  case "127.0.0.1:5000":
  case "localhost:5000":
    inEmulation = true;
    break;
}

let firebaseConfig = {};
let firebaseEmulators;
if (inEmulation) {
  firebaseConfig = {
    apiKey: "fake-api-key",
    projectId: "fake-fightertest",
  }
  firebaseEmulators = {
    "auth": {
      "host": "localhost",
      "port": 9099
    },
    "firestore": {
      "host": "localhost",
      "port": 8080
    }
  };
}

export default {
  firebaseConfig,
  firebaseEmulators,
  inEmulation,
};