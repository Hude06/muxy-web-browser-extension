"use strict";

(() => {
  const frame = document.getElementById("browser-frame");
  const urlForm = document.getElementById("url-form");
  const urlInput = document.getElementById("url-input");
  const backBtn = document.getElementById("back-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const reloadBtn = document.getElementById("reload-btn");

  const historyStack = [];
  let historyIndex = -1;

  urlForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const candidate = normalizeURL(urlInput.value);
    if (!candidate) return;
    navigate(candidate, true);
  });

  backBtn.addEventListener("click", () => {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    navigate(historyStack[historyIndex], false);
  });

  forwardBtn.addEventListener("click", () => {
    if (historyIndex >= historyStack.length - 1) return;
    historyIndex += 1;
    navigate(historyStack[historyIndex], false);
  });

  reloadBtn.addEventListener("click", () => {
    if (historyIndex < 0) return;
    navigate(historyStack[historyIndex], false);
  });

  frame.addEventListener("load", () => {
    frame.classList.add("is-visible");
  });

  frame.addEventListener("error", () => {
    frame.classList.remove("is-visible");
  });

  renderNavState();
  urlInput.focus();

  function navigate(url, pushToHistory) {
    if (pushToHistory) {
      const nextIndex = historyIndex + 1;
      historyStack.splice(nextIndex);
      historyStack.push(url);
      historyIndex = historyStack.length - 1;
    }

    urlInput.value = url;
    frame.classList.add("is-visible");
    frame.src = url;
    renderNavState();
  }

  function renderNavState() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= historyStack.length - 1;
    reloadBtn.disabled = historyIndex < 0;
  }

  function normalizeURL(rawInput) {
    const raw = String(rawInput || "").trim();
    if (!raw) return null;

    if (raw === "about:blank") return raw;

    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw)) {
      try {
        return new URL(raw).toString();
      } catch (_error) {
        return null;
      }
    }

    if (looksLikeHost(raw)) {
      try {
        return new URL(`https://${raw}`).toString();
      } catch (_error) {
        return null;
      }
    }

    return `https://duckduckgo.com/?q=${encodeURIComponent(raw)}`;
  }

  function looksLikeHost(value) {
    return value.includes(".") || value.startsWith("localhost") || /^[\d.:]+$/.test(value);
  }
})();
