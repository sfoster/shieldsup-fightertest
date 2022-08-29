# FighterTest

**Part of an Explortation for ShieldsUp!**

**A super accessible Bridge-Sim for the Web**

Built with [A-Frame](https://aframe.io), a web framework for building virtual reality experiences.

Started building from https://hacks.mozilla.org/2018/03/immersive-aframe-low-poly/.

## dist/serializeScene.html 

Takes the initial FighterTest demo and adds a function to export all the a-frame entities and assets as a JSON structure.
Load the page and click the "Serialize scene" link/button in the top right of the page to take a snapshot, and click again to download the serialized .json file with the assets and entities it found in the `<a -scene>`.

## dist/sceneFromJSON.html

Loads what it finds at `./scene.json` and creates the necessary elements to re-populate ("thaw") the a-frame scene. This has only been tested with the fightertest demo and the format exported by `sceneFromJSON.html` so its likely other a-frame scenes will need some tweaks. 

## dist/index.html

This currently expects to be running under the firebase emulators, using a projectId of `fightertest`. Just because the admin sdk script is also expecting to put its data in the emulated firestore. You'll need to:
* [follow the instructions to install the emulators](https://firebase.google.com/docs/emulator-suite)
* run `firebase use fightertest` (you may need to create a remote/non-emulated project of this name first?)
* run `firebase emulators:start --project fightertest`
* follow the instructions to [get your service account credentials](https://firebase.google.com/support/guides/service-accounts), and save the resulting file to `.fightertest-firebase-adminsdk.json` in this directory
* run the admin.js script to populate your db: `node scripts/admin.js --cmd import --input ./dist/scene.json`
* (check the emulated firestore has got assets and entities documents, should be at: http://localhost:4000/firestore/ )
* open the index.html via the emulated firebase hosting, at http://127.0.0.1:5000/serializeScene.html
