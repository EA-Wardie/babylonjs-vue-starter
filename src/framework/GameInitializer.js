import {
    Engine,
    FreeCamera,
    HemisphericLight,
    MeshBuilder,
    Scene,
    SolidParticleSystem,
    StandardMaterial,
    Texture,
    Vector3,
    CannonJSPlugin, PhysicsImpostor, DeviceSourceManager, DeviceType, KeyboardEventTypes,
} from "@babylonjs/core";
import '@babylonjs/loaders';
import {MapGenerator} from 'noise-map';
import * as cannon from 'cannon';

export default {
    data() {
        return {
            engine: null,
            scene: null,
            light: null,
            camera: null,
            device: null,
            ground: null,
            player: null,
        };
    },
    methods: {
        initGame(canvas) {
            //Setup game environment
            this.createEngine(canvas);
            this.createScene();
            this.createLight();
            this.createCamera();
            this.createDeviceSourceManager();

            //Inputs
            this.handleInputs();

            // //Create game meshes
            this.createPlayer();
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
            const gravityVector = new Vector3(0, -9.81, 0),
                physicsPlugin = new CannonJSPlugin(true, 10, cannon);

            this.scene.enablePhysics(gravityVector, physicsPlugin);
        },
        createLight() {
            this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
            this.light.intensity = 1;
        },
        createCamera() {
            this.camera = new FreeCamera('camera', new Vector3(0, 15, -30), this.scene);
            this.camera.speed = 2;
            this.camera.inertia = 0.2;
            this.camera.rotation = new Vector3(0.5, 0, 0);
            this.camera.attachControl();
        },
        createDeviceSourceManager() {
            this.device = new DeviceSourceManager(this.scene.getEngine());
        },

        //Meshes
        createPlayer() {
            this.player = MeshBuilder.CreateBox('player', {size: 1}, this.scene);
            this.player.position.y = 10;
            // this.player.setEnabled(false);
            // this.registerPlayerAsPhysicsImposter();
        },
        generateVoxelTerrain() {
            this.createVoxelTerrain(10000, 1);
            // this.registerVoxelTerrainAsPhysicsImposter();
        },

        //Render Game
        renderGame() {
            this.engine.runRenderLoop(() => {
                this.scene.render();
                // this.handleInputs();
            });
        },

        //Inputs
        handleInputs() {
            this.handleKeyboardMovement();
        },
        handleKeyboardMovement() {
            window.addEventListener('keypress', event => {
                if (event.key === 'w') {
                    this.player.position.z += 1;
                } else if (event.key === 'a') {
                    this.player.position.x -= 1;
                } else if (event.key === 'd') {
                    this.player.position.x += 1;
                } else if (event.key === 's') {
                    this.player.position.z -= 1;
                }
            });
        },

        //Helpers
        createVoxelTerrain(totalVoxels, voxelSize = 0.1) {
            const sps = new SolidParticleSystem('sps', this.scene, {isPickable: true}),
                voxel = MeshBuilder.CreateBox('voxel', {size: voxelSize}, this.scene);

            sps.addShape(voxel, totalVoxels);
            voxel.dispose();
            this.ground = sps.buildMesh();

            sps.initParticles = () => {
                let row = 0;
                const sqrtSize = Math.sqrt(totalVoxels).toFixed(0),
                    heightMap = this.getPerlinNoiseHeightMap(sqrtSize, sqrtSize);

                for (let p = 0; p < sps.nbParticles; p++) {
                    const col = -(-p % sqrtSize),
                        particle = sps.particles[p],
                        displacement = (sqrtSize * voxelSize) / 2,
                        particleHeight = heightMap.get(row, col) / 0.1;

                    particle.position.x = (col * voxelSize) - displacement;
                    particle.position.z = (row * voxelSize) - displacement;
                    particle.position.y = particleHeight;

                    if (col === sqrtSize - 1) {
                        row++;
                    }
                }
            };

            sps.initParticles();
            sps.setParticles();
            sps.refreshVisibleSize();
            sps.isAlwaysVisible = true;
            sps.computeParticleTexture = false;

            const grassMaterial = new StandardMaterial('grass');
            grassMaterial.diffuseTexture = new Texture('./assets/textures/stone.png');
            this.ground.material = grassMaterial;

            // this.registerSPSEventSystem(sps);
        },
        // registerSPSEventSystem(sps, voxelSize = 1) {
        //     this.scene.onPointerDown = (_, pickResult) => {
        //         const faceId = pickResult.faceId;
        //         if (faceId === -1) {
        //             return;
        //         }
        //         const picked = sps.pickedParticle(pickResult),
        //             idx = picked.idx,
        //             particle = sps.particles[idx];
        //
        //         this.player.setEnabled(true);
        //         this.player.position.x = particle.position.x;
        //         this.player.position.z = particle.position.z;
        //         this.player.position.y = particle.position.y + 1;
        //     };
        // },
        // registerVoxelTerrainAsPhysicsImposter() {
        //     this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor, {
        //         mass: 0,
        //         friction: 0.5,
        //         restitution: 1
        //     }, this.scene);
        // },
        // registerPlayerAsPhysicsImposter() {
        //     this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.SphereImpostor, {
        //         mass: 0.1,
        //         restitution: 1
        //     }, this.scene);
        // },
        getPerlinNoiseHeightMap(width, height) {
            const generator = new MapGenerator(Math.random(), {type: 'perlin'});
            return generator.createMap(width, height);
        }
    },
}