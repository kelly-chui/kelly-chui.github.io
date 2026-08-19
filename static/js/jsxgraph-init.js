(function () {
  "use strict";

  function parseBoundingBox(value) {
    var parts = value.split(",").map(Number);
    return parts.length === 4 && parts.every(Number.isFinite)
      ? parts
      : [-5, 5, 5, -5];
  }

  function toFunction(expression) {
    var javascriptExpression = expression
      .replace(/\^/g, "**")
      .replace(/\bln\b/g, "Math.log")
      .replace(/\blog\b/g, "Math.log10")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan");

    return new Function("x", "return " + javascriptExpression + ";");
  }

  function themeColors() {
    var styles = getComputedStyle(document.documentElement);
    return {
      curve: styles.getPropertyValue("--primary").trim() || "#3b82f6"
    };
  }

  function graphExpressions(element) {
    var expressions = element.dataset.jsxgraphFunctions;
    if (expressions) return expressions.split("|").map(function (value) { return value.trim(); }).filter(Boolean);
    return element.dataset.jsxgraphFunction ? [element.dataset.jsxgraphFunction] : [];
  }

  function renderGraphs() {
    document.querySelectorAll("[data-jsxgraph-function]").forEach(function (element) {
      if (element.dataset.jsxgraphRendered === "true") return;

      var colors = themeColors();
      var board = JXG.JSXGraph.initBoard(element.id, {
        boundingbox: parseBoundingBox(element.dataset.jsxgraphBoundingbox),
        axis: element.dataset.jsxgraphAxis !== "false",
        showCopyright: false,
        showNavigation: false,
        pan: { enabled: true, needTwoFingers: true },
        zoom: { enabled: true, needTwoFingers: true }
      });
      var palette = [colors.curve, "#e76f51", "#2a9d8f", "#e9c46a"];
      graphExpressions(element).forEach(function (expression, index) {
        var color = palette[index % palette.length];
        board.create("functiongraph", [toFunction(expression)], {
          strokeColor: color,
          highlightStrokeColor: color,
          strokeWidth: 2
        });
      });
      element.dataset.jsxgraphRendered = "true";
    });
  }

  if (window.JXG) renderGraphs();
})();
