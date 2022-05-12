<template>
  <div>
    <div id="fps"></div>
    <canvas></canvas>
  </div>
</template>

<script>
  import {
    ActionManager,
    AssetsManager,
    Color3,
    Engine,
    ExecuteCodeAction,
    FreeCamera,
    HemisphericLight,
    MeshBuilder,
    Scene, SpriteMap,
    Texture,
    Vector2,
    Vector3
  } from '@babylonjs/core';

  export default {
    name: "App",
    methods: {
      initGame() {
        //Engine
        const engine = new Engine(document.querySelector('canvas'), true);

        //Scene
        const scene = new Scene(engine);

        //Light
        const light = new HemisphericLight('hemi_light', new Vector3(-1, 1, 0), scene);
        light.specular = new Color3(0.88, 0.42, 0.05);
        light.intensity = 1;

        //Camera
        const camera = new FreeCamera('camera', new Vector3(0, 6, -4.7));
        camera.rotation = new Vector3(Math.PI / 4, 0, 0);

        //Dev only
        camera.attachControl();
        camera.speed = 0.5;

        //Player
        // const player = MeshBuilder.CreateBox('player', {size: 0.1, height: 0.2});
        // player.checkCollisions = true;
        // player.position.y = 1;
        // player.isPickable = false;

        //Floor
        const spriteSheetTexture = new Texture('./assets/sprite_sheet_2.png', scene),
            assetsManager = new AssetsManager(scene),
            tileMapDataTask = assetsManager.addTextFileTask('tile_map_data_task', './assets/sprite_sheet_2.json');
        tileMapDataTask.onSuccess = (task) => {
          const tileMapData = JSON.parse(task.text),
              stageSize = new Vector2(10, 10),
              floor = new SpriteMap(
                  'floor',
                  tileMapData,
                  spriteSheetTexture,
                  {
                    outputPosition: new Vector3.Zero(),
                    outputRotation: new Vector3(Math.PI / 2, -Math.PI / 4, 0),
                    stageSize: stageSize,
                    baseTile: 128,
                  },
                  scene,
              );

          const tileMapSettings = require('@/assets/tile_map_2.json')
          tileMapSettings['map'].forEach((row, rowIndex) => {
            row.forEach((spriteIdx, colIndex) => {
              floor.changeTiles(0, new Vector2(colIndex, rowIndex), spriteIdx);
            });
          });
        }

        assetsManager.load();

        //Inputs
        // let inputMap = {};
        // scene.actionManager = new ActionManager(scene);
        // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
        //   inputMap[event.sourceEvent.key] = event.sourceEvent.type === 'keydown';
        // }));
        // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
        //   inputMap[event.sourceEvent.key] = event.sourceEvent.type === 'keydown';
        // }));
        //
        // scene.onBeforeRenderObservable.add(() => {
        //   if (inputMap['w']) {
        //     player.position.z += 0.01
        //     camera.position.z += 0.01
        //   }
        //
        //   if (inputMap['a']) {
        //     player.position.x -= 0.01
        //     camera.position.x -= 0.01
        //   }
        //
        //   if (inputMap['s']) {
        //     player.position.z -= 0.01
        //     camera.position.z -= 0.01
        //   }
        //
        //   if (inputMap['d']) {
        //     player.position.x += 0.01
        //     camera.position.x += 0.01
        //   }
        // });

        this.renderGame(engine, scene);
      },
      renderGame(engine, scene) {
        let divFps = document.getElementById("fps");

        engine.runRenderLoop(() => {
          divFps.innerHTML = engine.getFps().toFixed() + " fps";
          scene.render();
        });
      },
    },
    mounted() {
      this.initGame();
    },
  };
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100%;
    height: 100%;
  }

  #fps {
    position: absolute;
    background-color: black;
    text-align: center;
    font-size: 16px;
    color: white;
    top: 10px;
    right: 10px;
    width: 60px;
    height: 20px;
    font-weight: 700;
  }
</style>
