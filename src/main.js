import * as THREE from "three";
import fragment from "../shaders/fregment.glsl";
import vertex from "../shaders/vertices.glsl";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

gsap.registerPlugin(ScrollTrigger);

// Scene setup
const scene = new THREE.Scene();
const cameraPosition = 12;
const fov =
  2 * Math.atan(window.innerHeight / 2 / cameraPosition) * (180 / Math.PI);

const camera1 = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera1.position.z = cameraPosition;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas1"),
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
          /* markers: true, */
          onLeave: () => {
            gsap.set(model.position, { x: 1.5, y: -0.5 }); // Fix position when leaving flavor section
          },
          onEnterBack: () => {
            gsap.set(model.position, { x: -2.5, y: 0.2 }); // Reset to initial position
          },
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
            y: 0.6,
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
          /* markers: true, */
          onLeave: () => {
            gsap.set(model.position, { x: 5, y: -0.5 }); // Fix position when leaving flavor section
          },
          onEnterBack: () => {
            gsap.set(model.position, { x: 2.5, y: 0.2 }); // Reset to initial position
          },
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
          /* markers: true, */
          onLeave: () => {
            gsap.set(model.position, { x: 2, y: 1.3 }); // Fix position when leaving flavor section
          },
          onEnterBack: () => {
            gsap.set(model.position, { x: 0.2, y: 1 }); // Reset to initial position
          },
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
          /* markers: true, */
          onLeave: () => {
            gsap.set(model.position, { x: 3.7, y: 1.3 }); // Fix position when leaving flavor section
          },
          onEnterBack: () => {
            gsap.set(model.position, { x: 0.1, y: -0.1 }); // Reset to initial position
          },
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
          /* markers: true, */
          onLeave: () => {
            gsap.set(model.position, { x: 2.2, y: -0.2 }); // Fix position when leaving flavor section
            gsap.set(".heroSeactionCanvas", {
              position: "absolute",
              top: window.innerHeight + "px",
            });
          },
          onEnterBack: () => {
            gsap.set(model.position, { x: 0.2, y: -0.1 }); // Reset to initial position
            gsap.set(".heroSeactionCanvas", {
              position: "fixed",
              top: "0px",
            });
          },
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
        y: -0.2,
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
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  renderer.render(scene, camera1);
}

animate();

// Second canvas setup for diving can animation
const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera2.position.z = cameraPosition;

const renderer2 = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas2"),
  alpha: true,
  antialias: true,
  // preserveDrawingBuffer: true,
});
renderer2.setSize(window.innerWidth, window.innerHeight);
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer2.toneMapping = THREE.ACESFilmicToneMapping;
renderer2.toneMappingExposure = 1;

// Add OrbitControls to second scene
// const controls = new OrbitControls(camera2, renderer2.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.enableZoom = true;

// Use the same environment map for the second scene
// scene2.environment = scene.environment;

// Load HDRI Environment Map
new RGBELoader().load("../public/assets/hdrs/field.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene2.environment = texture;
});

// Load diving can model
const divingCanLoader = new GLTFLoader();
const divingCanDracoLoader = new DRACOLoader();
divingCanDracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/v1/decoders/"
);
divingCanLoader.setDRACOLoader(divingCanDracoLoader);

function loadCloudModel() {
  divingCanLoader.load("../public/assets/cloud_test/scene.gltf", (gltf) => {
    const cloud = gltf.scene;

    // More random positioning across width and depth
    const randomX = ((Math.random() - 0.5) * window.innerWidth) / 45;
    const randomY = Math.random() * -8;
    const randomZ = Math.random() * 8 - 4;
    cloud.position.set(randomX, randomY, randomZ);

    // Random rotation
    cloud.rotation.x = Math.PI + (Math.random() - 0.5) * 0.5;
    cloud.rotation.y = Math.random() * Math.PI * 2;

    // Random scale between 0.5 and 1.5
    const randomScale = 0.5 + Math.random();
    cloud.scale.set(-randomScale, -randomScale, -randomScale);

    scene2.add(cloud);

    // Random animation duration and delay
    gsap.to(cloud.position, {
      y: 5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 2,
      ease: "power1.inOut",
      onComplete: () => {
        scene2.remove(cloud);
      },
    });

    // Random rotation during animation
    gsap.to(cloud.rotation, {
      y: cloud.rotation.y + Math.PI * (Math.random() * 2 - 1),
      duration: Math.random() * 4 + 3,
      ease: "none",
    });
  });
}

