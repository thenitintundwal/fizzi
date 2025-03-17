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
  // antialias: true,
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

// Load the diving can model
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

divingCanLoader.load("../public/assets/models/Soda-can.gltf", (gltf) => {
  const divingCan = gltf.scene;
  divingCan.position.set(0, 0, 1);
  divingCan.scale.set(4, 4, 4);
  divingCan.rotation.y = Math.PI;
  divingCan.rotation.z = -0.5; // Removed z-axis rotation

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

  // Small floating animation that keeps the can within the div
  // gsap.to(divingCan.position, {
  //   y: 0.3,
  //   yoyo: true,
  //   repeat: -1,
  //   duration: 1,
  //   ease: "none",
  // });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".divingCan",
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      markers: true,
    },
  });

  tl.from(divingCan.position, {
    y: 2,
    x: -3,
    opacity: 0,
    duration: 3,
    ease: "power2.inOut",
  });

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
