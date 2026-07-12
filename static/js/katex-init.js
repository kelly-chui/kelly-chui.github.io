(() => {
  let renderScheduled = false;
  let renderInProgress = false;
  let renderPending = false;

  const getPostContent = () => document.querySelector(".post-content");

  const renderKatex = () => {
    if (renderInProgress) return;

    const content = getPostContent();
    if (!content || !window.renderMathInElement) return;

    renderInProgress = true;
    contentObserver.disconnect();
    try {
      window.renderMathInElement(content, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        ignoredTags: [
          "script",
          "noscript",
          "style",
          "textarea",
          "pre",
          "code",
          "option"
        ],
        throwOnError: false
      });
      content.dataset.katexRendered = "true";
    } finally {
      renderInProgress = false;
      contentObserver.observe(document, {
        childList: true,
        subtree: true
      });
      if (renderPending) {
        renderPending = false;
        scheduleRender();
      }
    }
  };

  const scheduleRender = () => {
    if (renderInProgress) {
      renderPending = true;
      return;
    }
    if (renderScheduled) return;
    renderScheduled = true;

    window.requestAnimationFrame(() => {
      renderScheduled = false;
      renderKatex();
    });
  };

  const contentObserver = new MutationObserver((mutations) => {
    if (renderInProgress) return;
    const content = getPostContent();
    if (!content) return;

    const contentWasReplaced = content.dataset.katexRendered !== "true";
    const contentWasChanged = mutations.some((mutation) => {
      if (mutation.target === content || content.contains(mutation.target)) {
        return true;
      }
      return [...mutation.addedNodes].some(
        (node) => node.nodeType === Node.ELEMENT_NODE && content.contains(node)
      );
    });

    if (contentWasReplaced || contentWasChanged) scheduleRender();
  });

  contentObserver.observe(document, { childList: true, subtree: true });

  // PaperMod has already rendered the post body when this script runs.
  scheduleRender();
})();
