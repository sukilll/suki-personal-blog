const appCopy = {
  Finder: "这里会成为你的项目与作品目录。",
  Messages: "这里会放对话、反馈与联系方式。",
  Mail: "这里会放邮件联系入口。",
  Maps: "这里会放走过的路径与重要地点。",
  Photos: "这里会放项目图像与生活切片。",
  FaceTime: "这里会放预约与你见面的入口。",
  Calendar: "这里会放产品、工作与人生时间线。",
  Contacts: "这里会放合作伙伴与联系网络。",
  Reminders: "这里会放正在做、准备做和不该忘记的事。",
  Notes: "这里会放短想法与产品笔记。",
  Freeform: "这里会放还没有名字、但正在生长的想法。",
  Music: "这里会放最近在听的声音。",
  Stickers: "这里会放一些让桌面更像自己的小贴纸。",
  "App Store": "这里会放做过的产品与可以体验的作品。",
  Folder: "这里会收纳完整作品集。",
  Trash: "暂时没有什么值得丢掉。"
};

const desktop = document.querySelector("#desktop");
const workspace = document.querySelector(".workspace");
const safariWindow = document.querySelector("#safari-window");
const safariViewport = document.querySelector("#safari-viewport");
const appWindow = document.querySelector("#app-window");
const appWindowTitle = document.querySelector("#app-window-title");
const appWindowBody = document.querySelector(".app-window-body");
const appWindowHeading = document.querySelector("#app-window-heading");
const appWindowCopy = document.querySelector("#app-window-copy");
const appWindowIcon = document.querySelector("#app-window-icon");
const musicPlayer = document.querySelector("#music-player");
const stickersNote = document.querySelector("#stickers-note");
const stickerNoteToolbar = document.querySelector("#sticker-note-toolbar");
const stickerNoteContent = document.querySelector("#sticker-note-content");
const musicTrackTitle = document.querySelector("#music-track-title");
const musicTrackArtist = document.querySelector("#music-track-artist");
const musicTrackIndex = document.querySelector("#music-track-index");
const musicStateLabel = document.querySelector("#music-state-label");
const musicProgressFill = document.querySelector("#music-progress-fill");
const musicElapsed = document.querySelector("#music-elapsed");
const musicDuration = document.querySelector("#music-duration");
const musicCenterLabel = document.querySelector("#music-center-label");
const clickWheel = document.querySelector("#click-wheel");
const activeAppName = document.querySelector("#active-app-name");
const launchpad = document.querySelector("#launchpad");
const launchpadApps = document.querySelector("#launchpad-apps");
const readerModal = document.querySelector("#reader-modal");
const personalAgentModal = document.querySelector("#personal-agent-modal");
const todayOriginModal = document.querySelector("#today-origin-modal");
const imageModal = document.querySelector("#image-modal");
const imageModalContent = imageModal.querySelector("img");
const toast = document.querySelector("#desktop-toast");
const dockButtons = [...document.querySelectorAll(".dock-app")];
let topZ = 30;
let toastTimer;
let musicWindow;
const genericAppWindows = new Map();
const photoPreviewObservers = new WeakMap();
const musicTracks = [
  { title: "Ditto", artist: "NewJeans", duration: 186, color: "#90a867" },
  { title: "Supernatural", artist: "NewJeans", duration: 191, color: "#c68b70" },
  { title: "Luv(sic)", artist: "Nujabes", duration: 222, color: "#789ab8" }
];
const lifePhotos = Array.from({ length: 8 }, (_, index) => ({
  src: `assets/photos/life-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Suki 的生活照片 ${index + 1}`
}));
const notesArticles = [
  {
    id: "personal-agent",
    folder: "产品判断",
    label: "2026.09.03 · PRODUCT THESIS",
    title: "一个关于 Personal Agent 产品形态的判断，我是怎么推翻、又重新思考它的",
    subtitle: "On revisiting a thesis about Personal Agent"
  },
  {
    id: "consensus",
    folder: "产品判断",
    label: "2025 · PRODUCT NOTE",
    title: "做共识，还是做非共识",
    subtitle: "On consensus and the contrarian"
  },
  {
    id: "monica-2",
    folder: "产品复盘",
    label: "PRODUCT THINKING",
    title: "Monica 2.0 产品思考",
    subtitle: "A visual note on the product's evolution"
  },
  {
    id: "today-origin",
    folder: "Today AI",
    label: "2026.10.26 · TODAY AI",
    title: "从 Monspeak 到 Today：我为什么开始做一个通用 Personal AI",
    subtitle: "The thesis behind Today AI"
  }
];
const musicState = { track: 0, elapsed: 0, playing: false };

