(function () {
  var root = document.documentElement;
  function sync() {
    root.classList.toggle("tab-hidden", document.hidden);
  }
  document.addEventListener("visibilitychange", sync);
  sync();
})();
