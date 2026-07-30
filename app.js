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
  "App Store": "这里会放做过的产品与可以体验的作品。",
  Folder: "这里会收纳完整作品集。",
  Trash: "暂时没有什么值得丢掉。"
};

const desktop = document.querySelector("#desktop");
const safariWindow = document.querySelector("#safari-window");
const safariViewport = document.querySelector("#safari-viewport");
const appWindow = document.querySelector("#app-window");
const appWindowTitle = document.querySelector("#app-window-title");
const appWindowBody = document.querySelector(".app-window-body");
const appWindowHeading = document.querySelector("#app-window-heading");
const appWindowCopy = document.querySelector("#app-window-copy");
const appWindowIcon = document.querySelector("#app-window-icon");
const musicPlayer = document.querySelector("#music-player");
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
const imageModal = document.querySelector("#image-modal");
const toast = document.querySelector("#desktop-toast");
const dockButtons = [...document.querySelectorAll(".dock-app")];
let topZ = 30;
let toastTimer;
const musicTracks = [
  { title: "Ditto", artist: "NewJeans", duration: 186, color: "#90a867" },
  { title: "Supernatural", artist: "NewJeans", duration: 191, color: "#c68b70" },
  { title: "Luv(sic)", artist: "Nujabes", duration: 222, color: "#789ab8" }
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
  setRunning("Safari", false);
  activeAppName.textContent = appWindow.hidden || appWindow.classList.contains("is-closed") ? "Finder" : appWindow.dataset.window;
}

function minimizeWindow(windowElement, appName) {
  windowElement.classList.add("is-minimized");
  windowElement.classList.remove("is-active");
  setRunning(appName, true);
  activeAppName.textContent = "Finder";
}

function maximizeWindow(windowElement) {
  if (windowElement.classList.contains("is-music-window")) return;
  windowElement.classList.toggle("is-maximized");
  focusWindow(windowElement, windowElement.dataset.window);
}

function openApp(appName, iconSrc) {
  appWindow.hidden = false;
  appWindow.dataset.window = appName;
  appWindow.classList.remove("is-minimized", "is-closed");
  appWindowTitle.textContent = appName;
  const isMusic = appName === "Music";
  appWindow.classList.toggle("is-music-window", isMusic);
  appWindowBody.hidden = isMusic;
  musicPlayer.hidden = !isMusic;

  if (isMusic) {
    renderMusicPlayer();
  } else {
    appWindowHeading.textContent = appName;
    appWindowCopy.textContent = appCopy[appName] || "这个 App 已经可以打开，内容会在后续版本接入。";
    appWindowIcon.src = iconSrc;
    appWindowIcon.alt = `${appName} 图标`;
  }

  focusWindow(appWindow, appName);
  setRunning(appName, true);
  bounceDockIcon(appName);
}

function closeAppWindow() {
  const appName = appWindow.dataset.window;
  if (appName === "Music") {
    musicState.playing = false;
    renderMusicPlayer();
  }
  appWindow.classList.add("is-closed");
  appWindow.classList.remove("is-minimized");
  setRunning(appName, false);
  activeAppName.textContent = safariWindow.classList.contains("is-closed") || safariWindow.classList.contains("is-minimized") ? "Finder" : "Safari";
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
    if (!appWindow.classList.contains("is-music-window") || event.target.closest("button, #click-wheel")) return;

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
    musicPlayer.classList.add("is-dragging");
    musicPlayer.setPointerCapture(event.pointerId);
    focusWindow(appWindow, "Music");
  });

  musicPlayer.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const maxLeft = Math.max(0, window.innerWidth - appWindow.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dragState.workspaceTop - appWindow.offsetHeight - 80);
    const nextLeft = Math.min(maxLeft, Math.max(0, event.clientX - dragState.offsetX));
    const nextTop = Math.min(maxTop, Math.max(0, event.clientY - dragState.offsetY - dragState.workspaceTop));
    appWindow.style.left = `${nextLeft}px`;
    appWindow.style.top = `${nextTop}px`;
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

document.querySelectorAll("[data-app-window-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.appWindowAction;
    if (action === "close") closeAppWindow();
    if (action === "minimize") minimizeWindow(appWindow, appWindow.dataset.window);
    if (action === "maximize") maximizeWindow(appWindow);
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

document.querySelectorAll("[data-open-note-image]").forEach((button) => {
  button.addEventListener("click", () => {
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
document.querySelectorAll("[data-close-image]").forEach((button) => button.addEventListener("click", () => {
  imageModal.hidden = true;
}));

document.querySelectorAll(".mac-window").forEach((windowElement) => {
  windowElement.addEventListener("pointerdown", () => {
    if (!windowElement.classList.contains("is-minimized")) {
      focusWindow(windowElement, windowElement.dataset.window);
    }
  });
  makeDraggable(windowElement);
});

makeMusicDraggable();

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
}
