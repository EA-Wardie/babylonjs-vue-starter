<template>
    <div>
        <div id="fps"></div>
        <canvas></canvas>
    </div>
</template>

<script setup>
    import {
        Color3,
        Engine,
        FreeCamera,
        HemisphericLight,
        MeshBuilder,
        Scene,
        Vector3
    } from '@babylonjs/core';
    import {onMounted} from "vue";

    onMounted(() => {
        initGame();
    });

    function initGame() {
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

        //Floor
        const options = {width: 10, height: 10},
                ground = MeshBuilder.CreateGround("ground", options, scene);

        function renderGame(engine, scene) {
            let divFps = document.getElementById("fps");

            engine.runRenderLoop(() => {
                divFps.innerHTML = engine.getFps().toFixed() + " fps";
                scene.render();
            });
        }

        renderGame(engine, scene);
    }
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
