/**
 * Discrete "Talk to Zanwik" control for the static mirror.
 * Opens a small composer overlay (iframe → /talk?embed=1).
 * Does not use a microphone icon (reserved for dictation).
 */
(function () {
  "use strict";
  if (window.__zanwikVoiceFab) return;
  window.__zanwikVoiceFab = true;

  var STYLE_ID = "zanwik-voice-fab-style";
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#zanwik-voice-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;",
      "display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;",
      "border:1px solid #cbd5e1;background:#0f172a;color:#f8fafc;font:600 13px/1.2 ui-sans-serif,system-ui,sans-serif;",
      "cursor:pointer;box-shadow:0 8px 24px rgba(15,23,42,.18)}",
      "#zanwik-voice-fab:hover{background:#1e293b}",
      "#zanwik-voice-fab svg{flex:none}",
      "#zanwik-voice-dialog{border:none;padding:0;border-radius:16px;width:min(440px,calc(100vw - 24px));",
      "height:min(520px,calc(100vh - 24px));max-width:100%;box-shadow:0 24px 64px rgba(15,23,42,.28);",
      "background:#fff}",
      "#zanwik-voice-dialog::backdrop{background:rgba(15,23,42,.45)}",
      "#zanwik-voice-dialog-frame{border:0;width:100%;height:100%;border-radius:16px;display:block}",
      "#zanwik-voice-dialog-close{position:absolute;top:10px;right:12px;z-index:2;border:0;background:transparent;",
      "color:#64748b;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;padding:6px}",
      "@media (prefers-reduced-motion:reduce){#zanwik-voice-fab,#zanwik-voice-dialog{transition:none}}",
    ].join("");
    document.head.appendChild(style);
  }

  var btn = document.createElement("button");
  btn.id = "zanwik-voice-fab";
  btn.type = "button";
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-controls", "zanwik-voice-dialog");
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 256 256" aria-hidden="true">' +
    '<path d="M48 96v64M80 64v128M112 32v192M144 64v128M176 96v64M208 80v96" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg><span>Talk to Zanwik</span>";

  var dialog = document.createElement("dialog");
  dialog.id = "zanwik-voice-dialog";
  dialog.setAttribute("aria-label", "Talk to Zanwik");
  dialog.innerHTML =
    '<button type="button" id="zanwik-voice-dialog-close" aria-label="Close talk panel">Close</button>' +
    '<iframe id="zanwik-voice-dialog-frame" title="Talk to Zanwik" src="about:blank" allow="microphone"></iframe>';

  function open() {
    var frame = dialog.querySelector("#zanwik-voice-dialog-frame");
    if (frame && frame.getAttribute("src") === "about:blank") {
      frame.setAttribute("src", "/talk?embed=1");
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    open();
  });
  dialog
    .querySelector("#zanwik-voice-dialog-close")
    .addEventListener("click", function (e) {
      e.preventDefault();
      close();
    });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  document.body.appendChild(btn);
  document.body.appendChild(dialog);
})();