function generateInitialClouds(count) {
  for (let i = 0; i < count; i++) {
    loadCloudModel();
  }
}

function cloudInterval() {
  setInterval(() => {
    loadCloudModel();
  }, 2000);
}

// generateInitialClouds(12);
// cloudInterval();

//load can on scene2
divingCanLoader.load("../public/assets/models/Soda-can.gltf", (gltf) => {
  const divingCan = gltf.scene;
  divingCan.position.set(-3, 4, 1); // Start off-screen
  divingCan.scale.set(3.5, 3.5, 3.5);
  divingCan.rotation.y = Math.PI;
  // divingCan.rotation.z = -0.5;
  divingCan.visible = false; // Initially hidden

  // Apply materials to the can
  divingCan.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "cylinder_1") {
        child.material = new THREE.MeshPhysicalMaterial({
          roughness: 0.1,
          metalness: 0.75,
          reflectivity: 1,
          map: flavorTextures.blackCherry,
        });
      } else {
        child.material = metalMaterial;
      }
    }
  });

  gsap.to(divingCan.rotation, {
    y: Math.PI * 3,
    repeat: -1,
    duration: 2,
    ease: "none",
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".divingCan",
      start: "top top",
      end: "70%",
      // markers: true,
      onEnter: () => {
        divingCan.visible = true;
        tl.to(divingCan.position, {
          y: 0,
          x: 0,
          yoyo: true,
          duration: 1,
          ease: "power2.inOut",
        });
      },
      onLeave: () => {
        tl.to(divingCan.position, {
          y: -4,
          x: 3,
          yoyo: true,
          duration: 1,
          ease: "power2.inOut",
        });
        // divingCan.visible = false;
      },
      onEnterBack: () => {
        divingCan.visible = true;
        tl.to(divingCan.position, {
          y: 0,
          x: 0,
          yoyo: true,
          opacity: 1,
          ease: "power2.inOut",
        });
      },
      onLeaveBack: () => {
        tl.to(divingCan.position, {
          y: 4,
          x: -3,
          yoyo: true,
          duration: 1,
          ease: "power2.inOut",
        });
        // divingCan.visible = false;
      },
    },
  });

  // Animation that keeps the can within the divingCan div
  // tl.from(divingCan.position, {
  //   y: 4, // Start from below
  //   x: -3,
  //   duration: 0.1,
  //   ease: "power2.inOut",
  // });

  scene2.add(divingCan);
});

// Handle window resize for the second canvas
window.addEventListener("resize", () => {
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();
  renderer2.setSize(window.innerWidth, window.innerHeight);
});

function animate2() {
  requestAnimationFrame(animate2);
  renderer2.render(scene2, camera2);
}
animate2();
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
    // markers: true,
  },
});

tl2.to(".heroSeaction", {
  backgroundColor: "#D9F99D",
  ease: "none",
  duration: 1,
});

const tl4 = gsap.timeline({
  scrollTrigger: {
    trigger: ".divingCan",
    start: "top -15%",
    end: "bottom 60%",
    scrub: true,
    // markers: true,
  },
});

// Animate words sequentially as user scrolls
tl4
  // First word animation (25% of the scroll)
  .fromTo(
    "#dive",
    {
      y: 0,
      x: 0,
      scale: 1,
    },
    {
      y: -window.innerHeight,
      x: -window.innerWidth * 0.9,
      scale: 0.5,
      ease: "power2.inOut",
      transformPerspective: 1000,
    },
    0
  )
  // Second word animation (next 25% of the scroll)
  .fromTo(
    "#into",
    {
      y: 0,
      x: 0,
      scale: 1,
    },
    {
      y: -window.innerHeight,
      x: -window.innerWidth * 0.9,
      scale: 0.5,
      ease: "power2.inOut",
      transformPerspective: 1000,
    },
    0.25
  )
  // Third word animation (next 25% of the scroll)
  .fromTo(
    "#better",
    {
      y: 0,
      x: 0,
      scale: 1,
    },
    {
      y: -window.innerHeight,
      x: -window.innerWidth * 0.7,
      scale: 0.5,
      ease: "power2.inOut",
      transformPerspective: 1000,
    },
    0.5
  )
  // Fourth word animation (final 25% of the scroll)
  .fromTo(
    "#health",
    {
      y: 0,
      x: 0,
      scale: 1,
    },
    {
      y: -window.innerHeight,
      x: -window.innerWidth * 0.7,
      scale: 0.5,
      ease: "power2.inOut",
      transformPerspective: 1000,
    },
    0.75
  );

