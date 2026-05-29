"use strict";

(() => {
  const STATE_STORAGE_KEY = "muxy.web-browser.state.v1";
  const frame = document.getElementById("browser-frame");
  const urlForm = document.getElementById("url-form");
  const urlInput = document.getElementById("url-input");
  const backBtn = document.getElementById("back-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const reloadBtn = document.getElementById("reload-btn");
  const tabKey = getTabKey();

  const historyStack = [];
  let historyIndex = -1;

  restoreState();
  renderNavState();

  window.addEventListener("beforeunload", persistState);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistState();
  });

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
    persistState();
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

  function getTabKey() {
    if (window.muxy && typeof muxy.tabInstanceID === "string" && muxy.tabInstanceID.trim()) {
      return muxy.tabInstanceID;
    }
    return "default";
  }

  function restoreState() {
    const container = readStateContainer();
    const restored =
      normalizeState(container.tabs && container.tabs[tabKey]) ||
      normalizeState(container.last);

    if (!restored) return;

    historyStack.splice(0, historyStack.length, ...restored.historyStack);
    historyIndex = restored.historyIndex;

    const currentURL = historyStack[historyIndex];
    if (!currentURL) return;

    urlInput.value = currentURL;
    frame.classList.add("is-visible");
    frame.src = currentURL;
  }

  function persistState() {
    const container = readStateContainer();
    const snapshot = {
      historyStack: historyStack.slice(0, 100),
      historyIndex,
      updatedAt: Date.now(),
    };

    if (!container.tabs || typeof container.tabs !== "object" || Array.isArray(container.tabs)) {
      container.tabs = {};
    }
    container.tabs[tabKey] = snapshot;
    container.last = snapshot;
    container.version = 1;
    writeStateContainer(container);
  }

  function readStateContainer() {
    try {
      const raw = localStorage.getItem(STATE_STORAGE_KEY);
      if (!raw) return { version: 1, tabs: {}, last: null };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_error) {}
    return { version: 1, tabs: {}, last: null };
  }

  function writeStateContainer(container) {
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(container));
    } catch (_error) {}
  }

  function normalizeState(rawState) {
    if (!rawState || typeof rawState !== "object") return null;
    if (!Array.isArray(rawState.historyStack)) return null;

    const cleanStack = rawState.historyStack
      .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
      .slice(0, 100);

    if (cleanStack.length === 0) return null;

    let cleanIndex = Number(rawState.historyIndex);
    if (!Number.isInteger(cleanIndex)) cleanIndex = cleanStack.length - 1;
    if (cleanIndex < 0) cleanIndex = 0;
    if (cleanIndex >= cleanStack.length) cleanIndex = cleanStack.length - 1;

    return {
      historyStack: cleanStack,
      historyIndex: cleanIndex,
    };
  }
})();