function updateClock() {
  const clock = document.querySelector("#menu-clock");
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
  clock.textContent = formatted.replace(",", "");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function dockButtonFor(appName) {
  return dockButtons.find((button) => button.dataset.app === appName);
}

function bounceDockIcon(appName) {
  const button = dockButtonFor(appName);
  if (!button) return;
  button.classList.remove("is-bouncing");
  window.requestAnimationFrame(() => button.classList.add("is-bouncing"));
  window.setTimeout(() => button.classList.remove("is-bouncing"), 520);
}

function focusWindow(windowElement, appName) {
  topZ += 1;
  document.querySelectorAll(".mac-window").forEach((item) => item.classList.remove("is-active"));
  windowElement.style.zIndex = String(topZ);
  windowElement.classList.add("is-active");
  activeAppName.textContent = appName;
}

function setRunning(appName, isRunning) {
  const button = dockButtonFor(appName);
  button?.classList.toggle("is-running", isRunning);
}

function openSafari() {
  safariWindow.hidden = false;
  safariWindow.classList.remove("is-minimized", "is-closed");
  focusWindow(safariWindow, "Safari");
  setRunning("Safari", true);
  bounceDockIcon("Safari");
}

function closeSafari() {
  safariWindow.classList.add("is-closed");
  safariWindow.classList.remove("is-minimized");
  safariWindow.classList.remove("is-active");
  setRunning("Safari", false);
  activeAppName.textContent = document.querySelector(".mac-window.is-active")?.dataset.window || "Finder";
}

function minimizeWindow(windowElement, appName) {
  windowElement.classList.add("is-minimized");
  windowElement.classList.remove("is-active");
  setRunning(appName, true);
  activeAppName.textContent = "Finder";
}

function maximizeWindow(windowElement) {
  if (windowElement.classList.contains("is-music-window") || windowElement.classList.contains("is-stickers-window")) return;
  windowElement.classList.toggle("is-maximized");
  focusWindow(windowElement, windowElement.dataset.window);
}

function openStickers() {
  appWindow.hidden = false;
  appWindow.dataset.window = "Stickers";
  appWindow.classList.remove("is-minimized", "is-closed");
  appWindow.classList.remove("is-music-window");
  appWindow.classList.add("is-stickers-window");
  appWindowBody.hidden = true;
  stickersNote.hidden = false;

  focusWindow(appWindow, "Stickers");
  setRunning("Stickers", true);
  bounceDockIcon("Stickers");
  window.requestAnimationFrame(() => stickerNoteContent.focus());
}

function ensureMusicWindow() {
  if (musicWindow) return musicWindow;

  musicWindow = document.createElement("section");
  musicWindow.className = "mac-window app-window is-music-window";
  musicWindow.dataset.window = "Music";
  musicWindow.setAttribute("aria-label", "Music");
  musicWindow.hidden = true;
  if (window.innerWidth > 920) {
    musicWindow.style.left = "calc(50% + 322px)";
  }
  workspace.insertBefore(musicWindow, launchpad);
  musicWindow.append(musicPlayer);
  registerWindow(musicWindow);
  return musicWindow;
}

function openMusic() {
  const windowElement = ensureMusicWindow();
  windowElement.hidden = false;
  windowElement.classList.remove("is-minimized", "is-closed");
  musicPlayer.hidden = false;
  renderMusicPlayer();
  focusWindow(windowElement, "Music");
  setRunning("Music", true);
  bounceDockIcon("Music");
}

function createGenericAppWindow(appName, iconSrc) {
  const windowElement = document.createElement("section");
  const windowOffset = (genericAppWindows.size % 5) * 32;
  const isPhotos = appName === "Photos";
  const isNotes = appName === "Notes";
  windowElement.className = "mac-window app-window";
  windowElement.classList.toggle("is-photos-window", isPhotos);
  windowElement.classList.toggle("is-notes-window", isNotes);
  windowElement.dataset.window = appName;
  windowElement.setAttribute("aria-label", `${appName} 窗口`);
  windowElement.style.left = isPhotos || isNotes ? "50%" : `calc(50% + ${windowOffset - 96}px)`;
  windowElement.style.top = isPhotos || isNotes ? "10vh" : `calc(15vh + ${windowOffset}px)`;
  windowElement.innerHTML = `
    <div class="compact-toolbar window-drag-handle">
      <div class="traffic-controls" aria-label="窗口控制">
        <img src="assets/desktop/window-controls.svg" alt="" />
        <button class="traffic-hit close-hit" type="button" data-app-window-action="close" aria-label="关闭窗口"></button>
        <button class="traffic-hit minimize-hit" type="button" data-app-window-action="minimize" aria-label="最小化窗口"></button>
        <button class="traffic-hit maximize-hit" type="button" data-app-window-action="maximize" aria-label="放大窗口"></button>
      </div>
      <strong></strong>
    </div>
    ${isPhotos ? `
      <div class="photos-app">
        <aside class="photos-sidebar" aria-label="照片图库">
          <p>LIBRARY</p>
          <span class="is-selected">Photos</span>
          <span>Favourites</span>
          <span>Recents</span>
        </aside>
        <section class="photos-main" aria-label="生活照片">
          <div class="photos-gallery-view">
            <div class="photos-heading"><h2>Life</h2><span>${lifePhotos.length} Photos</span></div>
            <div class="photo-grid">
              ${lifePhotos.map((photo, index) => `<button class="photo-tile" type="button" data-life-photo-index="${index}" aria-label="查看${photo.alt}"><img src="${photo.src}" alt="${photo.alt}" /></button>`).join("")}
            </div>
          </div>
          <div class="photo-preview-view" hidden>
            <div class="photo-preview-toolbar">
              <button class="photo-preview-back" type="button" data-close-photo-preview aria-label="返回照片列表">‹</button>
              <span class="photo-preview-title">Life · <span data-photo-preview-count>1 / ${lifePhotos.length}</span></span>
            </div>
            <div class="photo-preview-canvas"><img data-photo-preview-image src="${lifePhotos[0].src}" alt="${lifePhotos[0].alt}" /></div>
            <div class="photo-filmstrip" aria-label="照片缩略图">
              ${lifePhotos.map((photo, index) => `<button type="button" data-photo-preview-index="${index}" aria-label="查看${photo.alt}"><img src="${photo.src}" alt="" /></button>`).join("")}
            </div>
          </div>
        </section>
      </div>
    ` : isNotes ? `
      <div class="notes-app">
        <aside class="notes-sidebar" aria-label="备忘录目录">
          <div class="notes-sidebar-brand">
            <span class="notes-brand-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <strong>Suki's Notes</strong>
          </div>
          <label class="notes-search" aria-label="搜索文章">
            <span class="notes-search-icon" aria-hidden="true"></span>
            <input type="search" data-notes-search placeholder="Search" autocomplete="off" />
          </label>
          <p class="notes-toc-label">Table of Contents</p>
          <div class="notes-tree" role="tree" aria-label="文章目录">
            <p class="notes-tree-root">Suki's Writing</p>
            ${[...new Set(notesArticles.map((article) => article.folder))].map((folder) => `
              <section class="notes-tree-group" data-notes-folder="${folder}">
                <button class="notes-tree-folder" type="button" data-toggle-notes-folder="${folder}" aria-expanded="true">
                  <span class="notes-folder-chevron" aria-hidden="true">⌄</span>
                  <span>${folder}</span>
                  <small>${notesArticles.filter((article) => article.folder === folder).length}</small>
                </button>
                <div class="notes-tree-children">
                  ${notesArticles.filter((article) => article.folder === folder).map((article) => `
                    <button class="notes-tree-item" type="button" data-note-article="${article.id}" role="treeitem">
                      <strong>${article.title}</strong>
                      <span>${article.label.split(" · ")[0]}</span>
                    </button>
                  `).join("")}
                </div>
              </section>
            `).join("")}
          </div>
        </aside>
        <section class="notes-main" aria-label="博客正文">
          <article class="notes-reader" data-notes-reader></article>
        </section>
      </div>
    ` : `
      <div class="app-window-body">
        <img alt="" />
        <p class="eyebrow">DESKTOP APP</p>
        <h2></h2>
        <p></p>
        <span>App 已经可以打开，内容会在后续版本接入。</span>
      </div>
    `}
  `;

  windowElement.querySelector(".compact-toolbar strong").textContent = appName;
  if (!isPhotos && !isNotes) {
    windowElement.querySelector(".app-window-body h2").textContent = appName;
    windowElement.querySelector(".app-window-body > p:not(.eyebrow)").textContent = appCopy[appName] || "这个 App 已经可以打开，内容会在后续版本接入。";
    const icon = windowElement.querySelector(".app-window-body > img");
    icon.src = iconSrc;
    icon.alt = `${appName} 图标`;
  }

  workspace.insertBefore(windowElement, launchpad);
  if (isPhotos) preparePhotoPreview(windowElement.querySelector(".photos-main"));
  if (isNotes) prepareNotesApp(windowElement);
  registerWindow(windowElement);
  genericAppWindows.set(appName, windowElement);
  return windowElement;
}

function articleBodyFromModal(modalId) {
  const source = document.querySelector(`${modalId} .reader-paper`);
  if (!source) return "";

  const content = source.cloneNode(true);
  content.querySelector(".reader-close")?.remove();
  content.querySelectorAll(".eyebrow, h2, .reader-subtitle").forEach((element) => element.remove());
  return content.innerHTML;
}

function noteArticleBody(articleId) {
  if (articleId === "personal-agent") return articleBodyFromModal("#personal-agent-modal");
  if (articleId === "consensus") return articleBodyFromModal("#reader-modal");
  if (articleId === "today-origin") return articleBodyFromModal("#today-origin-modal");
  if (articleId === "monica-2") {
    return `
      <figure class="notes-visual-entry">
        <img src="assets/monica-2-product-thinking.png" alt="Monica 2.0 产品思考" />
        <figcaption>Monica 2.0 · 产品思考与路线</figcaption>
      </figure>
      <p>一份关于 Monica 2.0 的产品思考：从发展历程，到 AI 市场变化、Copilot 助手、个性化与 All in one 工作台。</p>
    `;
  }
  return "";
}

function renderNotesArticle(notesWindow, articleId) {
  const article = notesArticles.find((item) => item.id === articleId) || notesArticles[0];
  const reader = notesWindow.querySelector("[data-notes-reader]");
  if (!reader || !article) return;

  reader.innerHTML = `
    <header class="notes-reader-header">
      <p>${article.label}</p>
      <h2>${article.title}</h2>
      <span>${article.subtitle}</span>
    </header>
    <div class="notes-reader-content">${noteArticleBody(article.id)}</div>
  `;
  reader.scrollTop = 0;
  notesWindow.querySelectorAll("[data-note-article]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.noteArticle === article.id);
  });
}

