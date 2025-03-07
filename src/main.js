import * as THREE from "three";
import fragment from "../shaders/fregment.glsl";
import vertex from "../shaders/vertices.glsl";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { remove } from "three/examples/jsm/libs/tween.module.js";

gsap.registerPlugin(ScrollTrigger);

// Scene setup
const scene = new THREE.Scene();
const cameraPosition = 12;
const fov =
  2 * Math.atan(window.innerHeight / 2 / cameraPosition) * (180 / Math.PI);

const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = cameraPosition;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Load HDRI Environment Map
new RGBELoader().load("../public/assets/hdrs/lobby.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Load textures
const textureLoader = new THREE.TextureLoader();
const flavorTextures = {
  lemonLime: textureLoader.load("../public/assets/labels/lemon-lime.png"),
  grape: textureLoader.load("../public/assets/labels/grape.png"),
  blackCherry: textureLoader.load("../public/assets/labels/cherry.png"),
  strawberryLemonade: textureLoader.load(
    "../public/assets/labels/strawberry.png"
  ),
  watermelon: textureLoader.load("../public/assets/labels/watermelon.png"),
};

//fix color of can
Object.values(flavorTextures).forEach((cover) => {
  cover.colorSpace = THREE.SRGBColorSpace;
});

// Fix upside down labels
Object.values(flavorTextures).forEach((texture) => (texture.flipY = false));

const metalMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.3,
  metalness: 0.8,
  color: "#bbbbbb",
});

//load can from gltf
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);
const loadCan = (positionX, positionY, rotationZ, finalTexture) => {
  loader.load("../public/assets/models/Soda-can.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.set(4, 4, 4);
    model.rotation.y = Math.PI;
    model.rotation.z = rotationZ;
    model.position.x = positionX;
    model.position.y = positionY;

    // Apply textures
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name === "cylinder_1") {
          child.material = new THREE.MeshPhysicalMaterial({
            roughness: 0.1,
            metalness: 0.75,
            reflectivity: 1,
            map: finalTexture,
          });
        } else {
          child.material = metalMaterial;
        }
      }
    });

    // Animate cans based on their flavor texture
    gsap.from(model.rotation, {
      x: 0.2,
      duration: 4,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(model.rotation, {
          y: 0.5,
          z: 0.2,
          x: -0.2,
          duration: 8,
          yoyo: true,
          repeat: -1,
          ease: "power2.inOut",
        });
      },
    });

    if (finalTexture === flavorTextures.blackCherry) {
      gsap.from(model.position, {
        y: 5,
        x: -4,
        repeat: 0,
        duration: 5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(model.position, {
            y: 0.4,
            duration: 10,
            yoyo: true,
            repeat: -1,
            ease: "bounce.inOut",
          });
        },
      });
      gsap.from(model.rotation, {
        x: 0.2,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(model.rotation, {
            y: Math.PI / 2,
            z: -0.1,
            x: 0.1,
            duration: 10,
            yoyo: true,
            repeat: -1,
            ease: "power2.inOut",
          });
        },
      });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavorSeaction",
          start: "top 90%",
          end: "top 20%",
          scrub: 2,
          markers: true,
        },
      });
      tl.to(model.position, {
        x: Math.PI,
        z: 1,
        duration: 5,
      });
      tl.to(model.position, {
        x: -0.5,
        z: -3,
        duration: 5,
      });
      tl.to(model.position, {
        x: 1.5,
        y: -0.5,
        duration: 4,
      });
    } else if (finalTexture === flavorTextures.lemonLime) {
      gsap.from(model.position, {
        y: 5,
        x: 4,
        duration: 5,
        repeat: 0,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(model.position, {
            y: 0.8,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
          });
        },
      });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavorSeaction",
          start: "top 90%",
          end: "top 20%",
          scrub: 2,
          markers: true,
        },
      });
      tl.to(model.position, {
        x: -Math.PI,
        z: -1,
        duration: 5,
      });
      tl.to(model.position, {
        x: 2.7,
        z: -3,
        duration: 5,
      });
      tl.to(model.position, {
        x: 5,
        y: -0.5,
        duration: 4,
      });
    }

    if (finalTexture === flavorTextures.grape) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavorSeaction",
          scroll: "body",
          start: "top 90%",
          end: "top 20%",
          scrub: 2,
          markers: true,
        },
      });
      tl.from(model.position, {
        y: 7,
        x: -1,
        z: -2,
        duration: 4,
      });
      tl.to(model.position, {
        y: 1,
        x: 2,
        duration: 4,
      });
      tl.to(model.position, {
        y: 1.5,
        x: -0.1,
        z: -2,
      });
      tl.to(model.position, {
        x: 2,
        y: 1.3,
        duration: 4,
      });
    }

    if (finalTexture === flavorTextures.watermelon) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavorSeaction",
          scroll: "body",
          start: "top 90%",
          end: "top 20%",
          scrub: 2,
          markers: true,
        },
      });
      tl.from(model.position, {
        y: -7,
        x: 0.2,
        z: -2,
        duration: 4,
      });
      tl.to(model.position, {
        y: -1,
        x: -2,
        duration: 4,
      });

      tl.to(model.position, {
        y: 1.5,
        x: 1.7,
        z: -2,
        duration: 4,
      });
      tl.to(model.position, {
        x: 3.7,
        y: 1.3,
        duration: 4,
      });
    }
    if (finalTexture === flavorTextures.strawberryLemonade) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavorSeaction",
          scroll: "body",
          start: "top 90%",
          end: "top 20%",
          scrub: 2,
          markers: true,
        },
      });
      tl.from(model.position, {
        y: 5,
        x: -3,
        z: 2,
        duration: 4,
      });
      tl.to(model.position, {
        y: 0.1,
        x: 0.7,
        z: 2,
        duration: 4,
      });
      tl.to(model.position, {
        x: 2.2,
        y: -0.5,
        duration: 4,
      });
    }

    scene.add(model);
  });
};

