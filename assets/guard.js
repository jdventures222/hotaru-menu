/* Run before styles and page scripts. Without JavaScript (or if this file fails),
   the English fallback is visible immediately. Slow successful loads stay hidden. */
(() => {
  const root = document.documentElement;
  const done = () => {
    clearTimeout(timer);
    root.classList.remove("hotaru-loading");
    window.removeEventListener("error", failed, true);
    window.removeEventListener("unhandledrejection", done);
  };
  const failed = event => {
    // Capture resource failures, but ignore missing images, fonts and stylesheets.
    // An uncaught script exception targets window instead of its script element.
    if (event.target === window || event.target?.tagName === "SCRIPT") done();
  };
  window.HotaruGuard = { done };
  window.addEventListener("error", failed, true);
  window.addEventListener("unhandledrejection", done);
  const timer = setTimeout(done, 8000);
  root.classList.add("hotaru-loading");
})();