//creating third scene
const scene3 = new THREE.Scene();
const camera3 = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera3.position.z = 12;

const canvas3 = document.getElementById("scene3");
const renderer3 = new THREE.WebGLRenderer({
  canvas: canvas3,
  alpha: true,
  antialias: true,
});
renderer3.setSize(window.innerWidth, window.innerHeight);
renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer3.toneMapping = THREE.ACESFilmicToneMapping;
renderer3.toneMappingExposure = 1;

//load HDRI Environment Map
new RGBELoader().load("../public/assets/hdrs/field.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene3.environment = texture;
});

const differentCansTexture = [
  flavorTextures.blackCherry,
  flavorTextures.watermelon,
  flavorTextures.strawberryLemonade,
  flavorTextures.lemonLime,
  flavorTextures.grape,
];
// console.log(differentCansTexture);
let currentTextureIndex = 0;
// console.log(differentCansTexture[currentTextureIndex]);
let cansPrice;

function applyTexture() {
  if (!cansPrice) return;
  cansPrice.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "cylinder_1") {
        child.material = new THREE.MeshPhysicalMaterial({
          roughness: 0.1,
          metalness: 0.75,
          reflectivity: 1,
          map: differentCansTexture[currentTextureIndex],
        });
      } else {
        child.material = metalMaterial;
      }
    }
  });
}
function differentCans() {
  divingCanLoader.load("../public/assets/models/Soda-can.gltf", (gltf) => {
    cansPrice = gltf.scene;
    cansPrice.position.set(0, 0, 0);
    cansPrice.scale.set(4, 4, 4);
    cansPrice.rotation.y = Math.PI;

    //appling material to can
    applyTexture();
    scene3.add(cansPrice);

    const tl5 = gsap.timeline();
    tl5.to(cansPrice.rotation, {
      y: Math.PI / 2 + 2,
      x: 0.2,
      z: -0.2,
      duration: 5,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });
    tl5.to(cansPrice.rotation, {
      y: 2,
      z: 0.1,
      x: 0.2,
      duration: 5,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });
  });
}

differentCans();

const cansName = [
  "Black Cherry",
  "Watermelon Crush",
  "Strawberry Lemonade",
  "Lemon Lime",
  "Grape Goodness",
];
const rightBtn = document.querySelector(".rightButton");
const leftBtn = document.querySelector(".leftButton");
const getcanName = document.querySelector(".canName");
const outerCircle = document.querySelector(".outerCircle"); // Select the outer circle
const innerCircle = document.querySelector(".innerCircle"); // Select the inner circle
let outerFillColor = window.getComputedStyle(outerCircle).fill;
let innerFillColor = window.getComputedStyle(innerCircle).fill;

console.log(outerFillColor);
console.log(innerFillColor);

getcanName.textContent = cansName[currentTextureIndex];
console.log(getcanName.textContent);

rightBtn.onclick = function () {
  if (currentTextureIndex <= 3) {
    currentTextureIndex += 1;
    applyTexture();
    getcanName.textContent = cansName[currentTextureIndex];
    console.log(getcanName.textContent);
    outerFillColor = "rgb(120, 147, 65)";
    console.log(outerFillColor);
  } else {
    currentTextureIndex = 0;
    applyTexture();
    getcanName.textContent = cansName[currentTextureIndex];
  }
  console.log(currentTextureIndex);
};
leftBtn.onclick = function () {
  if (currentTextureIndex >= 1) {
    currentTextureIndex -= 1;
    applyTexture();
    getcanName.textContent = cansName[currentTextureIndex];
  } else {
    currentTextureIndex = 4;
    applyTexture();
    getcanName.textContent = cansName[currentTextureIndex];
  }
  console.log(currentTextureIndex);
};
window.addEventListener("resize", () => {
  camera3.aspect = window.innerWidth / window.innerHeight;
  camera3.updateProjectionMatrix();
  renderer3.setSize(window.innerWidth, window.innerHeight);
});

