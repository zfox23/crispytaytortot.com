const React = require("react");

function YouTubeIcon(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", Object.assign({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "-35.2 -41.333 192.44 165.33",
    fill: "currentColor",
    "aria-hidden": "true",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "m37.277 76.226v-69.784l61.334 34.893zm136.43-91.742c-2.699-10.162-10.651-18.165-20.747-20.881-18.3-4.936-91.683-4.936-91.683-4.936s-73.382 0-91.682 4.936c-10.096 2.716-18.048 10.719-20.747 20.881-4.904 18.419-4.904 56.85-4.904 56.85s0 38.429 4.904 56.849c2.699 10.163 10.65 18.165 20.747 20.883 18.3 4.934 91.682 4.934 91.682 4.934s73.383 0 91.683-4.934c10.096-2.718 18.048-10.72 20.747-20.883 4.904-18.42 4.904-56.85 4.904-56.85s0-38.43-4.904-56.849",
    clipRule: "evenodd"
  }));
}

const ForwardRef = React.forwardRef(YouTubeIcon);
module.exports = ForwardRef;