function prepareNotesApp(notesWindow) {
  renderNotesArticle(notesWindow, notesArticles[0].id);
}

function fitPhotoPreview(photosMain) {
  const canvas = photosMain.querySelector(".photo-preview-canvas");
  const image = photosMain.querySelector("[data-photo-preview-image]");
  if (!canvas || !image?.naturalWidth || !canvas.clientWidth || !canvas.clientHeight) return;

  const availableWidth = Math.max(1, canvas.clientWidth - 24);
  const availableHeight = Math.max(1, canvas.clientHeight - 24);
  const scale = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight);
  image.style.width = `${Math.floor(image.naturalWidth * scale)}px`;
  image.style.height = `${Math.floor(image.naturalHeight * scale)}px`;
}

function preparePhotoPreview(photosMain) {
  const canvas = photosMain.querySelector(".photo-preview-canvas");
  const image = photosMain.querySelector("[data-photo-preview-image]");
  image.addEventListener("load", () => fitPhotoPreview(photosMain));
  const observer = new ResizeObserver(() => fitPhotoPreview(photosMain));
  observer.observe(canvas);
  photoPreviewObservers.set(photosMain, observer);
}

function openGenericApp(appName, iconSrc) {
  const windowElement = genericAppWindows.get(appName) || createGenericAppWindow(appName, iconSrc);
  windowElement.hidden = false;
  windowElement.classList.remove("is-minimized", "is-closed");
  focusWindow(windowElement, appName);
  setRunning(appName, true);
  bounceDockIcon(appName);
}

