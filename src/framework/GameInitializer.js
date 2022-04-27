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
    CannonJSPlugin, PhysicsImpostor,
} from "@babylonjs/core";
import '@babylonjs/loaders';
import {MapGenerator} from 'noise-map';
import * as cannon from 'cannon';

export default {
    data() {
        return {
            engine: null,
            scene: null,
            camera: null,
            light: null,
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
            this.camera = new FreeCamera('camera', new Vector3(0, 7, -12), this.scene);
            this.camera.speed = 2;
            this.camera.inertia = 0.2;
            this.camera.rotation = new Vector3(0.5, 0, 0);
            this.camera.attachControl();
        },

        //Meshes
        createPlayer() {
            this.player = MeshBuilder.CreateBox('player', {size: 0.5}, this.scene);
            this.player.position.y = 0.5;

            // this.registerPlayerAsPhysicsImposter();
        },
        generateVoxelTerrain() {
            this.createVoxelTerrain(10000);
            // this.registerVoxelTerrainAsPhysicsImposter();
        },

        //Render Game
        renderGame() {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        },

        //Helpers
        createVoxelTerrain(totalVoxels, voxelSize = 0.1) {
            const sps = new SolidParticleSystem('sps', this.scene),
                voxel = MeshBuilder.CreateBox('voxel', {size: voxelSize}, this.scene);

            sps.addShape(voxel, totalVoxels);
            voxel.dispose();
            this.ground = sps.buildMesh();
            sps.initParticles = () => {
                const sqrtSize = Math.sqrt(totalVoxels).toFixed(0),
                    heightMap = this.getPerlinNoiseHeightMap(sqrtSize, sqrtSize);
                let row = 0;

                for (let p = 0; p < sps.nbParticles; p++) {
                    const col = -(-p % sqrtSize),
                        particle = sps.particles[p],
                        displacement = (sqrtSize * voxelSize) / 2,
                        particleHeight = heightMap.get(row, col);

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
            sps.isAlwaysVisible = true;

            const grassMaterial = new StandardMaterial('grass');
            grassMaterial.diffuseTexture = new Texture('./assets/textures/stone.png');
            this.ground.material = grassMaterial;

            if(this.player.intersectsMesh(this.ground)) {
                this.player.position.y = 2;
            }
        },
        registerVoxelTerrainAsPhysicsImposter() {
            this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0.5, restitution: 0}, this.scene);
        },
        registerPlayerAsPhysicsImposter() {
            this.player.physicsImpostor = new PhysicsImpostor(this.player, PhysicsImpostor.BoxImpostor, {mass: 0.1, restitution: 0}, this.scene);
        },
        getPerlinNoiseHeightMap(width, height) {
            const generator = new MapGenerator(Math.random(), {type: 'perlin'});
            return generator.createMap(width, height);
        }
    },
}