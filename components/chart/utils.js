import * as THREE from "three";

export default function makePieSlice(
    startAngle,
    endAngle,
    outerR,
    innerR,
    height,
    segments = 48,
) {
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(startAngle) * innerR, Math.sin(startAngle) * innerR);
    shape.lineTo(Math.cos(startAngle) * outerR, Math.sin(startAngle) * outerR);
    for (let i = 0; i <= segments; i++) {
        const a = startAngle + (endAngle - startAngle) * (i / segments);
        shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
    }
    for (let i = segments; i >= 0; i--) {
        const a = startAngle + (endAngle - startAngle) * (i / segments);
        shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
    });
}