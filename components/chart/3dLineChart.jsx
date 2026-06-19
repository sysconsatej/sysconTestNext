import React, { useEffect, useRef , useState } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";

ThreeLineChart.propTypes = {
  node: PropTypes.any,
  onDrillDown: PropTypes.func.isRequired,
};


export default   function ThreeLineChart({ node, onDrillDown }) {
  const mountRef = useRef(null);
  const labelRefs = useRef([]);
  const [hidden, setHidden] = useState(new Set());

//   const toggleSeries = useCallback((name) => {
//     setHidden((prev) => {
//       const n = new Set(prev);
//       n.has(name) ? n.delete(name) : n.add(name);
//       return n;
//     });
//   }, []);

  useEffect(() => {
    setHidden(new Set());
  }, [node]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const series = node?.series || [];
    if (!series.length) return;

    labelRefs.current.forEach((d) => d && d.remove());
    labelRefs.current = [];
    while (el.firstChild) el.removeChild(el.firstChild);

    const w = el.clientWidth || 620,
      h = el.clientHeight || 460;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    el.style.position = "relative";

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.7);
    dl.position.set(5, 10, 7);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dl2.position.set(-5, -3, -5);
    scene.add(dl2);

    const months = node.months;
    const nPts = months.length;
    const chartW = 8,
      chartH = 4;
    const allVals = series.flatMap((s) => s.values);
    const minV = Math.min(...allVals),
      maxV = Math.max(...allVals);
    const pad = (maxV - minV) * 0.12;

    const toX = (i) => -chartW / 2 + (i / (nPts - 1)) * chartW;
    const toY = (v) =>
      ((v - minV + pad) / (maxV - minV + 2 * pad)) * chartH - 0.3;

    // grid floor
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x888888,
      opacity: 0.18,
      transparent: true,
    });
    for (let i = 0; i < nPts; i++) {
      const x = toX(i);
      const pts = [
        new THREE.Vector3(x, -0.35, -0.5),
        new THREE.Vector3(x, -0.35, 0.5),
      ];
      scene.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
      );
    }
    for (let g = 0; g <= 5; g++) {
      const y = -0.35 + (g / 5) * (chartH + 0.1);
      const pts = [
        new THREE.Vector3(-chartW / 2, y, -0.5),
        new THREE.Vector3(chartW / 2, y, -0.5),
      ];
      scene.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
      );
    }

    // axis labels (x)
    months.forEach((m, i) => {
      const div = document.createElement("div");
      div.style.cssText =
        "position:absolute;pointer-events:none;font-size:10px;color:var(--color-text-tertiary);text-align:center;white-space:nowrap;";
      div.textContent = m;
      el.appendChild(div);
      labelRefs.current.push({
        div,
        type: "xaxis",
        x: toX(i),
        y: -0.72,
        z: 0.5,
      });
    });

    // y axis labels
    for (let g = 0; g <= 4; g++) {
      const v = minV + (g / 4) * (maxV - minV);
      const div = document.createElement("div");
      div.style.cssText =
        "position:absolute;pointer-events:none;font-size:10px;color:var(--color-text-tertiary);text-align:right;white-space:nowrap;";
      div.textContent = Math.round(v);
      el.appendChild(div);
      labelRefs.current.push({
        div,
        type: "yaxis",
        x: -chartW / 2 - 0.5,
        y: toY(v),
        z: -0.5,
      });
    }

    // lines + dots per series
    const lineObjs = series.map((s) => {
      const col = new THREE.Color(s.color);
      const points3d = s.values.map(
        (v, i) => new THREE.Vector3(toX(i), toY(v), 0),
      );

      // tube along the line
      const curve = new THREE.CatmullRomCurve3(points3d);
      const tubeGeo = new THREE.TubeGeometry(curve, nPts * 4, 0.055, 8, false);
      const tubeMat = new THREE.MeshPhongMaterial({
        color: col,
        shininess: 70,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      // dots at data points
      const dots = points3d.map((p) => {
        const geo = new THREE.SphereGeometry(0.1, 14, 14);
        const mat = new THREE.MeshPhongMaterial({ color: col, shininess: 90 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(p);
        scene.add(mesh);
        return mesh;
      });

      // shadow line on floor
      const floorPts = points3d.map((p) => new THREE.Vector3(p.x, -0.34, p.z));
      const floorLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(floorPts),
        new THREE.LineBasicMaterial({
          color: col,
          opacity: 0.2,
          transparent: true,
        }),
      );
      scene.add(floorLine);

      // series label at last point
      const labelDiv = document.createElement("div");
      labelDiv.style.cssText =
        "position:absolute;pointer-events:none;font-size:11px;font-weight:500;color:var(--color-text-primary);background:var(--color-background-primary);padding:2px 6px;border-radius:4px;border:0.5px solid var(--color-border-tertiary);opacity:0.92;white-space:nowrap;";
      labelDiv.textContent = s.name;
      el.appendChild(labelDiv);
      const lastPt = points3d[points3d.length - 1];
      labelRefs.current.push({
        div: labelDiv,
        type: "series",
        x: lastPt.x + 0.15,
        y: lastPt.y + 0.2,
        z: 0,
      });

      return { tube, dots, floorLine, labelDiv, data: s, points3d, col };
    });

    // tooltip + hover dot
    const tooltip = document.createElement("div");
    tooltip.style.cssText =
      "position:absolute;pointer-events:none;background:rgba(10,10,20,0.92);color:#fff;font-size:12px;padding:7px 11px;border-radius:7px;display:none;max-width:170px;text-align:center;line-height:1.5;z-index:20;";
    el.appendChild(tooltip);

    const hoverSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 120,
        emissive: new THREE.Color(0x444444),
      }),
    );
    hoverSphere.visible = false;
    scene.add(hoverSphere);

    let rotY = 0.4,
      rotX = 0.32,
      zoom = 7.2;
    let isDragging = false,
      prevMouse = { x: 0, y: 0 },
      dragMoved = false;
    let animFrame,
      lastT = 0;

    // fly-in: animate tubes drawing
    let flyT = 0,
      flyDone = false;

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.15 };
    const mouse = new THREE.Vector2();

    const project = (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      const cw = renderer.domElement.clientWidth,
        ch = renderer.domElement.clientHeight;
      return { x: (v.x * 0.5 + 0.5) * cw, y: (-v.y * 0.5 + 0.5) * ch };
    };

    const loop = (t = 0) => {
      animFrame = requestAnimationFrame(loop);
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      if (!flyDone) {
        flyT += dt * 1.5;
        if (flyT >= 1) {
          flyT = 1;
          flyDone = true;
        }
        // const ease = 1-Math.pow(1-flyT, 3);
        lineObjs.forEach((lo, si) => {
          const delay = si * 0.12;
          const prog = Math.max(0, Math.min(1, (flyT - delay) * 2));
          const e2 = 1 - Math.pow(1 - prog, 3);
          const nShow = Math.max(1, Math.floor(e2 * lo.points3d.length));
          lo.dots.forEach((d, i) => {
            d.visible = i < nShow;
          });
        });
      }

      // update hidden
      lineObjs.forEach((lo) => {
        const vis = !hidden.has(lo.data.name);
        lo.tube.visible = vis;
        lo.dots.forEach((d) => (d.visible = vis && flyDone));
        lo.floorLine.visible = vis;
      });

      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * zoom;
      camera.position.y = Math.sin(rotX) * zoom + 1;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * zoom;
      camera.lookAt(0, chartH / 2, 0);

      // project labels
      labelRefs.current.forEach((item) => {
        if (!item.div) return;
        const sp = project(item.x, item.y, item.z);
        item.div.style.left =
          sp.x -
          (item.type === "yaxis" ? 40 : item.type === "xaxis" ? 16 : 0) +
          "px";
        item.div.style.top =
          sp.y -
          (item.type === "yaxis" ? 7 : item.type === "xaxis" ? 4 : 10) +
          "px";
      });

      renderer.render(scene, camera);
    };
    animFrame = requestAnimationFrame(loop);

    // find closest point on any visible series
    const findClosest = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(mx, my);
      raycaster.setFromCamera(mouse, camera);
      let best = null,
        bestDist = Infinity;
      lineObjs.forEach((lo) => {
        if (hidden.has(lo.data.name)) return;
        lo.dots.forEach((dot, i) => {
          const d = raycaster.ray.distanceToPoint(dot.position);
          if (d < 0.25 && d < bestDist) {
            bestDist = d;
            best = { lo, i, dot };
          }
        });
      });
      return best;
    };

    const onMouseMove = (e) => {
      if (isDragging) return;
      const hit = findClosest(e);
      if (hit) {
        const rect = renderer.domElement.getBoundingClientRect();
        renderer.domElement.style.cursor = hit.lo.data.children
          ? "pointer"
          : "crosshair";
        hoverSphere.visible = true;
        hoverSphere.position.copy(hit.dot.position);
        hoverSphere.material.color = hit.lo.col;
        const v = hit.lo.data.values[hit.i];
        const m = months[hit.i];
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX - rect.left + 14 + "px";
        tooltip.style.top = e.clientY - rect.top - 40 + "px";
        tooltip.innerHTML = `<b>${hit.lo.data.name}</b><br>${m}: <b>${v}</b> units${hit.lo.data.children ? '<br><span style="font-size:10px;opacity:0.75">Click to drill down</span>' : ""}`;
      } else {
        renderer.domElement.style.cursor = "grab";
        hoverSphere.visible = false;
        tooltip.style.display = "none";
      }
    };

    const onClick = (e) => {
      if (dragMoved) return;
      const hit = findClosest(e);
      if (hit && hit.lo.data.children) onDrillDown(hit.lo.data.children);
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
    const onDrag = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x,
        dy = e.clientY - prevMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      rotY += dx * 0.007;
      rotX = Math.max(0.05, Math.min(1.1, rotX + dy * 0.007));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onWheel = (e) => {
      zoom = Math.max(4, Math.min(14, zoom + e.deltaY * 0.012));
    };
    const onResize = () => {
      const nw = el.clientWidth,
        nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      labelRefs.current.forEach((item) => item.div && item.div.remove());
      labelRefs.current = [];
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [node, hidden]);

  if (!(node?.series && node?.series.length)) {
    return (
      <div
        style={{
          height: 460,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        Deepest level reached.
      </div>
    );
  }

  return (
    <div>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: 460,
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
        }}
      />
     
    </div>
  );
}