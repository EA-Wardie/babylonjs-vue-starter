import {
    Scene,
    Engine,
    FreeCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Texture,
    SolidParticleSystem,
    Scalar,
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
            // this.createGround();
            this.generateVoxelTerrain();

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
            this.camera.attachControl();
        },

        //Meshes
        createGround() {
            this.ground = MeshBuilder.CreateGround('ground', {width: 200, height: 100}, this.scene);

            this.setGroundTexture();
        },
        generateVoxelTerrain() {
            // const voxelSpacing = 0.5;
            // const voxel = MeshBuilder.CreateBox('voxel', {size: voxelSpacing}, this.scene);
            // const voxelClone = voxel.clone();
            // voxelClone.position = new Vector3(voxelSpacing, 0, 0);
            this.createVoxelMap(4096);
            // console.log(voxelArea);
        },
        //Render Main Game
        renderGame() {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        },

        //Helpers
        setGroundTexture() {
            const groundMaterial = new StandardMaterial('ground_texture', this.scene);
            groundMaterial.diffuseTexture = new Texture('./assets/textures/mars_1k_color.jpg');

            this.ground.material = groundMaterial;
        },
        createVoxelMap(size, slope = 0.5) {
            const sps = new SolidParticleSystem('sps', this.scene),
                voxelSpacing = 0.5,
                voxel = MeshBuilder.CreateBox('voxel', {size: voxelSpacing}, this.scene);

            sps.addShape(voxel, size);
            voxel.dispose();
            sps.buildMesh();
            sps.initParticles = () => {
                const sqrtSize = Math.sqrt(size).toFixed(0);
                let row = 0;
                for (let p = 0; p < sps.nbParticles; p++) {
                    const col = -(-p % sqrtSize),
                        randomHeight = Math.random();

                    sps.particles[p].position.x = col / 2;
                    sps.particles[p].position.z = row / 2;
                    if (randomHeight > slope) {
                        sps.particles[p].position.y = sps.particles[p].position.y + randomHeight;
                    } else {
                        sps.particles[p].position.y = sps.particles[p].position.y - randomHeight;
                    }

                    if (col === sqrtSize - 1) {
                        row++;
                    }
                }
            };

            sps.initParticles();
            sps.setParticles();
        },
    },
}