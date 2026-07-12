(() => {
  const root = document.documentElement;
  let renderScheduled = false;

  const mermaidBlocks = () => [
    ...document.querySelectorAll(".post-content pre.mermaid")
  ];

  const hasUnprocessedMermaid = () =>
    document.querySelector(".post-content pre.mermaid:not([data-processed])");

  const resolvedTheme = () => {
    const theme = root.dataset.theme;
    if (theme === "dark" || theme === "light") return theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const renderMermaid = async () => {
    const blocks = mermaidBlocks();
    if (!blocks.length || !window.mermaid) return;

    blocks.forEach((block) => {
      if (!block.dataset.mermaidSource) {
        block.dataset.mermaidSource = block.textContent;
      }
      block.textContent = block.dataset.mermaidSource;
      block.removeAttribute("data-processed");
    });

    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: resolvedTheme() === "dark" ? "dark" : "default"
    });

    await window.mermaid.run({ nodes: blocks });
  };

  const scheduleRender = () => {
    if (renderScheduled) return;
    renderScheduled = true;

    window.requestAnimationFrame(async () => {
      renderScheduled = false;
      try {
        await renderMermaid();
      } catch (error) {
        console.error("Failed to render Mermaid diagram", error);
      }
    });
  };

  const themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-theme")) {
      scheduleRender();
    }
  });
  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  const contentObserver = new MutationObserver(() => {
    if (hasUnprocessedMermaid()) scheduleRender();
  });
  if (document.body) {
    contentObserver.observe(document.body, { childList: true, subtree: true });
  }

  // PaperMod sets the final data-theme later in the footer.
  scheduleRender();
})();