function openApp(appName, iconSrc) {
  if (appName === "Stickers") {
    openStickers();
    return;
  }

  if (appName === "Music") {
    openMusic();
    return;
  }

  openGenericApp(appName, iconSrc);
}

function closeAppWindow(windowElement) {
  const appName = windowElement.dataset.window;
  if (appName === "Music") {
    musicState.playing = false;
    renderMusicPlayer();
  }
  windowElement.classList.add("is-closed");
  windowElement.classList.remove("is-minimized", "is-active");
  setRunning(appName, false);
  activeAppName.textContent = document.querySelector(".mac-window.is-active")?.dataset.window || "Finder";
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function renderMusicPlayer() {
  const track = musicTracks[musicState.track];
  musicTrackTitle.textContent = track.title;
  musicTrackArtist.textContent = track.artist;
  musicTrackIndex.textContent = `${String(musicState.track + 1).padStart(2, "0")} / ${String(musicTracks.length).padStart(2, "0")}`;
  musicStateLabel.textContent = musicState.playing ? "PLAYING" : "PAUSED";
  musicProgressFill.style.width = `${(musicState.elapsed / track.duration) * 100}%`;
  musicElapsed.textContent = formatDuration(musicState.elapsed);
  musicDuration.textContent = formatDuration(track.duration);
  musicCenterLabel.textContent = musicState.playing ? "❚❚" : "▶";
  musicPlayer.style.setProperty("--album-color", track.color);
  musicPlayer.classList.toggle("is-playing", musicState.playing);
}

function changeTrack(direction) {
  musicState.track = (musicState.track + direction + musicTracks.length) % musicTracks.length;
  musicState.elapsed = 0;
  renderMusicPlayer();
}

function toggleMusic() {
  musicState.playing = !musicState.playing;
  renderMusicPlayer();
}

function openLaunchpad() {
  buildLaunchpad();
  launchpad.hidden = false;
  activeAppName.textContent = "Launchpad";
  bounceDockIcon("Launchpad");
}

function closeLaunchpad() {
  launchpad.hidden = true;
  activeAppName.textContent = document.querySelector(".mac-window.is-active")?.dataset.window || "Finder";
}

function buildLaunchpad() {
  if (launchpadApps.children.length) return;

  dockButtons
    .filter((button) => !["Launchpad", "Folder", "Trash"].includes(button.dataset.app))
    .forEach((button) => {
      const appButton = document.createElement("button");
      appButton.className = "launchpad-app";
      appButton.type = "button";
      appButton.dataset.app = button.dataset.app;
      appButton.dataset.icon = button.dataset.icon || "";
      appButton.setAttribute("aria-label", `打开 ${button.dataset.app}`);
      appButton.innerHTML = `<img src="${button.dataset.icon}" alt=""><span>${button.dataset.app}</span>`;
      launchpadApps.append(appButton);
    });
}

function openDockApp(button) {
  const appName = button.dataset.app;

  if (appName === "Safari") {
    openSafari();
    return;
  }

  if (appName === "Launchpad") {
    openLaunchpad();
    return;
  }

  openApp(appName, button.dataset.icon);
}

async function shareSite() {
  const shareData = {
    title: "Suki's Desktop",
    text: "Suki 的个人桌面：产品、设计与写作。",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast("链接已复制");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("可以直接复制地址栏里的链接");
  }
}

function handleBrowserAction(action) {
  if (action === "back" || action === "refresh") {
    safariViewport.scrollTo({ top: 0, behavior: "smooth" });
    if (action === "refresh") showToast("Safari 已刷新");
    return;
  }

  if (action === "forward") {
    document.querySelector("#profile")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (action === "share") {
    shareSite();
    return;
  }

  if (action === "search") {
    showToast("试试在页面里搜索：产品、设计、写作");
    safariViewport.focus();
    return;
  }

  if (action === "options") {
    showToast("这是 Suki 的 Safari");
    return;
  }

  if (action === "add") {
    safariViewport.scrollTo({ top: 0, behavior: "smooth" });
    showToast("已打开一个新的个人主页标签");
  }
}

function handleMenuAction(action) {
  const messages = {
    about: "Suki’s Desktop · Product, Design, Writing",
    file: "从 Dock 打开一个 App",
    edit: "这里暂时没有需要编辑的内容",
    view: "点击绿色按钮可以放大当前窗口",
    go: "Safari 里向下滚动，继续认识 Suki",
    window: "窗口可以拖动、最小化和放大",
    help: "点击每个 Dock 图标，都有响应"
  };
  showToast(messages[action] || "Suki’s Desktop");
}

function closeOverlays() {
  launchpad.hidden = true;
  readerModal.hidden = true;
  personalAgentModal.hidden = true;
  todayOriginModal.hidden = true;
  imageModal.hidden = true;
}

function makeDraggable(windowElement) {
  const handle = windowElement.querySelector(".window-drag-handle");
  if (!handle) return;

  let dragState = null;

  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || windowElement.classList.contains("is-maximized") || window.innerWidth <= 760) return;

    const rect = windowElement.getBoundingClientRect();
    const workspaceRect = document.querySelector(".workspace").getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      workspaceTop: workspaceRect.top
    };

    windowElement.style.left = `${rect.left}px`;
    windowElement.style.top = `${rect.top - workspaceRect.top}px`;
    windowElement.style.transform = "none";
    focusWindow(windowElement, windowElement.dataset.window);
    handle.classList.add("is-dragging");
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const maxLeft = Math.max(0, window.innerWidth - windowElement.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dragState.workspaceTop - 90);
    const nextLeft = Math.min(maxLeft, Math.max(0, event.clientX - dragState.offsetX));
    const nextTop = Math.min(maxTop, Math.max(0, event.clientY - dragState.workspaceTop - dragState.offsetY));
    windowElement.style.left = `${nextLeft}px`;
    windowElement.style.top = `${nextTop}px`;
  });

  const stopDragging = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    handle.releasePointerCapture(event.pointerId);
    handle.classList.remove("is-dragging");
    dragState = null;
  };

  handle.addEventListener("pointerup", stopDragging);
  handle.addEventListener("pointercancel", stopDragging);
}

