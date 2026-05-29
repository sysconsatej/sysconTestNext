import React from "react";
import PropTypes from "prop-types";

ChartsBreadCrumbs.propTypes = {
  stack: PropTypes.array.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default function ChartsBreadCrumbs({ stack, onNavigate }) {
  const crumbs = [
    { name: "Logistics Overview" },
    ...stack.map((n) => ({ name: n.name })),
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 mb-2">
      {crumbs.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-40">›</span>}
          <span
            onClick={() => i < crumbs.length - 1 && onNavigate(i)}
            className={
              i === crumbs.length - 1
                ? "font-medium text-gray-900 cursor-default"
                : "text-gray-500 cursor-pointer underline decoration-dotted hover:text-gray-700"
            }
          >
            {item.name}
          </span>
        </span>
      ))}
    </div>
  );
}
