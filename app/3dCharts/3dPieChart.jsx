"use client";

import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import makePieSlice from "./utils";

ThreePieChart.propTypes = {
  node: PropTypes.any.isRequired,
  onDrillDown: PropTypes.any.isRequired,
};

export default function ThreePieChart({ node, onDrillDown }) {
    console.log("Rendering ThreePieChart with node:", node);
  const mountRef = useRef(null);
  const labelRefs = useRef([]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const children = node?.children ?? [];
    if (!children.length) return;

    labelRefs.current.forEach((d) => d?.remove());
    labelRefs.current = [];
    while (el.firstChild) el.removeChild(el.firstChild);

    const w = el.clientWidth || 600;
    const h = el.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    el.style.position = "relative";

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(4, 8, 6);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.25);
    dl2.position.set(-4, -2, -4);
    scene.add(dl2);

    const total = children.reduce((s, c) => s + c.value, 0);
    const outerR = 2.2,
      innerR = 0.7,
      sliceH = 0.55,
      GAP = 0.018;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let rotY = 0.3,
      rotX = 0.55,
      zoom = 6.5;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragMoved = false;
    let hoveredSlice = null;
    let animFrame;

    // Tooltip
    const tooltip = document.createElement("div");
    tooltip.style.cssText =
      "position:absolute;pointer-events:none;background:rgba(10,10,20,0.92);color:#fff;" +
      "font-size:12px;padding:7px 11px;border-radius:7px;display:none;max-width:160px;" +
      "text-align:center;line-height:1.5;z-index:20;";
    el.appendChild(tooltip);

    // Build slices
    let cumAngle = -Math.PI / 2;
    const slices = children.map((child) => {
      const sliceAngle = (child.value / total) * Math.PI * 2;
      const startA = cumAngle + GAP;
      const endA = cumAngle + sliceAngle - GAP;
      const midA = cumAngle + sliceAngle / 2;
      cumAngle += sliceAngle;

      const geo = makePieSlice(startA, endA, outerR, innerR, sliceH, 52);
      const col = new THREE.Color(child.color);
      const mat = new THREE.MeshPhongMaterial({
        color: col,
        shininess: 55,
        specular: new THREE.Color(0x333333),
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0;

      // Top highlight
      const topGeo = makePieSlice(
        startA + GAP * 0.5,
        endA - GAP * 0.5,
        outerR - 0.02,
        innerR + 0.02,
        0.03,
        52,
      );
      const topCol = col.clone().lerp(new THREE.Color(0xffffff), 0.28);
      const topMat = new THREE.MeshPhongMaterial({
        color: topCol,
        shininess: 90,
        side: THREE.DoubleSide,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.rotation.x = -Math.PI / 2;
      topMesh.position.y = sliceH + 0.01;

      scene.add(mesh);
      scene.add(topMesh);

      // Floating label
      const labelR = (outerR + innerR) / 2 + 0.1;
      const lx = Math.cos(midA) * labelR;
      const lz = Math.sin(midA) * labelR;

      const labelDiv = document.createElement("div");
      labelDiv.style.cssText =
        "position:absolute;pointer-events:none;font-size:11px;font-weight:500;" +
        "color:#111;text-align:center;white-space:nowrap;background:rgba(255,255,255,0.93);" +
        "padding:2px 5px;border-radius:4px;border:0.5px solid rgba(0,0,0,0.12);" +
        "max-width:90px;overflow:hidden;text-overflow:ellipsis;";
      labelDiv.textContent = child.name;
      el.appendChild(labelDiv);
      labelRefs.current.push(labelDiv);

      return {
        mesh,
        topMesh,
        data: child,
        midA,
        labelR,
        lx,
        lz,
        hasChildren: !!child.children?.length,
      };
    });

    // Fly-in animation
    let flyInT = 0,
      flyIn = true;
    slices.forEach((s) => {
      s.mesh.scale.set(0.01, 0.01, 0.01);
      s.topMesh.scale.set(0.01, 0.01, 0.01);
    });

    const project = (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      const cw = renderer.domElement.clientWidth;
      const ch = renderer.domElement.clientHeight;
      return { x: (v.x * 0.5 + 0.5) * cw, y: (-v.y * 0.5 + 0.5) * ch };
    };

    let lastT = 0;
    const loop = (t = 0) => {
      animFrame = requestAnimationFrame(loop);
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      if (flyIn) {
        flyInT += dt * 1.8;
        if (flyInT >= 1) flyIn = false;
        slices.forEach((s, i) => {
          const delay = i * 0.06;
          const prog = Math.max(0, Math.min(1, (flyInT - delay) * 2.2));
          const ease = 1 - Math.pow(1 - prog, 3);
          s.mesh.scale.set(ease, ease, ease);
          s.topMesh.scale.set(ease, ease, ease);
        });
      }

      // Hover lift
      slices.forEach((s) => {
        const targetY = s === hoveredSlice ? 0.22 : 0;
        s.mesh.position.y += (targetY - s.mesh.position.y) * 0.12;
        s.topMesh.position.y = s.mesh.position.y + sliceH + 0.01;
      });

      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * zoom;
      camera.position.y = Math.sin(rotX) * zoom + 0.2;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * zoom;
      camera.lookAt(0, sliceH / 2, 0);

      // Update label positions
      slices.forEach((s, i) => {
        const sp = project(s.lx, s.mesh.position.y + sliceH + 0.42, s.lz);
        const ld = labelRefs.current[i];
        if (ld) {
          ld.style.left = sp.x - 45 + "px";
          ld.style.top = sp.y - 10 + "px";
        }
      });

      renderer.render(scene, camera);
    };
    animFrame = requestAnimationFrame(loop);

    const getSlice = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(
        slices.flatMap((s) => [s.mesh, s.topMesh]),
      );
      if (!hits.length) return null;
      const hit = hits[0].object;
      return slices.find((s) => s.mesh === hit || s.topMesh === hit) ?? null;
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const sl = getSlice();
      if (sl) {
        renderer.domElement.style.cursor = sl.hasChildren
          ? "pointer"
          : "default";
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX - rect.left + 14 + "px";
        tooltip.style.top = e.clientY - rect.top - 40 + "px";
        const pct = Math.round((sl.data.value / total) * 100);
        tooltip.innerHTML =
          `<b>${sl.data.name}</b><br>${sl.data.value} units (${pct}%)` +
          (sl.hasChildren
            ? '<br><span style="font-size:10px;opacity:0.75">Click to drill down</span>'
            : "");
        if (hoveredSlice !== sl) {
          if (hoveredSlice)
            hoveredSlice.mesh.material.emissive.setHex(0x000000);
          sl.mesh.material.emissive = new THREE.Color(0x1a1a1a);
          hoveredSlice = sl;
        }
      } else {
        renderer.domElement.style.cursor = isDragging ? "grabbing" : "grab";
        tooltip.style.display = "none";
        if (hoveredSlice) {
          hoveredSlice.mesh.material.emissive.setHex(0x000000);
          hoveredSlice = null;
        }
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      dragMoved = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        dragMoved = false;
      }, 50);
    };

    const onMouseDrag = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      rotY += dx * 0.007;
      rotX = Math.max(0.15, Math.min(1.2, rotX + dy * 0.007));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e) => {
      if (dragMoved) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const sl = getSlice();
      if (sl?.hasChildren) onDrillDown(sl.data);
    };

    const onWheel = (e) => {
      zoom = Math.max(3.5, Math.min(13, zoom + e.deltaY * 0.012));
    };

    const onResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseDrag);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseDrag);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      labelRefs.current.forEach((d) => d?.remove());
      labelRefs.current = [];
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [node, onDrillDown]);

  if (!(node?.children && node?.children.length)) {
    return (
      <div className="h-[460px] flex items-center justify-center text-sm text-gray-400">
        Deepest level — no further drill-down available.
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-[460px] rounded-xl overflow-hidden"
    />
  );
}
