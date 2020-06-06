const canvas = new Pebble.Canvas(document.body, 800, 800, "none", "white");
const stage = new Pebble.Stage(canvas.width, canvas.height);
const assets = new Pebble.AssetLoader();
const storage = new Pebble.Storage();
const world = new Pebble.World(stage);

const pointer = Pebble.Pointer(canvas.domElement);

canvas.scaleToWindow("grey", pointer);

window.addEventListener("resize", () => canvas.scaleToWindow("grey", pointer));

Pebble.interpolationData.FPS = 30;

Pebble.refreshLoop();

(async function init() {
    await assets.load([

        "js/setup.js",
        "js/main.js",
        "js/species.js",

    ], false);
    await assets["js/species.js"].execute();
    await assets["js/setup.js"].execute();
    await assets["js/main.js"].execute();
    Animate();
})();