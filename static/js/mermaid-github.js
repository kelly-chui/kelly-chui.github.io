(() => {
  const root = document.documentElement;
  let id = 0;
  let queue = Promise.resolve();

  const theme = () => root.dataset.theme === "dark" ||
    (root.dataset.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark" : "default";

  const render = () => {
    queue = queue.then(async () => {
      const selectedTheme = theme();
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: selectedTheme });
      for (const block of document.querySelectorAll(".post-content pre.mermaid")) {
        if (block.dataset.theme === selectedTheme) continue;
        const source = decodeURIComponent(block.dataset.mermaidSource).replace(/\+/g, " ");
        try {
          const result = await mermaid.render(`mermaid-${id++}`, source);
          block.innerHTML = result.svg;
          block.dataset.theme = selectedTheme;
          result.bindFunctions?.(block);
        } catch (error) {
          console.error("Failed to render Mermaid diagram", error);
        }
      }
    });
    return queue;
  };

  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  addEventListener("load", render, { once: true });
})();
