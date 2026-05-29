import React from "react";
import PropTypes from "prop-types";

Legend.propTypes = {
  children: PropTypes.any.isRequired ,
  total: PropTypes.number.isRequired,
};

export default function Legend({ children, total }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3 px-3 py-2 bg-gray-400 rounded-md">
      {children.map((c, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 text-xs"
          style={{ color  : "#07666D"  }}
        >
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor:  "rebeccapurple"  }}
          />
          {c.name}: {c.value} ({Math.round((c.value / total) * 100)}%)
        </span>
      ))}
    </div>
  );
}
