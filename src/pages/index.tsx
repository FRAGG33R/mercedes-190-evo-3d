import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import "../app/globals.css";
import { useRef } from "react";
import {
  BoxGeometry,
  LinearEncoding,
  MeshBasicMaterial,
  RepeatWrapping,
  SphereGeometry,
} from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "three";
const Box = () => {
  const ref = useRef<any>();
  const texture = useLoader(TextureLoader, "/texture.jpeg");
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={ref}>
      {/* <boxGeometry args={[2,2,2]} /> */}
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="purple" map={texture} />
    </mesh>
  );
};

const Ground = () => {
  const normal = useLoader(TextureLoader, "terrain-roughness.jpeg");
  useEffect(() => {
    normal.wrapS = RepeatWrapping;
    normal.wrapT = RepeatWrapping;
    normal.repeat.set(5, 5);
    normal.encoding = LinearEncoding;
  }, [normal]);

  useFrame((state, delta) => {
    let t = -state.clock.getElapsedTime() * 0.128;
    normal.offset.set(0, t);
    console.log(t);
  });

  return (
    <mesh rotation-x={-Math.PI * 0.5} castShadow receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        envMapIntensity={0}
        normalMap={normal}
        roughnessMap={normal}
        dithering={true}
        color={[0.015, 0.015, 0.015]}
        roughness={0.7}
        blur={[1000, 400]}
        mixBlur={30}
        mixStrength={80}
        mixContrast={1}
        resolution={1024}
        mirror={0}
        depthScale={0.01}
        minDepthThreshold={0.9}
        maxDepthThreshold={1}
        depthToBlurRatioBias={0.25}
        reflectorOffset={0.2}
      />
    </mesh>
  );
};

const Car = () => {
  const gltf = useLoader(GLTFLoader, "Models/mercedes_190e_evo/scene.gltf");
  useEffect(() => {
    gltf.scene.scale.set(1, 1, 1);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.traverse((child) => {
      console.log(child.name.includes("Wheel") && child.name);
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const childMaterial = child.material as THREE.MeshStandardMaterial;
        if (childMaterial.envMapIntensity !== undefined) {
          childMaterial.envMapIntensity = 20;
        }
      }
    });
  }, [gltf]);
  useFrame((state, delta) => {
    let t = state.clock.getElapsedTime();
    gltf.scene.traverse((child) => {
      if (child.name.includes("Name-Wheel")) {
        if (
          !child.name.includes("Name-WheelBrakeFt") &&
          !child.name.includes("DEF-WheelFtR")
        )
          child.rotation.x = t * 2;
      }
    });
  });
  return <primitive object={gltf.scene} />;
};

export default function Home() {
  return (
    <Suspense fallback={null}>
      <main className="flex h-screen w-screen flex-col items-center justify-between">
        <Canvas className=" w-full h-full" shadows>
          <PerspectiveCamera makeDefault position={[2, 2.3, 8]} fov={50} />
          <color attach="background" args={["black"]} />
          <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
          <Car />
          <spotLight
            color={[1, 0.25, 0.7]}
            position={[10, 7, 5]}
            angle={0.6}
            penumbra={0.5}
            shadow-bias={-0.0001}
            intensity={3}
            castShadow
          />
          <spotLight
            color={[0.14, 0.5, 1]}
            position={[-6, 12, -2]}
            angle={0.4}
            penumbra={0.5}
            shadow-bias={-0.0001}
            intensity={5}
            castShadow
          />
          <Ground />
        </Canvas>
      </main>
    </Suspense>
  );
}