function makeMusicDraggable() {
  let dragState = null;

  musicPlayer.addEventListener("pointerdown", (event) => {
    if (!musicWindow || event.target.closest("button, #click-wheel")) return;

    const rect = musicWindow.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      workspaceTop: workspaceRect.top
    };

    musicWindow.style.left = `${rect.left}px`;
    musicWindow.style.top = `${rect.top - workspaceRect.top}px`;
    musicWindow.style.transform = "none";
    musicPlayer.classList.add("is-dragging");
    musicPlayer.setPointerCapture(event.pointerId);
    focusWindow(musicWindow, "Music");
  });

  musicPlayer.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const maxLeft = Math.max(0, window.innerWidth - musicWindow.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dragState.workspaceTop - musicWindow.offsetHeight - 80);
    const nextLeft = Math.min(maxLeft, Math.max(0, event.clientX - dragState.offsetX));
    const nextTop = Math.min(maxTop, Math.max(0, event.clientY - dragState.offsetY - dragState.workspaceTop));
    musicWindow.style.left = `${nextLeft}px`;
    musicWindow.style.top = `${nextTop}px`;
  });

  const stopDragging = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    musicPlayer.releasePointerCapture(event.pointerId);
    musicPlayer.classList.remove("is-dragging");
    dragState = null;
  };

  musicPlayer.addEventListener("pointerup", stopDragging);
  musicPlayer.addEventListener("pointercancel", stopDragging);
}

