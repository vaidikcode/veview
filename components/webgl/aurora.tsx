"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = uv;
    p.x *= aspect;

    float t = uTime * 0.06;

    // domain warp
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - 0.12 * t)
    );
    float f = fbm(p + 2.4 * r);

    // mouse warmth
    vec2 m = uMouse;
    m.x *= aspect;
    float d = distance(p, m);
    float glow = smoothstep(0.75, 0.0, d);

    vec3 base = vec3(0.027, 0.027, 0.039);
    vec3 orange = vec3(1.0, 0.42, 0.17);
    vec3 violet = vec3(0.48, 0.42, 1.0);
    vec3 teal = vec3(0.08, 0.82, 0.64);

    vec3 col = base;
    col = mix(col, violet, smoothstep(0.05, 0.75, f) * 0.55);
    col = mix(col, orange, smoothstep(0.35, 0.95, length(r)) * 0.6);
    col = mix(col, teal, smoothstep(0.55, 1.0, f + q.x) * 0.25);
    col += orange * glow * 0.35;

    // filmic falloff + vignette
    float vig = smoothstep(1.25, 0.15, length(uv - 0.5));
    col *= 0.35 + 0.65 * vig;
    col = pow(col, vec3(1.05));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    const { uTime, uRes, uMouse } = mat.uniforms;
    if (uTime) uTime.value = state.clock.elapsedTime;
    if (uRes) uRes.value.set(size.width, size.height);
    if (uMouse) uMouse.value.lerp(mouse.current, 0.045);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Aurora() {
  return (
    <Canvas
      className="!absolute inset-0"
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      style={{ position: "absolute", inset: 0 }}
    >
      <Plane />
    </Canvas>
  );
}
