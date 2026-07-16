import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";

ThreeBarChart.propTypes = {
  node: PropTypes.any.isRequired,
  onDrillDown: PropTypes.func.isRequired,
};

export default function ThreeBarChart({ node, onDrillDown }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const tooltipRef = useRef(null);
  const labelRefs = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const children = node?.children || [];
    if (!children.length) return;

    // cleanup previous
    if (stateRef.current.renderer) {
      cancelAnimationFrame(stateRef.current.animFrame);
      stateRef.current.renderer.dispose();
      while (el.firstChild) el.removeChild(el.firstChild);
    }
    labelRefs.current.forEach((d) => d && d.remove());
    labelRefs.current = [];

    const w = el.clientWidth || 600,
      h = el.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(5, 10, 8);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dl2.position.set(-5, -2, -5);
    scene.add(dl2);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let rotY = -0.3,
      rotX = 0.25,
      zoom = 5.5;
    let isDragging = false,
      prevMouse = { x: 0, y: 0 },
      dragMoved = false;
    let hoveredBar = null;

    const tooltip = document.createElement("div");
    tooltip.style.cssText =
      "position:absolute;pointer-events:none;background:rgba(135, 14, 215, 0.9);color:white;font-size:12px;padding:7px 11px;border-radius:10px;display:none;max-width:150px;text-align:center;line-height:1.5;z-index:20;";
    el.style.position = "relative";
    el.appendChild(tooltip);
    tooltipRef.current = tooltip;

    const n = children.length;
    const maxVal = Math.max(...children.map((c) => c.value));

    // Convert fixed pixel sizes to Three.js scene units.
    // We use the renderer pixel width and the camera FOV to derive a consistent scale.
    // At zoom=5.5 and lookAt(0,1,0), the visible scene width at y=0 plane ≈ 12 units for a 600px canvas.
    const SCENE_UNITS_PER_PX = 12 / w;
    const barW = 45 * SCENE_UNITS_PER_PX; // 50px wide
    const maxBarH = 175 * SCENE_UNITS_PER_PX; // 200px max height
    const gap = 20 * SCENE_UNITS_PER_PX; // 20px gap between bars

    const totalW = n * (barW + gap) - gap;
    const startX = -totalW / 2.76 + barW / 2;

    const bars = children.map((child, i) => {
      // normH scaled to maxBarH instead of hardcoded 1.5
      const normH = (child.value / maxVal) * maxBarH + 10 * SCENE_UNITS_PER_PX;
      const x = startX + i * (barW + gap);
      const palette = [
        "#4F46E5", // indigo
        "#06B6D4", // cyan
        "#10B981", // green
        "#F59E0B", // amber
        "#EF4444", // red
        "#8B5CF6", // violet
        "#EC4899", // pink
        "#14B8A6", // teal
      ];

      const hashStr = (str) =>
        String(str)
          .split("")
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const col = new THREE.Color(
        palette[hashStr(child.name) % palette.length],
      );

      const geo = new THREE.BoxGeometry(barW, normH, barW);
      const mat = new THREE.MeshPhongMaterial({
        color: col,
        shininess: 60,
        specular: new THREE.Color(0x444444),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, normH / 1.4, 0);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edge = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          opacity: 1,
          transparent: true,
        }),
      );
      edge.position.copy(mesh.position);

      const topGeo = new THREE.BoxGeometry(barW, 0.02, barW);
      const topCol = col.clone().lerp(new THREE.Color(0xffffff), 1);
      const top = new THREE.Mesh(
        topGeo,
        new THREE.MeshPhongMaterial({ color: topCol, shininess: 10 }),
      );
      top.position.set(x, normH + 0.02, 0);

      scene.add(mesh);
      scene.add(edge);
      scene.add(top);

      // Label div — rendered below the bar base (y = 0 in scene)
      const labelDiv = document.createElement("div");
      labelDiv.style.cssText =
        "position:absolute;top:10px left: 20px;pointer-events:none;font-size:11px;font-weight:500;color:var(--color-text-primary, #333);text-align:center;white-space:nowrap;background:var(--color-background-primary);padding:2px 5px;border-radius:4px;border:0.5px solid var(--color-border-tertiary);opacity:0.92;width:52px;overflow:hidden;text-overflow:ellipsis;";
      // Truncate to 7 chars + ellipsis if longer
      labelDiv.textContent =
        child?.name?.length > 7 ? child.name?.slice(0, 7) + "…" : child?.name;
      labelDiv.title = child?.name; // full name on native tooltip
      el.appendChild(labelDiv);
      labelRefs.current[i] = labelDiv;

      return {
        mesh,
        top,
        edge,
        data: child,
        normH,
        x,
        baseY: normH / 2,
        hasChildren: !!(child?.children && child?.children?.length),
      };
    });

    // fly-in state
    let flyInT = 0,
      flyIn = true;
    const STAGGER = 0.08;
    const flyInDuration = 1 + (n - 1) * STAGGER;
    bars.forEach((b) => {
      b.mesh.position.y = 0;
      b.mesh.scale.y = 0.01;
      b.top.position.y = 0;
      b.edge.position.y = 0;
      b.edge.scale.y = 0.01;
    });

    // Project a 3-D point to canvas pixel coords
    const project = (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      const cw = renderer.domElement.clientWidth,
        ch = renderer.domElement.clientHeight;
      return { x: (v.x * 0.5 + 0.5) * cw, y: (-v.y * 0.5 + 0.5) * ch };
    };

    let lastT = 0;
    const loop = (t = 0) => {
      stateRef.current.animFrame = requestAnimationFrame(loop);
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      if (flyIn) {
        flyInT += dt * 2.5;
        if (flyInT >= flyInDuration) flyIn = false;
        bars.forEach((b, i) => {
          const delay = i * STAGGER;
          const prog = Math.max(0, Math.min(1, (flyInT - delay) * 2.5));
          const ease = 1 - Math.pow(1 - prog, 3);
          b.mesh.position.y = b.baseY * ease;
          b.mesh.scale.y = ease;
          b.top.position.y = (b.normH + 0.02) * ease;
          b.edge.position.y = b.baseY * ease;
          b.edge.scale.y = ease;
        });
      }

      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * zoom;
      camera.position.y = Math.sin(rotX) * zoom + 0.5;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * zoom;
      camera.lookAt(0, 1, 0);

      // Position each label just BELOW the bar base (y = -0.05 in scene)
      bars.forEach((b, i) => {
        const sp = project(b.x, 0.05, 0);
        const ld = labelRefs.current[i];
        if (ld) {
          // Centre the 52px label horizontally on the projected bar x
          ld.style.left = sp.x + "px";
          // Place it a few pixels below the base projected point
          ld.style.top = sp.y + 40 + "px";
        }
      });

      renderer.render(scene, camera);
    };
    stateRef.current.animFrame = requestAnimationFrame(loop);
    stateRef.current.renderer = renderer;

    const getBar = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(bars.map((b) => b.mesh));
      return hits.length ? bars.find((b) => b.mesh === hits[0].object) : null;
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const bar = getBar();
      if (bar) {
        renderer.domElement.style.cursor = bar.hasChildren
          ? "pointer"
          : "default";
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX - rect.left + 14 + "px";
        tooltip.style.top = e.clientY - rect.top - 36 + "px";
        tooltip.innerHTML = `<b>${bar.data.name}</b><br>${bar.data.value} units${bar.hasChildren ? '<br><span style="font-size:10px;opacity:0.75">Click to drill down</span>' : ""}`;
        if (hoveredBar !== bar) {
          if (hoveredBar) hoveredBar.mesh.material.emissive.setHex(0x000000);
          bar.mesh.material.emissive = new THREE.Color(0x222222);
          hoveredBar = bar;
        }
      } else {
        renderer.domElement.style.cursor = isDragging ? "grabbing" : "grab";
        tooltip.style.display = "none";
        if (hoveredBar) {
          hoveredBar.mesh.material.emissive.setHex(0x000000);
          hoveredBar = null;
        }
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      dragMoved = false;
      prevMouse = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      setTimeout(() => {
        dragMoved = false;
      }, 50);
    };
    const onMouseDrag = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x,
        dy = e.clientY - prevMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      rotY += dx * 0.007;
      rotX = Math.max(-0.6, Math.min(1.1, rotX + dy * 0.007));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onClick = (e) => {
      if (dragMoved) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const bar = getBar();
      if (bar && bar.hasChildren) onDrillDown(bar.data);
    };
    const onWheel = (e) => {
      zoom = Math.max(3, Math.min(12, zoom + e.deltaY * 0.01));
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseDrag);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    const onResize = () => {
      const nw = el.clientWidth,
        nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(stateRef.current.animFrame);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseDrag);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      labelRefs.current.forEach((d) => d && d.remove());
      labelRefs.current = [];
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [node]);

  const children = node?.children || [];
  if (!children.length) {
    return (
      <div
        style={{
          height: 440,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        No deeper level — this is the deepest data.
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: 440,
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        padding: 20,
      }}
    />
  );
}