dockButtons.forEach((button) => {
  button.addEventListener("click", () => openDockApp(button));
});

launchpadApps.addEventListener("click", (event) => {
  const button = event.target.closest(".launchpad-app");
  if (!button) return;
  closeLaunchpad();
  if (button.dataset.app === "Safari") openSafari();
  else openApp(button.dataset.app, button.dataset.icon);
});

document.querySelectorAll("[data-window-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.windowAction;
    if (action === "close") closeSafari();
    if (action === "minimize") minimizeWindow(safariWindow, "Safari");
    if (action === "maximize") maximizeWindow(safariWindow);
  });
});

desktop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-app-window-action]");
  if (!button) return;
  const windowElement = button.closest(".mac-window");
  if (!windowElement) return;
  const action = button.dataset.appWindowAction;
  if (action === "close") closeAppWindow(windowElement);
  if (action === "minimize") minimizeWindow(windowElement, windowElement.dataset.window);
  if (action === "maximize") maximizeWindow(windowElement);
});

desktop.addEventListener("click", (event) => {
  const closePreview = event.target.closest("[data-close-photo-preview]");
  if (closePreview) {
    const photosMain = closePreview.closest(".photos-main");
    photosMain.querySelector(".photos-gallery-view").hidden = false;
    photosMain.querySelector(".photo-preview-view").hidden = true;
    return;
  }

  const photoButton = event.target.closest("[data-life-photo-index], [data-photo-preview-index]");
  if (!photoButton) return;
  const index = Number(photoButton.dataset.lifePhotoIndex ?? photoButton.dataset.photoPreviewIndex);
  const photosMain = photoButton.closest(".photos-main");
  if (!photosMain || !lifePhotos[index]) return;

  const photo = lifePhotos[index];
  photosMain.querySelector("[data-photo-preview-image]").src = photo.src;
  photosMain.querySelector("[data-photo-preview-image]").alt = photo.alt;
  photosMain.querySelector("[data-photo-preview-count]").textContent = `${index + 1} / ${lifePhotos.length}`;
  photosMain.querySelectorAll("[data-photo-preview-index]").forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.photoPreviewIndex) === index);
  });
  photosMain.querySelector(".photos-gallery-view").hidden = true;
  photosMain.querySelector(".photo-preview-view").hidden = false;
  window.requestAnimationFrame(() => fitPhotoPreview(photosMain));
});

