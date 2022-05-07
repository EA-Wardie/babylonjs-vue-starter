import {
    ActionManager,
    Color3,
    Engine, ExecuteCodeAction,
    FreeCamera,
    HemisphericLight, Mesh,
    MeshBuilder,
    Scene,
    SolidParticleSystem,
    Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import SimplexNoise from 'simplex-noise';

export default {
    data() {
        return {
            engine: null,
            scene: null,
            light: null,
            camera: null,
            sps: null,
            ground: null,
            player: null,
            globalDistanceMap: {},
        };
    },
    // watch: {
    //     globalDistanceMap: {
    //         deep: true,
    //         handler: (val) => {
    //             console.log(val['w'] % 2);
    //         },
    //     },
    // },
    methods: {
        initGame(canvas) {
            //Setup game environment
            this.createEngine(canvas);
            this.createScene();
            this.createLight();
            this.createCamera();

            // //Create game meshes
            this.createPlayer();
            this.createVoxelFloor();
            // this.createFloor();

            //Inputs
            this.registerInputs();

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
            this.light.intensity = 0.5;
        },
        createCamera() {
            this.camera = new FreeCamera('camera', new Vector3(0, 5, -3.2), this.scene);
            this.camera.rotation = new Vector3(1, 0, 0);
        },

        //Meshes
        createPlayer() {
            this.player = MeshBuilder.CreateBox('player', {size: 0.1, height: 0.2}, this.scene);
            this.player.checkCollisions = true;
            this.player.position.y = 0.2;
            this.player.isPickable = false;
        },
        createVoxelFloor() {
            this.generateVoxelFloor(20);
        },
        // createFloor() {
        //     this.ground = MeshBuilder.CreateGround('floor', {width: 10, height: 10}, this.scene);
        // },

        //Inputs
        registerInputs() {
            let inputMap = {};

            this.scene.actionManager = new ActionManager(this.scene);
            this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (event) {
                inputMap[event.sourceEvent.key] = event.sourceEvent.type === 'keydown';
            }));
            this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (event) {
                inputMap[event.sourceEvent.key] = event.sourceEvent.type === 'keydown';
            }));

            this.handlePlayerMovement(inputMap);
        },
        handlePlayerMovement(inputMap) {
            // this.sps.removeParticles(0, 9);
            // this.sps.buildMesh();
            // this.sps.setParticles();
            let directionDistanceMap = {w: 0, a: 0, s: 0, d: 0};
            this.scene.onBeforeRenderObservable.add(() => {
                if (inputMap['w']) {
                    this.player.position.z += 0.01
                    this.camera.position.z += 0.01
                    this.updateDirectionDistanceMap(directionDistanceMap, 'w');
                    // this.player.rotation.y = 0
                }

                if (inputMap['a']) {
                    this.player.position.x -= 0.01
                    this.camera.position.x -= 0.01
                    this.updateDirectionDistanceMap(directionDistanceMap, 'a');
                    // this.player.rotation.y = 3 * Math.PI / 2
                }

                if (inputMap['s']) {
                    this.player.position.z -= 0.01
                    this.camera.position.z -= 0.01
                    this.updateDirectionDistanceMap(directionDistanceMap, 's');
                    // this.player.rotation.y = 2 * Math.PI / 2
                }

                if (inputMap['d']) {
                    this.player.position.x += 0.01
                    this.camera.position.x += 0.01
                    this.updateDirectionDistanceMap(directionDistanceMap, 'd');
                    // this.player.rotation.y = Math.PI / 2
                }
            });

            // setInterval(() => {
            //     // this.globalDistanceMap = directionDistanceMap;
            //     this.updateVoxelFloor(directionDistanceMap['w'] % 20, directionDistanceMap['a'] % 20, directionDistanceMap['s'] % 20, directionDistanceMap['d'] % 20);
            // }, 1000);
            // setTimeout(() => {
            //     console.log(directionDistanceMap);
            // }, 5000);
        },

        //Render Game
        renderGame() {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        },

        //Helpers
        generateVoxelFloor(size, voxelSize = 0.1) {
            this.sps = new SolidParticleSystem('sps_floor', this.scene, {isPickable: true, expandable: true});
            const voxel = MeshBuilder.CreateBox('voxel', {size: voxelSize}, this.scene);

            this.sps.addShape(voxel, size * size);
            voxel.dispose();
            this.ground = this.sps.buildMesh();

            this.sps.initParticles = () => {
                let row = 0;
                const simplex = new SimplexNoise('1.34524564573568854834562');
                let noise = [];
                noise[row] = [];
                for (let p = 0; p < this.sps.nbParticles; p++) {
                    const col = -(-p % size),
                        displacement = (size * voxelSize) / 2,
                        particle = this.sps.particles[p],
                        y = simplex.noise2D(row, col) / 40;

                    particle.position.x = (col * voxelSize) - displacement;
                    particle.position.z = (row * voxelSize) - displacement;
                    particle.position.y = y;
                    noise[row][col] = simplex.noise2D(row, col);
                    this.setParticleColor(particle, y);

                    if (col === size - 1) {
                        row++;
                        noise[row] = [];
                    }
                }
            };

            this.sps.isAlwaysVisible = true;
            this.sps.initParticles();
            this.sps.setParticles();
            this.sps.refreshVisibleSize();
            this.sps.computeParticleTexture = false;
        },
        setParticleColor(particle, modifier) {
            if (!modifier.toString().includes('-')) {
                particle.color = new Color3(92 / 255, 106 / 255, 77 / 255);
            } else {
                particle.color = new Color3(102 / 255, 116 / 255, 87 / 255);
            }
        },
        updateDirectionDistanceMap(map, key) {
            if (key === 'w') {
                map[key] += 0.01;

                if (map['s'] > 0) {
                    map['s'] -= 0.01;
                }
            }

            if (key === 'a') {
                map[key] += 0.01;

                if (map['d'] > 0) {
                    map['d'] -= 0.01;
                }
            }

            if (key === 's') {
                map[key] += 0.01;

                if (map['w'] > 0) {
                    map['w'] -= 0.01;
                }
            }

            if (key === 'd') {
                map[key] += 0.01;

                if (map['a'] > 0) {
                    map['a'] -= 0.01;
                }
            }
        },
        updateVoxelFloor(totalW, totalA, totalS, totalD) {
            // if(totalW > 1) {
            //     this.sps.removeParticles(0, 9);
            //     this.sps.removeParticles(0, 9);
            // }
            // console.log(totalW, totalA, totalS, totalD);
        },
    },
}