
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from '/node_modules/dat.gui/build/dat.gui.module.js';


//initialization
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
let aspect = (window.innerWidth) / (window.innerHeight);
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1500);
let cameraRotation = 0;
let cameraRotationSpeed = 0.002;
let cameraAutoRotation = true;
let orbitControls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight('white')
let spotlight = new THREE.SpotLight('black');
const textureLoader = new THREE.TextureLoader();


let planetProto = {
    sphere: function (size) {
        let sphere = new THREE.SphereGeometry(size, 55, 56);
        return sphere;
    },
    material: function (options) {
        let material = new THREE.MeshPhongMaterial();
        if (options) {
            for (var property in options) {
                material[property] = options[property];
            }
        }
        return material;
    },
    glowMaterial: function (intensity, fade, color) {
        let glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                'c': {
                    type: 'f',
                    value: intensity
                },

                'p': {
                    type: 'p',
                    value: fade
                },

                glowColor: {
                    type: 'c',
                    value: new THREE.Color(color)
                },

                viewVector: {
                    type: 'v3',
                    value: camera.position
                }
            },
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        return glowMaterial;

    },
};


// creating our planet
let createPlanet = function (options) {
    let surfaceGeometry = planetProto.sphere(options.surface.size);
    let surfaceMaterial = planetProto.material(options.surface.material);
    let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

    let atmosphereGeometry = planetProto.sphere(options.surface.size + options.atmosphere.size);
    let atmoshphereMaterialDefaults = {
        side: THREE.FrontSide,
        transparent: true
    };
    let atmosphereMaterialOptions = Object.assign(atmoshphereMaterialDefaults, options.atmosphere.material);
    let atmosphereMaterial = planetProto.material(atmosphereMaterialOptions);
    let atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    let planet = new THREE.Object3D();
    surface.name = 'surface';
    atmosphere.name = 'atmosphere';
    planet.add(surface);
    planet.add(atmosphere);
    for (let textureProperty in options.surface.texture) {
        planet.Proto.texture(
            surfaceMaterial,
            textureProperty,
            options.surface.textures[textureProperty]);
    }
    return planet;
};


// addding surface, atmosphere, glow to the model of the planet
let nerona = createPlanet({
    surface: {
        size: 10,
        material: {
            shininess: 10
        },
    },

    atmosphere: {
        size: 1,
        material: {
            opacity: 0
        },

        glow: {
            size: 0.02,
            intensity: 0.7,

        }
    }
});



// geometry of the planet 
var planet_geometry = new THREE.SphereGeometry(1.2, 100, 100);
var planet_material = new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cloud.png') });
var cloud = new THREE.Mesh(planet_geometry, planet_material);
cloud.overdraw = true;
cloud.castShadow = true;
scene.add(cloud);



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(1, 1, 1);
orbitControls.enabled = !cameraAutoRotation;

//adding camera and lights
scene.add(camera);
scene.add(light);
scene.add(spotlight);


spotlight.position.set(0, 0, 1);

nerona.recieveShadow = true;
nerona.castShadow = true;
nerona.getObjectByName('surface').geometry.center();

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


//rendering the model
let render = function () {
    nerona.getObjectByName('surface').rotation.y += 1 / 32 * 0.01;
    nerona.getObjectByName('atmosphere').rotation.y += 1 / 16 * 0.01;
    if (cameraAutoRotation) {
        cameraRotation += cameraRotationSpeed;
        camera.position.y = 0;
        camera.position.x = 2 * Math.sin(cameraRotation);
        camera.position.z = 2 * Math.cos(cameraRotation);
        camera.lookAt(nerona.position);
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

render()


//adding gui and camera controls
let gui = new GUI();
let guiCamera = gui.addFolder('Camera');

var cameraControls = new function () {
    this.speed = cameraRotationSpeed;
    this.orbitControls = !cameraAutoRotation;
}();

guiCamera.add(cameraControls, 'speed', 0, 0.1).step(0.001).onChange(function (value) {
    cameraRotationSpeed = value;
}); guiCamera.add(cameraControls, 'orbitControls').onChange(function (value) {
    cameraAutoRotation = !value;
    orbitControls.enabled = value;
});