desktop.addEventListener("click", (event) => {
  const folderButton = event.target.closest("[data-toggle-notes-folder]");
  if (folderButton) {
    const group = folderButton.closest(".notes-tree-group");
    const isCollapsed = group.classList.toggle("is-collapsed");
    folderButton.setAttribute("aria-expanded", String(!isCollapsed));
    return;
  }

  const articleButton = event.target.closest("[data-note-article]");
  if (!articleButton) return;
  const notesWindow = articleButton.closest(".is-notes-window");
  if (notesWindow) renderNotesArticle(notesWindow, articleButton.dataset.noteArticle);
});

desktop.addEventListener("input", (event) => {
  const search = event.target.closest("[data-notes-search]");
  if (!search) return;

  const notesWindow = search.closest(".is-notes-window");
  const tree = notesWindow?.querySelector(".notes-tree");
  if (!notesWindow || !tree) return;

  const query = search.value.trim().toLocaleLowerCase();
  tree.classList.toggle("is-searching", Boolean(query));
  notesWindow.querySelectorAll("[data-note-article]").forEach((button) => {
    button.hidden = Boolean(query) && !button.textContent.toLocaleLowerCase().includes(query);
  });
  notesWindow.querySelectorAll(".notes-tree-group").forEach((group) => {
    group.hidden = Boolean(query) && ![...group.querySelectorAll("[data-note-article]")].some((button) => !button.hidden);
  });
});

document.querySelectorAll("[data-browser-action]").forEach((button) => {
  button.addEventListener("click", () => handleBrowserAction(button.dataset.browserAction));
});