//animation loop
function animate3() {
  requestAnimationFrame(animate3);
  renderer3.render(scene3, camera3);
}
animate3();

gsap.to(".outerCircle", {
  rotation: -360,
  duration: 20,
  repeat: -1,
  ease: "none",
});

gsap.to(".innerCircle", {
  rotation: 360,
  duration: 20,
  repeat: -1,
  ease: "none",
});

gsap.to(".circle-text", {
  rotation: 360,
  duration: 10,
  repeat: -1,
  ease: "none",
});

// forth scene
const scene4 = new THREE.Scene();
const camera4 = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera4.position.z = 35;

const parent = document.querySelector(".parent");
console.log(parent);
const canvas4 = document.querySelector(".canvas4");
const renderer4 = new THREE.WebGLRenderer({
  canvas: canvas4,
  alpha: true,
  antialias: true,
});

if (parent) {
  renderer4.setSize(parent.clientWidth, parent.clientHeight);
  camera4.aspect = parent.clientWidth / parent.clientHeight;
  camera4.updateProjectionMatrix();
} else {
  renderer4.setSize(window.innerWidth, window.innerHeight);
}

renderer4.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer4.toneMapping = THREE.ACESFilmicToneMapping;
renderer4.toneMappingExposure = 1;

//load HDRI Environment Map
new RGBELoader().load("../public/assets/hdrs/field.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene4.environment = texture;
});

function resizeCanvasToDisplay() {
  if (!parent) return false;

  const width = parent.clientWidth;
  const height = parent.clientHeight;

  const needResize = canvas4.width !== width || canvas4.height !== height;

  if (needResize) {
    renderer4.setSize(width, height, false);

    canvas4.style.width = "100%";
    canvas4.style.height = "100%";

    camera4.aspect = width / height;
    camera4.updateProjectionMatrix();
  }

  return needResize;
}

window.addEventListener("resize", () => {
  resizeCanvasToDisplay();
});

divingCanLoader.load("../public/assets/models/Soda-can.gltf", (gltf) => {
  const aboutCan = gltf.scene;
  aboutCan.position.set(2.5, 5, 0);
  aboutCan.scale.set(4, 4, 4);
  aboutCan.rotation.y = Math.PI;

  //appling material to can
  aboutCan.traverse((child) => {
    if (child.isMesh) {
      if (child.name === "cylinder_1") {
        child.material = new THREE.MeshPhysicalMaterial({
          roughness: 0.1,
          metalness: 0.75,
          reflectivity: 1,
          map: flavorTextures.lemonLime,
        });
      } else {
        child.material = metalMaterial;
      }
    }
  });
  scene4.add(aboutCan);

  const tl6 = gsap.timeline();
  tl6.to(aboutCan.rotation, {
    y: Math.PI / 2 + 2,
    x: 0.2,
    z: -0.2,
    duration: 5,
    ease: "power2.inOut",
    repeat: -1,
    yoyo: true,
  });
  tl6.to(aboutCan.rotation, {
    y: 2,
    z: 0.1,
    x: 0.2,
    duration: 5,
    ease: "power2.inOut",
    repeat: -1,
    yoyo: true,
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".about2",
        start: "top 99%",
        end: "top 20%",
        scrub: 5,
        // markers: true,
      },
    })
    .to(".about", {
      backgroundColor: "#E9CFF6",
      duration: 3,
      ease: "none",
    })
    .to(
      aboutCan.position,
      {
        x: -3,
        y: -0.3,
        duration: 5,
        ease: "power2.inOut",
      },
      "<"
    );

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".about3",
        start: "top 99%",
        end: "top 20%",
        scrub: 5,
        markers: true,
      },
    })
    .to(".about2", {
      backgroundColor: "#CBEF9A",
      ease: "none",
      duration: 2,
    })
    .to(aboutCan.position, {
      x: 3,
      y: -5,
      duration: 5,
      ease: "power2.inOut",
    });
});

//animation loop
function animate4() {
  resizeCanvasToDisplay();
  requestAnimationFrame(animate4);
  renderer4.render(scene4, camera4);
}
animate4();
