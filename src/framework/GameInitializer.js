import {
    Scene,
    Engine,
    FreeCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
} from "@babylonjs/core";
import '@babylonjs/loaders';

export default {
    data() {
        return {
            engine: null,
            scene: null,
            camera: null,
            light: null,
            ground: null,
        };
    },
    methods: {
        initGame(canvas) {
            //Setup game environment
            this.createEngine(canvas);
            this.createScene();
            this.createLight();
            this.createCamera();

            // //Create game meshes
            this.createGround();

            //Start game render
            this.renderGame();
        },

        //Environment
        createEngine(canvas) {
            this.engine = new Engine(canvas, true);
        },
        createScene() {
            this.scene = new Scene(this.engine);
        },
        createLight() {
            this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
            this.light.intensity = 0.75;
        },
        createCamera() {
            this.camera = new FreeCamera('camera', new Vector3(0, 7, -12), this.scene);
            this.camera.speed = 0.25;
            this.camera.rotation = new Vector3(0.5, 0, 0);
        },

        //Meshes
        createGround() {
            this.ground = MeshBuilder.CreateGround('ground', {width: 10, height: 10}, this.scene);
        },

        //Render Main Game
        renderGame() {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        },
    },
}