document.querySelectorAll("[data-menu-action]").forEach((button) => {
  button.addEventListener("click", () => handleMenuAction(button.dataset.menuAction));
});

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.scrollTo}`)?.scrollIntoView({ behavior: "smooth" }));
});

document.querySelectorAll("[data-open-essay]").forEach((button) => {
  button.addEventListener("click", () => {
    readerModal.hidden = false;
  });
});

document.querySelectorAll("[data-open-personal-agent]").forEach((button) => {
  button.addEventListener("click", () => {
    personalAgentModal.hidden = false;
  });
});

document.querySelectorAll("[data-open-today-origin]").forEach((button) => {
  button.addEventListener("click", () => {
    todayOriginModal.hidden = false;
  });
});

document.querySelectorAll("[data-open-note-image]").forEach((button) => {
  button.addEventListener("click", () => {
    imageModalContent.src = "assets/monica-2-product-thinking.png";
    imageModalContent.alt = "Monica 2.0 产品思考";
    imageModal.hidden = false;
  });
});

document.querySelectorAll("[data-note-title]").forEach((button) => {
  button.addEventListener("click", () => showToast(`${button.dataset.noteTitle} · 正在整理中`));
});

document.querySelectorAll("[data-music-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.musicAction;
    if (action === "toggle") toggleMusic();
    if (action === "prev") changeTrack(-1);
    if (action === "next") changeTrack(1);
    if (action === "menu") showToast("Suki's Desk Mix · 3 tracks");
  });
});

let wheelPointer = null;
let wheelTurn = 0;

function wheelAngle(event) {
  const rect = clickWheel.getBoundingClientRect();
  return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2));
}

clickWheel.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  wheelPointer = { id: event.pointerId, angle: wheelAngle(event) };
  wheelTurn = 0;
  clickWheel.setPointerCapture(event.pointerId);
});

clickWheel.addEventListener("pointermove", (event) => {
  if (!wheelPointer || event.pointerId !== wheelPointer.id) return;
  const nextAngle = wheelAngle(event);
  let delta = nextAngle - wheelPointer.angle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  wheelPointer.angle = nextAngle;
  wheelTurn += delta;

  if (Math.abs(wheelTurn) > 0.72) {
    changeTrack(wheelTurn > 0 ? 1 : -1);
    wheelTurn = 0;
  }
});

function releaseWheel(event) {
  if (!wheelPointer || event.pointerId !== wheelPointer.id) return;
  clickWheel.releasePointerCapture(event.pointerId);
  wheelPointer = null;
}

clickWheel.addEventListener("pointerup", releaseWheel);
clickWheel.addEventListener("pointercancel", releaseWheel);

document.querySelectorAll("[data-close-launchpad]").forEach((button) => button.addEventListener("click", closeLaunchpad));
document.querySelectorAll("[data-close-reader]").forEach((button) => button.addEventListener("click", () => {
  readerModal.hidden = true;
}));
document.querySelectorAll("[data-close-personal-agent]").forEach((button) => button.addEventListener("click", () => {
  personalAgentModal.hidden = true;
}));
document.querySelectorAll("[data-close-today-origin]").forEach((button) => button.addEventListener("click", () => {
  todayOriginModal.hidden = true;
}));
document.querySelectorAll("[data-close-image]").forEach((button) => button.addEventListener("click", () => {
  imageModal.hidden = true;
}));

function registerWindow(windowElement) {
  windowElement.addEventListener("pointerdown", () => {
    if (!windowElement.classList.contains("is-minimized")) {
      focusWindow(windowElement, windowElement.dataset.window);
    }
  });
  makeDraggable(windowElement);
}

registerWindow(safariWindow);
registerWindow(appWindow);

makeMusicDraggable();

function makeStickersDraggable() {
  let dragState = null;

  stickerNoteToolbar.addEventListener("pointerdown", (event) => {
    if (!appWindow.classList.contains("is-stickers-window") || event.target.closest("button")) return;

    const rect = appWindow.getBoundingClientRect();
    const workspaceRect = document.querySelector(".workspace").getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      workspaceTop: workspaceRect.top
    };

    appWindow.style.left = `${rect.left}px`;
    appWindow.style.top = `${rect.top - workspaceRect.top}px`;
    appWindow.style.transform = "none";
    stickersNote.classList.add("is-dragging");
    stickerNoteToolbar.setPointerCapture(event.pointerId);
    focusWindow(appWindow, "Stickers");
  });

  stickerNoteToolbar.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const maxLeft = Math.max(0, window.innerWidth - appWindow.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dragState.workspaceTop - appWindow.offsetHeight - 80);
    appWindow.style.left = `${Math.min(maxLeft, Math.max(0, event.clientX - dragState.offsetX))}px`;
    appWindow.style.top = `${Math.min(maxTop, Math.max(0, event.clientY - dragState.offsetY - dragState.workspaceTop))}px`;
  });

  const stopDragging = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    stickerNoteToolbar.releasePointerCapture(event.pointerId);
    stickersNote.classList.remove("is-dragging");
    dragState = null;
  };

  stickerNoteToolbar.addEventListener("pointerup", stopDragging);
  stickerNoteToolbar.addEventListener("pointercancel", stopDragging);
}

const stickerNoteStorageKey = "suki-sticker-note-v2";
stickerNoteContent.value = window.localStorage.getItem(stickerNoteStorageKey) ?? stickerNoteContent.value;
stickerNoteContent.addEventListener("input", () => {
  window.localStorage.setItem(stickerNoteStorageKey, stickerNoteContent.value);
});

makeStickersDraggable();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeOverlays();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openLaunchpad();
  }
});

desktop.addEventListener("dblclick", (event) => {
  if (event.target === desktop || event.target.classList.contains("workspace")) {
    showToast("从 Dock 打开一个 App");
  }
});

updateClock();
window.setInterval(updateClock, 30000);
window.setInterval(() => {
  if (!musicState.playing) return;
  const track = musicTracks[musicState.track];
  musicState.elapsed += 1;
  if (musicState.elapsed >= track.duration) {
    musicState.elapsed = 0;
    musicState.track = (musicState.track + 1) % musicTracks.length;
  }
  renderMusicPlayer();
}, 1000);

if (window.location.hash === "#music") {
  openApp("Music", "assets/icons/music.png");
} else {
  openApp("Stickers", "assets/icons/stickers.png");
}