//call cans
loadCan(-2.5, 0.2, 0.5, flavorTextures.blackCherry);
loadCan(2.5, 0.2, -0.5, flavorTextures.lemonLime);
loadCan(0.2, 1, 0, flavorTextures.grape);
loadCan(0.1, -0.1, 0, flavorTextures.watermelon);
loadCan(0.2, -0.1, 0, flavorTextures.strawberryLemonade);
//call another can in scroll

//create random bubbls
function createBubble() {
  const bubbleGroup = new THREE.Group();
  scene.add(bubbleGroup);
  const bubbleGeo = new THREE.SphereGeometry(Math.random() * 0.2 + 0.1, 32, 32);
  const bubbleMaterial = new THREE.MeshStandardMaterial({
    color: "#FFB6C1",
    transparent: true,
    opacity: Math.random() * 1.5,
    blending: THREE.AdditiveBlending, // More transparent effect
    depthWrite: false, // Fixes transparency stacking issue
  });
  const bubble = new THREE.Mesh(bubbleGeo, bubbleMaterial);

  bubble.position.set(
    ((Math.random() - 0.5) * window.innerWidth) / 50,
    -4,
    Math.random() * 2 - 1
  );

  bubbleGroup.add(bubble);
  //animate bubble

  gsap.to(bubble.position, {
    y: 4,
    duration: Math.random() * 10 + 2,
    repeat: -1,
    ease: "power2.inOut",
    onComplete: () => {
      bubbleGroup.remove(bubble);
    },
  });
}

// Create multiple bubbles on first load
function generateInitialBubbles(count) {
  for (let i = 0; i < count; i++) {
    createBubble();
  }
}

function continous() {
  setInterval(() => {
    createBubble();
  }, 3000);
}
generateInitialBubbles(150);
continous();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

const tl = gsap.timeline();

tl.from(".heading1, .heading2", {
  scale: 3,
  duration: 0.5,
  delay: 0.3,
  opacity: 0,
  stagger: 1,
  ease: "power2.inOut",
});

tl.from(".tagline1, .tagline2, .btn", {
  y: 10,
  duration: 0.3,
  opacity: 0,
  stagger: 1,
  ease: "power2.inOut",
});

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: ".flavorSeaction",
    start: "top 90%",
    end: "top 80%",
    scrub: 2,
    markers: true,
  },
});

tl2.to(".heroSeaction", {
  backgroundColor: "#D9F99D",
  ease: "none",
  duration: 1,
});
