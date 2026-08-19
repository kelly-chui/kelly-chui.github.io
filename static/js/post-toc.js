document.addEventListener("DOMContentLoaded", () => {
  const toc = document.querySelector(".post-toc");
  const toggle = toc?.querySelector(".post-toc-toggle");
  const links = [...document.querySelectorAll(".post-toc-nav a")];
  if (!toc || !links.length) { toc?.remove(); return; }
  const items = links
    .map((link) => ({
      link,
      heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter((item) => item.heading);
  const headings = items.map((item) => item.heading);
  toggle?.addEventListener("click", () => {
    const isOpen = toc.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  const activate = (heading) => {
    items.forEach((item) => item.link.classList.toggle("is-active", item.heading === heading));

    if (window.matchMedia("(min-width: 1080px)").matches) {
      const activeLink = items.find((item) => item.heading === heading)?.link;
      const nav = document.querySelector(".post-toc-nav");
      if (!activeLink || !nav) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      if (linkRect.top < navRect.top) nav.scrollTop -= navRect.top - linkRect.top;
      if (linkRect.bottom > navRect.bottom) nav.scrollTop += linkRect.bottom - navRect.bottom;
    }
  };
  const updateActiveHeading = () => {
    const documentBottom = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= documentBottom - 2) {
      activate(headings[headings.length - 1]);
      return;
    }

    const activationLine = window.innerHeight * 0.24;
    let activeHeading = headings[0];

    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top <= activationLine) activeHeading = heading;
    });

    activate(activeHeading);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveHeading();
      ticking = false;
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateActiveHeading();
});
