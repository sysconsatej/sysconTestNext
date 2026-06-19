'use client';
import React, { lazy, Suspense, useCallback, useState } from "react";
import PropTypes from "prop-types";
import ChartsBreadCrumbs from "./ChartsBreadCrumbs";
import Legend from "./Legends";

const renderCharts = {
  pie: lazy(() => import("./3dPieChart")),
  bar: lazy(() => import("./3dBarChart")),
  line: lazy(() => import("./3dLineChart")),
};

LogisticsThreeDCharts.propTypes = {
  chartData: PropTypes.array.isRequired,
  type: PropTypes.oneOf(["pie", "bar", "line"]).isRequired,
};

export default function LogisticsThreeDCharts({ chartData, type }) {
  const [stack, setStack] = useState([]);
  const currentNode = stack.length === 0 ? chartData : stack[stack.length - 1];
  const children = Array.isArray(currentNode) ? currentNode[0].children : currentNode.children || [];
  const total = children.reduce((s, c) => s + c.value, 0);

  const handleDrillDown = useCallback((child) => {
    setStack((prev) => [...prev, child]);
  }, []);

  const handleNavigate = useCallback((idx) => {
    if (idx === 0) setStack([]);
    else setStack((prev) => prev.slice(0, idx));
  }, []);

  const ChartComponent = renderCharts[type];

  if (!ChartComponent) return <div>Invalid Chart type</div>;


  return (
    <div className="p-4 font-sans">
      <ChartsBreadCrumbs stack={stack} onNavigate={handleNavigate} />

      <div className="text-sm text-gray-500 mb-4">
        {children.length} segments · Total: {total.toLocaleString()} units
        {children[0]?.children
          ? "  ·  Click a slice to drill down"
          : "  ·  Deepest level"}
      </div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <ChartComponent
          node={Array.isArray(currentNode) ? currentNode[0] : currentNode || {}}
          onDrillDown={handleDrillDown}
        />
      </Suspense>
      {children.length > 0 ? <Legend total={total}>{children}</Legend> : <></>}

      <p className="text-xs text-gray-400 mt-2.5 text-center">
        Click a slice to drill down · Scroll to zoom · Drag to rotate
      </p>
    </div>
  );
}
