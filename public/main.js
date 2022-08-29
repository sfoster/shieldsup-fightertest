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
        console.warn("Missing parentNode for child", entity, entity.parentId);
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

function thawScene(sceneData) {
  addAssets(sceneData.assets);

  let sortedEntities = window.sortedEntities = [];
  for (entity of sceneData.entities) {
    if (!entity.depth) {
      entity._depth = entity.id.split(" > ").length;
    }
    sortedEntities.push(entity);
  }
  sortedEntities.sort((a, b) => {
    return a._depth > b._depth;
  });
  addEntities(sortedEntities);
}

window.addEventListener("DOMContentLoaded", async () => {
  let resp = await fetch("./scene.json");
  let data = await resp.json();
  thawScene(data);
});

