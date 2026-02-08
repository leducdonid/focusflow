const SETTINGS_KEY = "focusflow_settings";
const TASKS_KEY = "focusflow_tasks";
const SESSIONS_KEY = "focusflow_sessions";
const STATE_KEY = "focusflow_state";
const BLOCKS_KEY = "focusflow_blocks";
const LEGACY_AUTH_KEY = "focusflow_auth";
const THEME_KEY = "focusflow_theme";

const defaultSettings = {
  focusMinutes: 50,
  breakMinutes: 10,
  autoAdvance: true,
  dailyGoal: 4,
  soundOn: true,
  notifyOn: false,
};

const QUADRANT_LABELS = {
  do: "Do Now",
  schedule: "Schedule",
  delegate: "Delegate",
  eliminate: "Eliminate",
};

const els = {
  // Navigation
  navSidebar: document.querySelector(".nav-sidebar"),
  navItems: document.querySelectorAll(".nav-item"),
  navTasksCount: document.querySelector("#nav-tasks-count"),
  navBlocksCount: document.querySelector("#nav-blocks-count"),
  navGoalRing: document.querySelector("#nav-goal-ring"),
  navGoalText: document.querySelector("#nav-goal-text"),
  views: document.querySelectorAll(".view"),
  mobileMenuToggle: document.querySelector("#mobile-menu-toggle"),

  // Header & Date
  todayDate: document.querySelector("#today-date"),

  // Flow Nav Items (steps trong sidebar)
  navFlowItems: document.querySelectorAll(".nav-item--flow"),

  // Next Step Hints (trong từng view)
  blocksNextHint: document.querySelector("#blocks-next-hint"),
  tasksNextHint: document.querySelector("#tasks-next-hint"),

  // Dashboard
  dashboardNextTask: document.querySelector("#dashboard-next-task"),
  dashboardNextTaskMeta: document.querySelector("#dashboard-next-task-meta"),
  dashboardStartTask: document.querySelector("#dashboard-start-task"),
  dashboardNextBlock: document.querySelector("#dashboard-next-block"),
  dashboardNextBlockMeta: document.querySelector("#dashboard-next-block-meta"),
  dashboardStartBlock: document.querySelector("#dashboard-start-block"),
  dashboardSessions: document.querySelector("#dashboard-sessions"),
  dashboardMinutes: document.querySelector("#dashboard-minutes"),
  dashboardGoal: document.querySelector("#dashboard-goal"),
  dashboardRecentSessions: document.querySelector("#dashboard-recent-sessions"),

  // Timer
  modeLabel: document.querySelector("#mode-label"),
  modeChip: document.querySelector("#mode-chip"),
  timerDisplay: document.querySelector("#timer-display"),
  timerRingProgress: document.querySelector("#timer-ring-progress"),
  timerContext: document.querySelector("#timer-context"),
  timerContextTask: document.querySelector("#timer-context-task"),
  startBtn: document.querySelector("#start-btn"),
  resetBtn: document.querySelector("#reset-btn"),
  skipBtn: document.querySelector("#skip-btn"),
  presetButtons: document.querySelectorAll("[data-focus-preset]"),

  // Tasks
  taskInput: document.querySelector("#task-input"),
  taskEstimate: document.querySelector("#task-estimate"),
  taskImportant: document.querySelector("#task-important"),
  taskUrgent: document.querySelector("#task-urgent"),
  addTaskBtn: document.querySelector("#add-task-btn"),
  taskMeta: document.querySelector("#task-meta"),
  matrixDo: document.querySelector("#matrix-do"),
  matrixSchedule: document.querySelector("#matrix-schedule"),
  matrixDelegate: document.querySelector("#matrix-delegate"),
  matrixEliminate: document.querySelector("#matrix-eliminate"),
  // New simplified matrix
  matrixPriority: document.querySelector("#matrix-priority"),
  matrixNormal: document.querySelector("#matrix-normal"),
  matrixPriorityCount: document.querySelector("#matrix-priority-count"),
  matrixNormalCount: document.querySelector("#matrix-normal-count"),
  clearCompletedBtn: document.querySelector("#clear-completed-btn"),

  // Blocks
  blockStart: document.querySelector("#block-start"),
  blockDuration: document.querySelector("#block-duration"),
  blockTitle: document.querySelector("#block-title"),
  blockTaskLink: document.querySelector("#block-task-link"),
  blockAddBtn: document.querySelector("#add-block-btn"),
  blockList: document.querySelector("#block-list"),
  blockMeta: document.querySelector("#block-meta"),
  blockSummary: document.querySelector("#block-summary"),
  // New Flow 2 elements (vertical layout)
  blockTasksHorizontal: document.querySelector("#block-tasks-horizontal"),
  blockNoTasks: document.querySelector("#block-no-tasks"),
  blockEmptySchedule: document.querySelector("#block-empty-schedule"),
  // Color Picker
  blockColorPicker: document.querySelector("#block-color-picker"),
  blockColorTrigger: document.querySelector("#block-color-trigger"),
  blockColorPopup: document.querySelector("#block-color-popup"),
  blockColorPreview: document.querySelector("#block-color-preview"),
  // Gantt Chart
  ganttTimeAxis: document.querySelector("#gantt-time-axis"),
  ganttBlocks: document.querySelector("#gantt-blocks"),
  ganttNowLine: document.querySelector("#gantt-now-line"),

  // Timer - Work Selection
  timerSelectWork: document.querySelector("#timer-select-work"),
  timerWorkOptions: document.querySelector("#timer-work-options"),
  timerNoWork: document.querySelector("#timer-no-work"),

  // Stats
  sessionList: document.querySelector("#session-list"),
  statToday: document.querySelector("#stat-today"),
  statMinutes: document.querySelector("#stat-minutes"),
  statStreak: document.querySelector("#stat-streak"),
  goalRing: document.querySelector("#goal-ring"),
  goalProgress: document.querySelector("#goal-progress"),
  goalRemaining: document.querySelector("#goal-remaining"),
  weekChart: document.querySelector("#week-chart"),
  weekTotal: document.querySelector("#week-total"),

  // Settings
  goalInput: document.querySelector("#goal-input"),
  focusInput: document.querySelector("#focus-minutes"),
  breakInput: document.querySelector("#break-minutes"),
  autoToggle: document.querySelector("#auto-toggle"),
  soundToggle: document.querySelector("#sound-toggle"),
  notifyToggle: document.querySelector("#notify-toggle"),
  notifyStatus: document.querySelector("#notify-status"),
  applyBtn: document.querySelector("#apply-settings-btn"),

  // Modal elements
  completionModal: document.querySelector("#completion-modal"),
  modalTitle: document.querySelector("#modal-title"),
  modalMessage: document.querySelector("#modal-message"),
  modalBlockSection: document.querySelector("#modal-block-section"),
  modalBlockName: document.querySelector("#modal-block-name"),
  modalTaskSection: document.querySelector("#modal-task-section"),
  modalTaskName: document.querySelector("#modal-task-name"),
  modalMarkDone: document.querySelector("#modal-mark-done"),
  modalNextSection: document.querySelector("#modal-next-section"),
  modalNextBlock: document.querySelector("#modal-next-block"),
  modalNextBlockName: document.querySelector("#modal-next-block-name"),
  modalStartNextBlock: document.querySelector("#modal-start-next-block"),
  modalNextTask: document.querySelector("#modal-next-task"),
  modalNextTaskName: document.querySelector("#modal-next-task-name"),
  modalStartNextTask: document.querySelector("#modal-start-next-task"),
  modalNoNext: document.querySelector("#modal-no-next"),
  modalTakeBreak: document.querySelector("#modal-take-break"),
  modalClose: document.querySelector("#modal-close"),
};

let settings = { ...defaultSettings };
let tasks = [];
let sessions = [];
let blocks = [];
let timerId = null;
let isRunning = false;
let audioContext = null;
let mode = "focus";
let remainingSeconds = defaultSettings.focusMinutes * 60;
let currentFocusMinutes = defaultSettings.focusMinutes;
let dashboardNextTask = null;
let dashboardNextBlock = null;
let activeBlockId = null;
let activeTaskId = null;
let currentView = "dashboard";
let selectedBlockColor = "green"; // Default color
let lastAction = null;

// ================== CUSTOM MODAL SYSTEM ==================
function showCustomPrompt(title, defaultValue = "") {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-prompt-modal");
    const titleEl = document.getElementById("custom-prompt-title");
    const input = document.getElementById("custom-prompt-input");
    const okBtn = document.getElementById("custom-prompt-ok");
    const cancelBtn = document.getElementById("custom-prompt-cancel");
    const backdrop = modal.querySelector(".custom-modal__backdrop");

    titleEl.textContent = title;
    input.value = defaultValue;
    modal.hidden = false;
    setTimeout(() => { input.focus(); input.select(); }, 50);

    function cleanup(value) {
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      backdrop.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeydown);
      resolve(value);
    }
    function onOk() { cleanup(input.value); }
    function onCancel() { cleanup(null); }
    function onKeydown(e) {
      if (e.key === "Enter") { e.preventDefault(); onOk(); }
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    backdrop.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeydown);
  });
}

function showCustomConfirm(title, message = "") {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-confirm-modal");
    const titleEl = document.getElementById("custom-confirm-title");
    const msgEl = document.getElementById("custom-confirm-message");
    const okBtn = document.getElementById("custom-confirm-ok");
    const cancelBtn = document.getElementById("custom-confirm-cancel");
    const backdrop = modal.querySelector(".custom-modal__backdrop");

    titleEl.textContent = title;
    msgEl.textContent = message;
    msgEl.hidden = !message;
    modal.hidden = false;
    okBtn.focus();

    function cleanup(value) {
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      backdrop.removeEventListener("click", onCancel);
      document.removeEventListener("keydown", onKeydown);
      resolve(value);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onKeydown(e) {
      if (e.key === "Enter") { e.preventDefault(); onOk(); }
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    backdrop.addEventListener("click", onCancel);
    document.addEventListener("keydown", onKeydown);
  });
}

// ================== UNDO SYSTEM ==================
function pushUndoAction(type, data, description) {
  lastAction = { type, data, description, timestamp: Date.now() };
}

function performUndo() {
  if (!lastAction) {
    showToast("Không có thao tác để hoàn tác.", "info");
    return;
  }
  const action = lastAction;
  lastAction = null;

  switch (action.type) {
    case "delete_task": {
      tasks.unshift(action.data.task);
      saveTasks();
      renderMatrix();
      showToast("Đã hoàn tác xóa task.", "success");
      break;
    }
    case "complete_task": {
      tasks = tasks.map((t) => t.id === action.data.taskId ? { ...t, done: false } : t);
      saveTasks();
      renderMatrix();
      showToast("Đã hoàn tác hoàn thành task.", "success");
      break;
    }
    case "delete_block": {
      blocks.unshift(action.data.block);
      saveBlocks();
      renderBlocks();
      showToast("Đã hoàn tác xóa block.", "success");
      break;
    }
    case "clear_completed": {
      tasks = tasks.concat(action.data.tasks);
      saveTasks();
      renderMatrix();
      showToast(`Đã hoàn tác xóa ${action.data.tasks.length} task.`, "success");
      break;
    }
    default:
      showToast("Không thể hoàn tác thao tác này.", "warning");
  }
  updateNavBadges();
}

function showUndoToast(message, type = "info", duration = 5000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast toast--${type} toast--undo`;

  const iconEl = document.createElement("span");
  iconEl.className = "toast__icon";
  iconEl.textContent = icons[type] || icons.info;

  const msgEl = document.createElement("span");
  msgEl.className = "toast__message";
  msgEl.textContent = message;

  const undoBtn = document.createElement("button");
  undoBtn.className = "toast__undo-btn";
  undoBtn.textContent = "Hoàn tác";
  undoBtn.addEventListener("click", () => {
    performUndo();
    dismissToast(toast);
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast__close";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", () => dismissToast(toast));

  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  toast.appendChild(undoBtn);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
}

// ================== NAVIGATION ==================
function navigateTo(viewName) {
  const previousView = currentView;
  currentView = viewName;

  // Update nav items
  els.navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewName);
  });

  // Animated view transitions
  els.views.forEach((view) => {
    const viewId = view.id.replace("view-", "");
    if (viewId === previousView && previousView !== viewName) {
      // Outgoing view: add exit animation
      view.classList.add("is-exiting");
      view.classList.remove("is-active");
      setTimeout(() => { view.classList.remove("is-exiting"); }, 200);
    } else if (viewId === viewName) {
      // Incoming view
      view.classList.add("is-active");
    } else {
      view.classList.remove("is-active");
    }
  });

  // Refresh content khi vào view
  if (viewName === "dashboard") {
    updateDashboard();
    renderDashboardRecentSessions();
  } else if (viewName === "tasks") {
    renderMatrix();
  } else if (viewName === "timer") {
    updateDisplay();
    updateTimerContext();
    renderTimerWorkOptions();
  } else if (viewName === "blocks") {
    renderBlocks();
    updateBlockTaskSelect();
  } else if (viewName === "stats") {
    refreshInsights();
  } else if (viewName === "settings") {
    initSettingsUI();
  }
}

function updateNavBadges() {
  // Task count: số task chưa done
  const pendingTasks = tasks.filter((t) => !t.done).length;
  els.navTasksCount.textContent = String(pendingTasks);
  els.navTasksCount.hidden = pendingTasks === 0;

  // Block count: số block pending hoặc in_progress
  const activeBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress").length;
  els.navBlocksCount.textContent = String(activeBlocks);
  els.navBlocksCount.hidden = activeBlocks === 0;

  // Goal ring mini
  const goal = settings.dailyGoal;
  const focusToday = getTodayFocusSessions();
  const completed = focusToday.length;
  const progress = goal > 0 ? Math.min(completed / goal, 1) : 0;
  const degrees = `${progress * 360}deg`;

  els.navGoalRing.style.setProperty("--progress", degrees);
  els.navGoalText.textContent = `${completed}/${goal}`;
}

function updateTimerContext() {
  if (activeTaskId) {
    const task = tasks.find((t) => t.id === activeTaskId);
    if (task) {
      els.timerContext.hidden = false;
      els.timerContextTask.textContent = task.text;
      return;
    }
  }
  if (activeBlockId) {
    const block = blocks.find((b) => b.id === activeBlockId);
    if (block) {
      els.timerContext.hidden = false;
      els.timerContextTask.textContent = block.title;
      return;
    }
  }
  els.timerContext.hidden = true;
  els.timerContextTask.textContent = "";
}

function renderDashboardRecentSessions() {
  els.dashboardRecentSessions.innerHTML = "";
  if (sessions.length === 0) {
    const empty = document.createElement("li");
    empty.className = "recent-item muted";
    empty.textContent = "Chưa có phiên nào.";
    els.dashboardRecentSessions.appendChild(empty);
    return;
  }

  sessions.slice(0, 5).forEach((session) => {
    const item = document.createElement("li");
    item.className = "recent-item";

    const time = new Date(session.completedAt);
    const timeLabel = time.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const icon = session.type === "focus" ? "🎯" : "☕";
    const typeLabel = session.type === "focus" ? "focus" : "nghỉ";
    const contextText = session.contextLabel ? ` · ${session.contextLabel}` : "";

    item.innerHTML = `
      <span class="recent-icon">${icon}</span>
      <span class="recent-time">${timeLabel}</span>
      <span class="recent-label">${session.durationMinutes}p ${typeLabel}${contextText}</span>
    `;

    els.dashboardRecentSessions.appendChild(item);
  });
}

// ================== FLOW PROGRESS ==================
function updateFlowProgress() {
  const hasTasks = tasks.filter((t) => !t.done).length > 0;
  const hasBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress").length > 0;

  // Cập nhật nav flow items (số bước trong sidebar)
  // Thứ tự mới: Step 1 = Priority Task, Step 2 = Time Block, Step 3 = Deep Work
  els.navFlowItems.forEach((item) => {
    const step = parseInt(item.dataset.step);
    item.classList.remove("is-done");

    if (step === 1 && hasTasks) {
      item.classList.add("is-done");
    } else if (step === 2 && hasBlocks) {
      item.classList.add("is-done");
    }
  });

  // Cập nhật next step hints trong các view
  updateNextStepHints(hasTasks, hasBlocks);
}

function updateNextStepHints(hasTasks, hasBlocks) {
  // Hint trong view Tasks (Flow 1) - hiện khi đã có tasks
  if (els.tasksNextHint) {
    els.tasksNextHint.hidden = !hasTasks;
  }

  // Hint trong view Blocks (Flow 2) - hiện khi đã có blocks
  if (els.blocksNextHint) {
    els.blocksNextHint.hidden = !hasBlocks;
  }
}

// ================== FLOW LINKING ==================

// Cập nhật dropdown chọn task khi tạo block
function updateBlockTaskSelect() {
  if (!els.blockTaskLink) return;

  const pendingTasks = tasks.filter((t) => !t.done);
  els.blockTaskLink.innerHTML = '<option value="">— Gắn với task (tùy chọn) —</option>';

  pendingTasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = `${task.text} (${task.estimateMinutes}p)`;
    els.blockTaskLink.appendChild(option);
  });
}

// Render danh sách task trong Flow 2 (Time Block) - Horizontal layout
function renderBlockTaskList() {
  if (!els.blockTasksHorizontal) return;

  // Lọc task chưa hoàn thành và chưa được lên lịch
  const scheduledTaskIds = blocks
    .filter((b) => b.status === "pending" || b.status === "in_progress")
    .map((b) => b.linkedTaskId)
    .filter(Boolean);

  const pendingTasks = tasks.filter((t) => !t.done && !scheduledTaskIds.includes(t.id));

  // Sort: priority tasks first (Q1, Q2), then others (Q3, Q4)
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    // Important tasks first
    if (a.important !== b.important) return a.important ? -1 : 1;
    // Then urgent tasks
    if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
    // Then by creation time
    return a.createdAt - b.createdAt;
  });

  // Render tasks as horizontal chips
  els.blockTasksHorizontal.innerHTML = "";
  sortedTasks.forEach((task) => {
    els.blockTasksHorizontal.appendChild(createBlockTaskChip(task));
  });

  // Show/hide empty state
  if (els.blockNoTasks) {
    els.blockNoTasks.hidden = pendingTasks.length > 0;
  }
}

// Tạo chip task cho horizontal layout
function createBlockTaskChip(task) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "block-task-chip";
  chip.dataset.taskId = task.id;

  // Add priority class
  const quadrant = getQuadrant(task);
  if (quadrant === "do") chip.classList.add("block-task-chip--do");
  else if (quadrant === "schedule") chip.classList.add("block-task-chip--schedule");

  // Quadrant indicator
  const quadrantIcons = {
    do: "🔥",
    schedule: "📅",
    delegate: "👥",
    eliminate: "📝"
  };

  // Truncate text if too long
  const maxLength = 25;
  const displayText = task.text.length > maxLength
    ? task.text.substring(0, maxLength) + "..."
    : task.text;

  const iconSpan = document.createElement("span");
  iconSpan.className = "block-task-chip__icon";
  iconSpan.textContent = quadrantIcons[quadrant];

  const textSpan = document.createElement("span");
  textSpan.className = "block-task-chip__text";
  textSpan.textContent = displayText;

  const timeSpan = document.createElement("span");
  timeSpan.className = "block-task-chip__time";
  timeSpan.textContent = `${task.estimateMinutes || 30}p`;

  const addSpan = document.createElement("span");
  addSpan.className = "block-task-chip__add";
  addSpan.textContent = "+ Lên lịch";

  chip.appendChild(iconSpan);
  chip.appendChild(textSpan);
  chip.appendChild(timeSpan);
  chip.appendChild(addSpan);

  chip.addEventListener("click", () => scheduleTaskFromFlow2(task));

  return chip;
}


// Lên lịch task từ Flow 2
function scheduleTaskFromFlow2(task) {
  // Lấy giờ hiện tại hoặc giờ cuối cùng của block + 10p
  const suggestedTime = getNextAvailableTime();

  // Điền vào form
  els.blockStart.value = suggestedTime;
  els.blockDuration.value = task.estimateMinutes || settings.focusMinutes;
  els.blockTitle.value = task.text;
  if (els.blockTaskLink) els.blockTaskLink.value = task.id;

  // Auto-select màu dựa trên quadrant
  const quadrant = getQuadrant(task);
  if (quadrant === "do") selectedBlockColor = "red";
  else if (quadrant === "schedule") selectedBlockColor = "blue";
  else if (quadrant === "delegate") selectedBlockColor = "orange";
  else selectedBlockColor = "stone";

  updateColorPickerUI();

  // Focus vào time input để user có thể chỉnh
  els.blockStart.focus();
  els.blockStart.select();
}

function getNextAvailableTime() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (blocks.length > 0) {
    const pendingBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress");
    if (pendingBlocks.length > 0) {
      const lastBlock = [...pendingBlocks].sort(
        (a, b) => (timeToMinutes(b.startTime) + b.duration) - (timeToMinutes(a.startTime) + a.duration)
      )[0];

      const lastEndMinutes = timeToMinutes(lastBlock.startTime) + lastBlock.duration;
      return minutesToTime(Math.max(lastEndMinutes + 5, Math.ceil(currentMinutes / 5) * 5));
    }
  }

  // Round lên 5 phút gần nhất
  return minutesToTime(Math.ceil(currentMinutes / 5) * 5);
}

// Color mapping cho preview (HEX colors)
const COLOR_HEX_MAP = {
  green: "#22c55e", emerald: "#10b981", teal: "#14b8a6", cyan: "#06b6d4",
  blue: "#3b82f6", indigo: "#6366f1", purple: "#a855f7", violet: "#8b5cf6",
  pink: "#ec4899", rose: "#f43f5e", red: "#ef4444", orange: "#f97316",
  amber: "#f59e0b", yellow: "#eab308", lime: "#84cc16", brown: "#a16207",
  stone: "#78716c", slate: "#64748b", zinc: "#71717a", neutral: "#737373"
};

// Cập nhật UI color picker
function updateColorPickerUI() {
  if (els.blockColorPicker) {
    els.blockColorPicker.querySelectorAll(".block-color-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.color === selectedBlockColor);
    });
  }
  // Update preview
  if (els.blockColorPreview) {
    els.blockColorPreview.style.background = COLOR_HEX_MAP[selectedBlockColor] || "#22c55e";
  }
}

// Toggle color popup
function toggleColorPopup() {
  if (els.blockColorPopup) {
    els.blockColorPopup.hidden = !els.blockColorPopup.hidden;
  }
}

// Close color popup
function closeColorPopup() {
  if (els.blockColorPopup) {
    els.blockColorPopup.hidden = true;
  }
}

// Render các lựa chọn công việc trong Deep Work Flow
function renderTimerWorkOptions() {
  if (!els.timerWorkOptions) return;

  els.timerWorkOptions.innerHTML = "";

  // Lấy blocks pending và in_progress
  const activeBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress");
  // Lấy tasks chưa done
  const pendingTasks = tasks.filter((t) => !t.done);

  // Kiểm tra nếu không có gì
  if (activeBlocks.length === 0 && pendingTasks.length === 0) {
    els.timerNoWork.hidden = false;
    if (els.timerWorkOptions) els.timerWorkOptions.classList.add("is-empty");
    return;
  }

  els.timerNoWork.hidden = true;
  if (els.timerWorkOptions) els.timerWorkOptions.classList.remove("is-empty");

  // Render blocks trước (ưu tiên theo thời gian)
  const sortedBlocks = [...activeBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  sortedBlocks.forEach((block) => {
    const btn = createWorkOption({
      type: "block",
      id: block.id,
      icon: "📐",
      title: block.title,
      meta: `${block.startTime} · ${block.duration} phút`,
      linkedTask: block.linkedTaskId ? tasks.find((t) => t.id === block.linkedTaskId) : null,
      isSelected: activeBlockId === block.id,
    });
    els.timerWorkOptions.appendChild(btn);
  });

  // Thêm separator nếu có cả block và task
  if (sortedBlocks.length > 0 && pendingTasks.length > 0) {
    const separator = document.createElement("div");
    separator.className = "timer-work-separator";
    separator.innerHTML = '<span>hoặc chọn task</span>';
    els.timerWorkOptions.appendChild(separator);
  }

  // Render tasks (ưu tiên Do > Schedule > Delegate > Eliminate)
  const tasksByQuadrant = {
    do: pendingTasks.filter((t) => getQuadrant(t) === "do"),
    schedule: pendingTasks.filter((t) => getQuadrant(t) === "schedule"),
    delegate: pendingTasks.filter((t) => getQuadrant(t) === "delegate"),
    eliminate: pendingTasks.filter((t) => getQuadrant(t) === "eliminate"),
  };

  ["do", "schedule", "delegate", "eliminate"].forEach((quadrant) => {
    tasksByQuadrant[quadrant].forEach((task) => {
      // Bỏ qua task đã được gắn vào block đang active
      const linkedBlock = blocks.find((b) => b.linkedTaskId === task.id && (b.status === "pending" || b.status === "in_progress"));
      if (linkedBlock) return;

      const btn = createWorkOption({
        type: "task",
        id: task.id,
        icon: quadrant === "do" ? "🔥" : "⚡",
        title: task.text,
        meta: `${task.estimateMinutes} phút · ${QUADRANT_LABELS[quadrant]}`,
        isSelected: activeTaskId === task.id,
      });
      els.timerWorkOptions.appendChild(btn);
    });
  });
}

function createWorkOption({ type, id, icon, title, meta, linkedTask, isSelected }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `timer-work-option ${isSelected ? "is-selected" : ""}`;
  btn.dataset.type = type;
  btn.dataset.id = id;

  const iconEl = document.createElement("span");
  iconEl.className = "timer-work-option__icon";
  iconEl.textContent = icon;

  const infoDiv = document.createElement("div");
  infoDiv.className = "timer-work-option__info";

  const titleDiv = document.createElement("div");
  titleDiv.className = "timer-work-option__title";
  titleDiv.textContent = title;
  infoDiv.appendChild(titleDiv);

  const metaDiv = document.createElement("div");
  metaDiv.className = "timer-work-option__meta";
  metaDiv.textContent = meta;
  if (linkedTask) {
    const linkedSpan = document.createElement("span");
    linkedSpan.className = "timer-work-option__linked";
    linkedSpan.textContent = `→ ${linkedTask.text}`;
    metaDiv.appendChild(linkedSpan);
  }
  infoDiv.appendChild(metaDiv);

  const badge = document.createElement("span");
  badge.className = type === "block"
    ? "timer-work-option__badge timer-work-option__badge--block"
    : "timer-work-option__badge";
  badge.textContent = type === "block" ? "Block" : "Task";

  btn.appendChild(iconEl);
  btn.appendChild(infoDiv);
  btn.appendChild(badge);

  btn.addEventListener("click", () => selectWorkForTimer(type, id));

  return btn;
}

function selectWorkForTimer(type, id) {
  if (type === "block") {
    const block = blocks.find((b) => b.id === id);
    if (block) {
      startBlock(block);
    }
  } else if (type === "task") {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      startFocusForTask(task);
    }
  }

  // Re-render để cập nhật selection
  renderTimerWorkOptions();
}

function isBlockUpcoming(block) {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const blockStart = timeToMinutes(block.startTime);
  const blockEnd = blockStart + block.duration;

  // Block được coi là sắp tới nếu trong vòng 30 phút hoặc đang trong thời gian
  return blockStart <= minutesNow + 30 && minutesNow < blockEnd;
}

function migrateFromAuth() {
  const raw = localStorage.getItem(LEGACY_AUTH_KEY);
  if (!raw) return;
  try {
    const legacy = JSON.parse(raw);
    if (!legacy?.id) return;
    const suffix = `_${legacy.id}`;
    [SETTINGS_KEY, TASKS_KEY, SESSIONS_KEY, STATE_KEY, BLOCKS_KEY].forEach((key) => {
      const scopedKey = `${key}${suffix}`;
      if (!localStorage.getItem(key) && localStorage.getItem(scopedKey)) {
        localStorage.setItem(key, localStorage.getItem(scopedKey));
      }
    });
    localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch (error) {
    localStorage.removeItem(LEGACY_AUTH_KEY);
  }
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...defaultSettings };
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (error) {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (typeof SyncModule !== "undefined") SyncModule.queueSync();
}

function normalizeTask(task) {
  const important = task.important ?? task.priority === "high";
  const urgent = task.urgent ?? false;
  const estimate = Number(task.estimateMinutes) || settings.focusMinutes;
  return {
    ...task,
    important: Boolean(important),
    urgent: Boolean(urgent),
    estimateMinutes: clamp(estimate, 10, 240),
    done: Boolean(task.done),
    notes: task.notes ?? "",
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
  };
}

function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((task) => normalizeTask(task));
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  if (typeof SyncModule !== "undefined") SyncModule.queueSync();
}

function loadSessions() {
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((session) => ({
      ...session,
      type: session.type || "focus",
    }));
  } catch (error) {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  if (typeof SyncModule !== "undefined") SyncModule.queueSync();
}

function loadBlocks() {
  const raw = localStorage.getItem(BLOCKS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function clearOldBlocks() {
  const todayKey = formatDateKey(new Date());
  const oldCount = blocks.length;

  blocks = blocks.filter((block) => {
    // Giữ lại block nếu được tạo hôm nay
    const blockDate = formatDateKey(new Date(block.createdAt));
    return blockDate === todayKey;
  });

  // Chỉ save nếu có thay đổi
  if (blocks.length !== oldCount) {
    saveBlocks();
    console.log(`[FocusFlow] Đã xóa ${oldCount - blocks.length} block từ ngày trước.`);
  }
}

function saveBlocks() {
  localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
  if (typeof SyncModule !== "undefined") SyncModule.queueSync();
}

function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function saveState() {
  localStorage.setItem(
    STATE_KEY,
    JSON.stringify({
      mode,
      remainingSeconds,
      focusMinutesOverride: currentFocusMinutes,
      activeBlockId,
      activeTaskId,
    })
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay() {
  const label = mode === "focus" ? "Phiên tập trung" : "Phiên nghỉ";
  const chip = mode === "focus" ? `Focus ${currentFocusMinutes}p` : `Break ${settings.breakMinutes}p`;
  if (els.modeLabel) els.modeLabel.textContent = label;
  if (els.modeChip) els.modeChip.textContent = chip;
  if (els.timerDisplay) els.timerDisplay.textContent = formatTime(remainingSeconds);
  if (els.startBtn) els.startBtn.textContent = isRunning ? "Tạm dừng" : "Bắt đầu";
  updateTimerContext();
  updateProgressRing();
}

function updateProgressRing() {
  if (!els.timerRingProgress) return;

  const totalSeconds = getDurationForMode(mode);
  const progress = 1 - (remainingSeconds / totalSeconds);
  const circumference = 2 * Math.PI * 45; // r = 45
  const offset = circumference * (1 - progress);

  els.timerRingProgress.style.strokeDashoffset = offset;

  // Change color based on mode
  if (mode === "focus") {
    els.timerRingProgress.style.stroke = "var(--accent-2)";
  } else {
    els.timerRingProgress.style.stroke = "var(--accent)";
  }
}

const originalTitle = "FocusFlow — Ứng dụng tập trung";

let _saveStateTimer = null;

function debouncedSaveState() {
  if (_saveStateTimer) return;
  _saveStateTimer = setTimeout(() => {
    saveState();
    _saveStateTimer = null;
  }, 5000);
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds <= 0) {
    handleSessionComplete();
  }
  updateDisplay();
  updateTabTitle();
  debouncedSaveState();
}

function updateTabTitle() {
  if (isRunning) {
    const timeStr = formatTime(remainingSeconds);
    const modeLabel = mode === "focus" ? "🎯" : "☕";
    document.title = `${timeStr} ${modeLabel} FocusFlow`;
  } else {
    document.title = originalTitle;
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerId = window.setInterval(tick, 1000);
  updateDisplay();
  updateFocusMode();
}

function pauseTimer() {
  isRunning = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  // Flush debounced save
  if (_saveStateTimer) { clearTimeout(_saveStateTimer); _saveStateTimer = null; }
  updateDisplay();
  updateTabTitle();
  saveState();
  updateFocusMode();
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = getDurationForMode(mode);
  updateDisplay();
  saveState();
  updateFocusMode();
}

function switchMode() {
  mode = mode === "focus" ? "break" : "focus";
  remainingSeconds = getDurationForMode(mode);
  updateDisplay();
  saveState();
}

function getDurationForMode(targetMode) {
  return (targetMode === "focus" ? currentFocusMinutes : settings.breakMinutes) * 60;
}

function handleSessionComplete() {
  const completedMode = mode;
  const duration = completedMode === "focus" ? currentFocusMinutes : settings.breakMinutes;

  // Check sessions before recording to detect goal achievement
  const sessionsBeforeCount = completedMode === "focus" ? getTodayFocusSessions().length : 0;

  // Lưu tạm activeBlockId/TaskId trước khi reset (để modal dùng)
  const completedBlockId = activeBlockId;
  const completedTaskId = activeTaskId;

  recordSession(completedMode, duration);

  // Check if daily goal was just achieved
  if (completedMode === "focus" && settings.soundOn) {
    const sessionsAfterCount = getTodayFocusSessions().length;
    if (sessionsBeforeCount < settings.dailyGoal && sessionsAfterCount >= settings.dailyGoal) {
      playSoundAchievement();
    }
  }

  // Khi hoàn thành phiên focus, cập nhật trạng thái block
  if (completedMode === "focus") {
    if (completedBlockId) {
      blocks = blocks.map((b) =>
        b.id === completedBlockId ? { ...b, status: "completed" } : b
      );
      saveBlocks();
      renderBlocks();
    }
    // Reset timer về mặc định (nhưng giữ activeBlockId/TaskId cho modal)
    currentFocusMinutes = settings.focusMinutes;
  }

  // Hiện modal TRƯỚC khi reset active context
  announceSessionComplete(completedMode);

  // === Module Hook: Post-session reflection ===
  if (completedMode === "focus") {
    const lastSession = sessions[0];
    if (lastSession && typeof ReflectionModule !== "undefined" && ReflectionModule.showPrompt) {
      try { ReflectionModule.showPrompt(lastSession.id, lastSession.type); } catch (e) { console.warn("[Modules] Reflection error:", e); }
    }
  }

  // Reset active context SAU khi modal đã lấy thông tin
  if (completedMode === "focus") {
    activeBlockId = null;
    activeTaskId = null;
    saveState();
  }

  switchMode();
  if (!settings.autoAdvance) {
    pauseTimer();
  }
}

function recordSession(type, durationMinutes) {
  // Lấy context từ task/block đang active (còn giữ trước khi reset)
  let contextLabel = null;
  let taskIdForSession = activeTaskId;
  let blockIdForSession = activeBlockId;

  if (taskIdForSession) {
    const task = tasks.find((t) => t.id === taskIdForSession);
    if (task) contextLabel = task.text;
  } else if (blockIdForSession) {
    const block = blocks.find((b) => b.id === blockIdForSession);
    if (block) contextLabel = block.title;
  }

  const sessionId = crypto.randomUUID();

  sessions.unshift({
    id: sessionId,
    durationMinutes,
    completedAt: Date.now(),
    type,
    taskId: taskIdForSession,
    blockId: blockIdForSession,
    contextLabel: contextLabel,
  });
  sessions = sessions.slice(0, 30);
  saveSessions();
  renderSessions();
  refreshInsights();

  // === Module Hooks: Streak + Achievement ===
  if (type === "focus") {
    // Update streak
    if (typeof StreakModule !== "undefined" && StreakModule.recordActivity) {
      try { StreakModule.recordActivity(); } catch (e) { console.warn("[Modules] Streak error:", e); }
    }
    // Check achievements
    if (typeof AchievementModule !== "undefined" && AchievementModule.checkSession) {
      try { AchievementModule.checkSession(type, durationMinutes); } catch (e) { console.warn("[Modules] Achievement error:", e); }
    }
  }
}

function getQuadrant(task) {
  if (task.important && task.urgent) return "do";
  if (task.important && !task.urgent) return "schedule";
  if (!task.important && task.urgent) return "delegate";
  return "eliminate";
}

function renderMatrix() {
  // Phân loại theo ma trận Eisenhower
  const buckets = {
    do: [],       // Quan trọng + Khẩn cấp
    schedule: [], // Quan trọng + Không khẩn cấp
    delegate: [], // Không quan trọng + Khẩn cấp
    eliminate: [] // Không quan trọng + Không khẩn cấp
  };

  tasks.forEach((task) => {
    buckets[getQuadrant(task)].push(task);
  });

  // Sort: chưa done trước, sau đó theo thời gian tạo
  const sortTasks = (arr) => arr.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.createdAt - b.createdAt;
  });

  // Render từng quadrant
  renderTaskList(els.matrixDo, sortTasks(buckets.do), "do");
  renderTaskList(els.matrixSchedule, sortTasks(buckets.schedule), "schedule");
  renderTaskList(els.matrixDelegate, sortTasks(buckets.delegate), "delegate");
  renderTaskList(els.matrixEliminate, sortTasks(buckets.eliminate), "eliminate");

  // Setup drag & drop cho các quadrant
  setupQuadrantDragDrop();
  setupTouchDragDrop();

  updateTaskMeta();
  updateDashboard();
  updateNavBadges();
}

// ================== DRAG & DROP ==================
let draggedTask = null;

function handleDragStart(e) {
  const taskId = e.target.dataset.taskId;
  draggedTask = tasks.find((t) => t.id === taskId);

  e.target.classList.add("is-dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", taskId);
}

function handleDragEnd(e) {
  e.target.classList.remove("is-dragging");
  draggedTask = null;

  // Remove drag-over class from all quadrants
  document.querySelectorAll(".matrix-quadrant").forEach((q) => {
    q.classList.remove("drag-over");
  });
}

function setupQuadrantDragDrop() {
  const quadrants = [
    { el: document.querySelector(".matrix-quadrant--do"), important: true, urgent: true },
    { el: document.querySelector(".matrix-quadrant--schedule"), important: true, urgent: false },
    { el: document.querySelector(".matrix-quadrant--delegate"), important: false, urgent: true },
    { el: document.querySelector(".matrix-quadrant--eliminate"), important: false, urgent: false },
  ];

  quadrants.forEach(({ el, important, urgent }) => {
    if (!el) return;

    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      el.classList.add("drag-over");
    });

    el.addEventListener("dragleave", (e) => {
      // Only remove if leaving the quadrant (not entering child)
      if (!el.contains(e.relatedTarget)) {
        el.classList.remove("drag-over");
      }
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      el.classList.remove("drag-over");

      const taskId = e.dataTransfer.getData("text/plain");
      if (!taskId) return;

      // Update task properties
      moveTaskToQuadrant(taskId, important, urgent);
    });
  });
}

// ================== TOUCH DRAG-AND-DROP ==================
let touchDragState = null;

function setupTouchDragDrop() {
  const quadrants = [
    { el: document.querySelector(".matrix-quadrant--do"), important: true, urgent: true },
    { el: document.querySelector(".matrix-quadrant--schedule"), important: true, urgent: false },
    { el: document.querySelector(".matrix-quadrant--delegate"), important: false, urgent: true },
    { el: document.querySelector(".matrix-quadrant--eliminate"), important: false, urgent: false },
  ];

  // Add touch listeners to task items
  document.querySelectorAll(".task-item[draggable]").forEach((item) => {
    item.addEventListener("touchstart", handleTouchStart, { passive: false });
    item.addEventListener("touchmove", handleTouchMove, { passive: false });
    item.addEventListener("touchend", handleTouchEnd);
  });

  function handleTouchStart(e) {
    const touch = e.touches[0];
    const taskId = e.currentTarget.dataset.taskId;
    if (!taskId) return;

    touchDragState = {
      taskId,
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false,
      ghost: null,
      element: e.currentTarget,
    };
  }

  function handleTouchMove(e) {
    if (!touchDragState) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchDragState.startX);
    const dy = Math.abs(touch.clientY - touchDragState.startY);

    // Require minimum drag distance to activate
    if (!touchDragState.moved && dx + dy > 15) {
      touchDragState.moved = true;
      touchDragState.element.classList.add("is-dragging");

      // Create ghost
      const ghost = touchDragState.element.cloneNode(true);
      ghost.className = "task-item drag-ghost";
      ghost.style.width = `${touchDragState.element.offsetWidth}px`;
      document.body.appendChild(ghost);
      touchDragState.ghost = ghost;
    }

    if (touchDragState.moved) {
      e.preventDefault(); // Prevent scrolling while dragging
      if (touchDragState.ghost) {
        touchDragState.ghost.style.left = `${touch.clientX - 30}px`;
        touchDragState.ghost.style.top = `${touch.clientY - 20}px`;
      }

      // Highlight quadrant under finger
      quadrants.forEach(({ el }) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          el.classList.add("drag-over");
        } else {
          el.classList.remove("drag-over");
        }
      });
    }
  }

  function handleTouchEnd(e) {
    if (!touchDragState || !touchDragState.moved) {
      touchDragState = null;
      return;
    }

    const touch = e.changedTouches[0];

    // Find which quadrant was dropped on
    quadrants.forEach(({ el, important, urgent }) => {
      if (!el) return;
      el.classList.remove("drag-over");
      const rect = el.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        moveTaskToQuadrant(touchDragState.taskId, important, urgent);
      }
    });

    // Cleanup
    touchDragState.element.classList.remove("is-dragging");
    if (touchDragState.ghost && touchDragState.ghost.parentNode) {
      touchDragState.ghost.parentNode.removeChild(touchDragState.ghost);
    }
    touchDragState = null;
  }
}

function moveTaskToQuadrant(taskId, important, urgent) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, important, urgent };
    }
    return task;
  });

  saveTasks();
  renderMatrix();
}

function renderTaskList(container, taskList, quadrant) {
  if (!container) return;

  container.innerHTML = "";

  if (taskList.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-empty task-empty--small";

    const emptyTexts = {
      do: "Không có việc cần làm ngay",
      schedule: "Chưa có việc để lên lịch",
      delegate: "Không có việc cần ủy quyền",
      eliminate: "Trống"
    };

    empty.innerHTML = `<span class="task-empty__text">${emptyTexts[quadrant]}</span>`;
    container.appendChild(empty);
    return;
  }

  taskList.forEach((task) => {
    container.appendChild(createTaskItem(task));
  });
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.taskId = task.id;
  if (task.done) item.classList.add("is-done");

  // Drag & Drop attributes
  item.draggable = true;
  item.addEventListener("dragstart", handleDragStart);
  item.addEventListener("dragend", handleDragEnd);

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-item__checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  // Content
  const content = document.createElement("div");
  content.className = "task-item__content";

  const title = document.createElement("div");
  title.className = "task-item__title";
  title.textContent = task.text;

  const meta = document.createElement("div");
  meta.className = "task-item__meta";

  // Time - chỉ hiển thị nếu đã được set (ở Flow 2)
  if (task.estimateMinutes) {
    const time = document.createElement("span");
    time.className = "task-item__time";
    time.innerHTML = `⏱ ${task.estimateMinutes}p`;
    meta.appendChild(time);
  }

  // Badges
  if (task.important) {
    const badge = document.createElement("span");
    badge.className = "task-item__badge task-item__badge--important";
    badge.textContent = "Quan trọng";
    meta.appendChild(badge);
  }
  if (task.urgent) {
    const badge = document.createElement("span");
    badge.className = "task-item__badge task-item__badge--urgent";
    badge.textContent = "Khẩn cấp";
    meta.appendChild(badge);
  }

  // Check if linked to a block
  const linkedBlock = blocks.find((b) => b.linkedTaskId === task.id && (b.status === "pending" || b.status === "in_progress"));
  if (linkedBlock) {
    const badge = document.createElement("span");
    badge.className = "task-item__badge task-item__badge--scheduled";
    badge.textContent = `📐 ${linkedBlock.startTime}`;
    meta.appendChild(badge);
  }

  // Notes badge
  if (task.notes && task.notes.trim()) {
    const notesBadge = document.createElement("span");
    notesBadge.className = "task-item__badge task-item__badge--notes";
    notesBadge.textContent = "📝";
    notesBadge.title = "Có ghi chú";
    meta.appendChild(notesBadge);
  }

  // Subtask progress badge
  if (task.subtasks && task.subtasks.length > 0) {
    const doneSubtasks = task.subtasks.filter((s) => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const subtaskBadge = document.createElement("span");
    subtaskBadge.className = "task-item__badge task-item__badge--subtasks";
    subtaskBadge.textContent = `☑ ${doneSubtasks}/${totalSubtasks}`;
    subtaskBadge.title = `${doneSubtasks} / ${totalSubtasks} subtasks done`;
    meta.appendChild(subtaskBadge);
  }

  content.appendChild(title);
  content.appendChild(meta);

  // Actions (hidden until hover)
  const actions = document.createElement("div");
  actions.className = "task-item__actions";

  if (!task.done) {
    // Flow 1: Chỉ hiện nút Schedule (chuyển sang Flow 2)
    if (!linkedBlock) {
      const scheduleBtn = document.createElement("button");
      scheduleBtn.type = "button";
      scheduleBtn.className = "task-item__btn task-item__btn--schedule";
      scheduleBtn.innerHTML = "⏰";
      scheduleBtn.title = "Lên lịch → Time Flow";
      scheduleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prefillBlockFromTask(task);
      });
      actions.appendChild(scheduleBtn);
    }
  }

  // Notes toggle button
  const notesBtn = document.createElement("button");
  notesBtn.type = "button";
  notesBtn.className = "task-item__btn task-item__btn--notes";
  notesBtn.innerHTML = "📋";
  notesBtn.title = "Ghi chú & Subtasks";
  notesBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTaskNotes(task.id, item);
  });
  actions.appendChild(notesBtn);

  // Edit button (inline edit)
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "task-item__btn task-item__btn--edit";
  editBtn.innerHTML = "✏️";
  editBtn.title = "Sửa";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startInlineEdit(task.id, item, title);
  });
  actions.appendChild(editBtn);

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "task-item__btn task-item__btn--delete";
  deleteBtn.innerHTML = "✕";
  deleteBtn.title = "Xóa";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeTask(task.id);
  });
  actions.appendChild(deleteBtn);

  item.appendChild(checkbox);
  item.appendChild(content);
  item.appendChild(actions);

  return item;
}


function updateTaskMeta() {
  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.done).length;
  const pending = total - doneCount;

  if (total === 0) {
    els.taskMeta.textContent = "Chưa có việc nào";
  } else if (doneCount === total) {
    els.taskMeta.textContent = `🎉 Hoàn thành tất cả ${total} việc!`;
  } else {
    els.taskMeta.textContent = `${pending} việc còn lại · ${doneCount} đã xong`;
  }
}

function addTask() {
  const value = els.taskInput.value.trim();
  if (!value) {
    showToast("Vui lòng nhập nội dung việc cần làm.", "warning");
    els.taskInput.focus();
    return;
  }
  if (value.length > 200) {
    showToast("Nội dung quá dài (tối đa 200 ký tự).", "warning");
    return;
  }

  // Flow 1: Tạo task với priority và estimate mặc định
  tasks.unshift({
    id: crypto.randomUUID(),
    text: value,
    done: false,
    important: els.taskImportant.checked,
    urgent: els.taskUrgent.checked,
    estimateMinutes: settings.focusMinutes, // Mặc định = thời gian focus
    createdAt: Date.now(),
  });

  els.taskInput.value = "";
  els.taskImportant.checked = false;
  els.taskUrgent.checked = false;
  saveTasks();
  renderMatrix();
  showToast(`Đã thêm: "${value.length > 30 ? value.substring(0, 30) + "..." : value}"`, "success");
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  const wasDone = task?.done;

  tasks = tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
  saveTasks();
  renderMatrix();

  // Play sound khi hoàn thành task (chỉ khi từ chưa done → done)
  if (!wasDone && settings.soundOn) {
    playSuccessSound();
  }

  // === Module Hook: Check task achievements ===
  if (!wasDone && typeof AchievementModule !== "undefined" && AchievementModule.checkTaskCompletion) {
    try { AchievementModule.checkTaskCompletion(); } catch (e) { console.warn("[Modules] Achievement task error:", e); }
  }
}

function playSuccessSound() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Play a pleasant "ding" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.35);
}

function toggleFlag(taskId, flag) {
  tasks = tasks.map((task) => (task.id === taskId ? { ...task, [flag]: !task[flag] } : task));
  saveTasks();
  renderMatrix();
}

async function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const newText = await showCustomPrompt("Sửa nội dung task:", task.text);
  if (newText === null) return; // User cancelled
  if (newText.trim() === "") return; // Empty text

  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, text: newText.trim() } : t
  );
  saveTasks();
  renderMatrix();
}

// ================== SUBTASKS & NOTES ==================
function startInlineEdit(taskId, itemEl, titleEl) {
  if (itemEl.querySelector(".task-inline-edit")) return; // already editing

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-inline-edit";
  input.value = task.text;

  titleEl.hidden = true;
  titleEl.parentNode.insertBefore(input, titleEl.nextSibling);
  input.focus();
  input.select();

  function commit() {
    const newText = input.value.trim();
    if (newText && newText !== task.text) {
      tasks = tasks.map((t) => t.id === taskId ? { ...t, text: newText } : t);
      saveTasks();
    }
    cleanup();
  }
  function cleanup() {
    titleEl.hidden = false;
    if (input.parentNode) input.parentNode.removeChild(input);
    renderMatrix();
  }
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { e.preventDefault(); cleanup(); }
  });
}

function toggleTaskNotes(taskId, itemEl) {
  const existing = itemEl.querySelector(".task-notes-section");
  if (existing) {
    existing.remove();
    return;
  }

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const section = document.createElement("div");
  section.className = "task-notes-section";

  const textarea = document.createElement("textarea");
  textarea.className = "task-notes-textarea";
  textarea.placeholder = "Ghi chú...";
  textarea.value = task.notes || "";
  textarea.rows = 3;

  textarea.addEventListener("blur", () => {
    tasks = tasks.map((t) => t.id === taskId ? { ...t, notes: textarea.value } : t);
    saveTasks();
  });

  section.appendChild(textarea);

  // Add subtasks section
  const subtasksSection = createSubtasksSection(taskId, task);
  section.appendChild(subtasksSection);

  // Insert after content
  const content = itemEl.querySelector(".task-item__content");
  if (content) {
    content.after(section);
  } else {
    itemEl.appendChild(section);
  }

  textarea.focus();
}

function createSubtasksSection(taskId, task) {
  const section = document.createElement("div");
  section.className = "task-item__subtasks-section";

  const header = document.createElement("div");
  header.className = "task-item__subtasks-header";
  header.textContent = "Subtasks";
  section.appendChild(header);

  const list = document.createElement("ul");
  list.className = "task-item__subtasks-list";

  (task.subtasks || []).forEach((sub, index) => {
    const li = document.createElement("li");
    li.className = "subtask-item";
    if (sub.done) li.classList.add("is-done");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "subtask-item__checkbox";
    cb.checked = sub.done;
    cb.addEventListener("change", () => toggleSubtask(taskId, index));

    const label = document.createElement("span");
    label.className = "subtask-item__text";
    label.textContent = sub.text;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "subtask-item__delete";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => removeSubtask(taskId, index));

    li.appendChild(cb);
    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });

  section.appendChild(list);

  // Add new subtask input
  const addRow = document.createElement("div");
  addRow.className = "task-item__add-subtask";

  const addInput = document.createElement("input");
  addInput.type = "text";
  addInput.className = "task-item__add-subtask-input";
  addInput.placeholder = "+ Thêm subtask...";

  addInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = addInput.value.trim();
      if (!text) return;
      const t = tasks.find((t) => t.id === taskId);
      if (!t) return;
      if (!t.subtasks) t.subtasks = [];
      t.subtasks.push({ text, done: false });
      saveTasks();
      renderMatrix();
    }
  });

  addRow.appendChild(addInput);
  section.appendChild(addRow);

  return section;
}

function toggleSubtask(taskId, index) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[index]) return;
  task.subtasks[index].done = !task.subtasks[index].done;
  saveTasks();
  renderMatrix();
}

function removeSubtask(taskId, index) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return;
  task.subtasks.splice(index, 1);
  saveTasks();
  renderMatrix();
}

async function removeTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  // Confirm trước khi xóa (trừ khi task đã done)
  if (!task.done) {
    const confirmed = await showCustomConfirm(`Xóa task "${task.text}"?`);
    if (!confirmed) return;
  }

  pushUndoAction("delete_task", { task: { ...task } }, `Xóa task "${task.text}"`);
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderMatrix();
  showUndoToast(`Đã xóa: "${task.text.length > 25 ? task.text.substring(0, 25) + "..." : task.text}"`, "info");
}

async function clearCompleted() {
  const completedTasks = tasks.filter((t) => t.done);
  const completedCount = completedTasks.length;
  if (completedCount === 0) {
    showToast("Không có việc đã hoàn thành để xóa.", "info");
    return;
  }
  const confirmed = await showCustomConfirm(`Xóa ${completedCount} việc đã hoàn thành?`);
  if (!confirmed) return;
  pushUndoAction("clear_completed", { tasks: completedTasks.map((t) => ({ ...t })) }, `Xóa ${completedCount} task`);
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderMatrix();
  showUndoToast(`Đã xóa ${completedCount} việc hoàn thành.`, "success");
}

function renderSessions() {
  els.sessionList.innerHTML = "";
  if (sessions.length === 0) {
    const empty = document.createElement("li");
    empty.className = "session-item";
    empty.textContent = "Chưa có phiên nào. Bấm Bắt đầu để ghi lại phiên đầu tiên.";
    els.sessionList.appendChild(empty);
    return;
  }

  sessions.slice(0, 6).forEach((session) => {
    const item = document.createElement("li");
    item.className = "session-item";

    const time = new Date(session.completedAt);
    const timeLabel = time.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    const label = document.createElement("span");
    const contextText = session.contextLabel ? ` · ${session.contextLabel}` : "";
    label.textContent = `${timeLabel} · ${session.durationMinutes} phút (${session.type})${contextText}`;

    item.appendChild(label);
    els.sessionList.appendChild(item);
  });
}

function addBlock(linkedTaskId = null) {
  const title = els.blockTitle.value.trim() || "Phiên focus";
  if (title.length > 200) {
    showToast("Tên block quá dài (tối đa 200 ký tự).", "warning");
    return;
  }
  const durationRaw = Number(els.blockDuration.value);
  if (els.blockDuration.value && (isNaN(durationRaw) || durationRaw < 10 || durationRaw > 240)) {
    showToast("Thời lượng phải từ 10 đến 240 phút.", "warning");
    return;
  }
  const duration = clamp(durationRaw || settings.focusMinutes, 10, 240);
  const startTime = els.blockStart.value || getNextQuarterHour();

  // Lấy task link từ dropdown nếu không được truyền vào
  const taskLinkId = linkedTaskId || (els.blockTaskLink ? els.blockTaskLink.value : null) || null;

  // Nếu có task link, lấy title từ task
  let blockTitle = title;
  if (taskLinkId && title === "Phiên focus") {
    const linkedTask = tasks.find((t) => t.id === taskLinkId);
    if (linkedTask) {
      blockTitle = linkedTask.text;
    }
  }

  // Kiểm tra xung đột thời gian
  const conflict = checkBlockConflict(startTime, duration);
  if (conflict) {
    alert(`Block bị trùng với "${conflict.title}" (${conflict.startTime}–${minutesToTime(timeToMinutes(conflict.startTime) + conflict.duration)})`);
    return;
  }

  blocks.push({
    id: crypto.randomUUID(),
    title: blockTitle,
    startTime,
    duration,
    createdAt: Date.now(),
    status: "pending", // pending | in_progress | completed | missed
    linkedTaskId: taskLinkId, // Liên kết với task
    color: selectedBlockColor, // Màu của block
  });

  els.blockTitle.value = "";
  els.blockDuration.value = "";
  if (els.blockTaskLink) els.blockTaskLink.value = "";
  saveBlocks();
  renderBlocks();
  updateBlockTaskSelect();
  showToast(`Block "${blockTitle}" đã thêm lúc ${startTime}`, "success");
}

function checkBlockConflict(startTime, duration, excludeBlockId = null) {
  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + duration;

  for (const block of blocks) {
    if (excludeBlockId && block.id === excludeBlockId) continue;
    if (block.status === "completed" || block.status === "missed") continue;

    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = blockStart + block.duration;

    // Kiểm tra overlap: new block bắt đầu trước khi block cũ kết thúc VÀ kết thúc sau khi block cũ bắt đầu
    if (newStart < blockEnd && newEnd > blockStart) {
      return block;
    }
  }
  return null;
}

function renderBlocks() {
  // Cập nhật block missed (đã qua giờ mà chưa hoàn thành)
  updateMissedBlocks();

  // Render task list trong Flow 2
  renderBlockTaskList();

  // Render Gantt Chart
  renderGanttChart();

  els.blockList.innerHTML = "";

  // Xử lý empty state cho schedule
  if (blocks.length === 0) {
    if (els.blockEmptySchedule) els.blockEmptySchedule.hidden = false;
    els.blockMeta.textContent = "";
    if (els.blockSummary) els.blockSummary.textContent = "";
    updateDashboard();
    return;
  }

  if (els.blockEmptySchedule) els.blockEmptySchedule.hidden = true;

  const sorted = [...blocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  sorted.forEach((block) => {
    const item = document.createElement("li");
    item.className = "block-item";

    // Thêm class theo trạng thái
    if (block.status === "completed") item.classList.add("block-completed");
    if (block.status === "missed") item.classList.add("block-missed");
    if (block.status === "in_progress") item.classList.add("block-active");

    // Thêm class màu
    if (block.color) {
      item.classList.add(`block-item--${block.color}`);
    }

    const time = document.createElement("span");
    time.className = "block-time";
    time.textContent = `${block.startTime}–${minutesToTime(
      timeToMinutes(block.startTime) + block.duration
    )}`;

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "block-title-wrapper";

    const title = document.createElement("span");
    title.className = "block-title";
    title.textContent = block.title;
    titleWrapper.appendChild(title);

    // Status badge
    const statusBadge = document.createElement("span");
    statusBadge.className = `block-status block-status--${block.status || "pending"}`;

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const blockStart = timeToMinutes(block.startTime);
    const minutesUntil = blockStart - minutesNow;

    let statusText = "";
    if (block.status === "in_progress") {
      statusText = "Đang chạy";
    } else if (block.status === "completed") {
      statusText = "Hoàn thành";
    } else if (block.status === "missed") {
      statusText = "Bỏ lỡ";
    } else if (block.status === "pending") {
      // Hiển thị countdown cho block sắp tới
      if (minutesUntil > 0 && minutesUntil <= 60) {
        statusText = `Còn ${minutesUntil} phút`;
        statusBadge.classList.add("block-status--upcoming");
      } else if (minutesUntil <= 0 && minutesUntil > -block.duration) {
        statusText = "Đang diễn ra!";
        statusBadge.classList.add("block-status--now");
      }
    }

    statusBadge.textContent = statusText;

    if (statusText) {
      titleWrapper.appendChild(statusBadge);
    }

    const actions = document.createElement("div");
    actions.className = "block-actions";

    // Flow 2: Hiện nút focus/retry tùy trạng thái
    if (block.status === "pending") {
      const focusBtn = document.createElement("button");
      focusBtn.type = "button";
      focusBtn.className = "block-btn block-btn--focus";
      focusBtn.innerHTML = "🔥";
      focusBtn.title = "Focus → Deep Flow";
      focusBtn.addEventListener("click", () => startBlock(block));
      actions.appendChild(focusBtn);
    }

    // Nút Retry cho block missed - cho phép chạy lại
    if (block.status === "missed") {
      const retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "block-btn block-btn--retry";
      retryBtn.innerHTML = "🔄";
      retryBtn.title = "Làm lại block này";
      retryBtn.addEventListener("click", () => retryBlock(block.id));
      actions.appendChild(retryBtn);
    }

    // Edit button (chỉ cho pending blocks)
    if (block.status === "pending") {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "block-btn";
      editBtn.textContent = "Sửa";
      editBtn.addEventListener("click", () => editBlock(block.id));
      actions.appendChild(editBtn);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "block-btn";
    deleteBtn.textContent = "Xóa";
    deleteBtn.addEventListener("click", () => removeBlock(block.id));
    actions.appendChild(deleteBtn);

    // Thêm duration badge
    const durationBadge = document.createElement("span");
    durationBadge.className = "block-duration";
    durationBadge.textContent = `${block.duration} phút`;

    // Layout: time + duration trên cùng hàng, title ở giữa, actions ở dưới
    const header = document.createElement("div");
    header.className = "block-item__header";
    header.appendChild(time);
    header.appendChild(durationBadge);

    item.appendChild(header);
    item.appendChild(titleWrapper);
    item.appendChild(actions);

    els.blockList.appendChild(item);
  });

  const pendingBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress");
  const completedBlocks = blocks.filter((b) => b.status === "completed");
  const totalMinutes = pendingBlocks.reduce((sum, block) => sum + block.duration, 0);
  const completedMinutes = completedBlocks.reduce((sum, block) => sum + block.duration, 0);

  els.blockMeta.textContent = `${pendingBlocks.length} block còn lại`;
  if (els.blockSummary) {
    if (completedMinutes > 0) {
      els.blockSummary.textContent = `${totalMinutes}p còn · ${completedMinutes}p đã xong`;
    } else {
      els.blockSummary.textContent = `${totalMinutes} phút tổng`;
    }
  }
  updateDashboard();
  updateNavBadges();
}

// ================== GANTT CHART ==================
function renderGanttChart() {
  if (!els.ganttTimeAxis || !els.ganttBlocks) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Xác định range hiển thị (từ 6h sáng đến 23h)
  const startHour = 6;
  const endHour = 23;
  const totalMinutes = (endHour - startHour) * 60;

  // Render time axis
  els.ganttTimeAxis.innerHTML = "";
  for (let h = startHour; h <= endHour; h += 2) {
    const marker = document.createElement("span");
    marker.className = "gantt-time-marker";
    marker.textContent = `${String(h).padStart(2, "0")}:00`;
    els.ganttTimeAxis.appendChild(marker);
  }

  // Position now line
  const nowPos = ((currentMinutes - startHour * 60) / totalMinutes) * 100;
  if (nowPos >= 0 && nowPos <= 100) {
    els.ganttNowLine.style.left = `${nowPos}%`;
    els.ganttNowLine.style.display = "block";
  } else {
    els.ganttNowLine.style.display = "none";
  }

  // Render blocks
  els.ganttBlocks.innerHTML = "";

  const activeBlocks = blocks.filter((b) => b.status !== "missed" || timeToMinutes(b.startTime) >= startHour * 60);

  if (activeBlocks.length === 0) {
    els.ganttBlocks.innerHTML = `
      <div class="gantt-empty">
        <span class="gantt-empty__icon">📅</span>
        <span>Chưa có block. Tạo block để xem timeline.</span>
      </div>
    `;
    return;
  }

  // Sort blocks by start time
  const sortedBlocks = [...activeBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Track rows for overlapping blocks - với gap buffer để tách các block gần nhau
  const rows = [];
  const ROW_HEIGHT = 56; // Tăng height cho mỗi row
  const GAP_BUFFER = 5; // Buffer 5 phút giữa các block trên cùng row

  sortedBlocks.forEach((block) => {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = blockStart + block.duration;

    // Calculate position
    const leftPos = Math.max(0, ((blockStart - startHour * 60) / totalMinutes) * 100);
    const rightPos = Math.min(100, ((blockEnd - startHour * 60) / totalMinutes) * 100);
    const width = rightPos - leftPos;

    // Find available row - kiểm tra có overlap không (với buffer)
    let rowIndex = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] + GAP_BUFFER <= blockStart) {
        rowIndex = i;
        break;
      }
      rowIndex = i + 1;
    }
    rows[rowIndex] = blockEnd;

    // Create block element
    const blockEl = document.createElement("div");
    blockEl.className = `gantt-block gantt-block--${block.status || "pending"}`;

    // Thêm class màu
    if (block.color) {
      blockEl.classList.add(`gantt-block--${block.color}`);
    }

    // Thêm class compact nếu block quá hẹp
    if (width < 12) {
      blockEl.classList.add("gantt-block--compact");
    }

    blockEl.style.left = `${leftPos}%`;
    blockEl.style.width = `${Math.max(width, 6)}%`; // Min width 6%
    blockEl.style.top = `${rowIndex * ROW_HEIGHT + 8}px`;

    const endTime = minutesToTime(blockEnd);

    // Hiển thị khác nhau tùy vào độ rộng - dùng textContent để tránh XSS
    const titleEl = document.createElement("span");
    titleEl.className = "gantt-block__title";
    const timeEl = document.createElement("span");
    timeEl.className = "gantt-block__time";

    if (width < 8) {
      const shortTitle = block.title.length > 10 ? block.title.substring(0, 10) + "..." : block.title;
      titleEl.textContent = shortTitle;
      timeEl.textContent = block.startTime;
      blockEl.title = `${block.title}\n${block.startTime} - ${endTime}`;
    } else {
      titleEl.textContent = block.title;
      timeEl.textContent = `${block.startTime} - ${endTime}`;
    }
    blockEl.appendChild(titleEl);
    blockEl.appendChild(timeEl);

    blockEl.addEventListener("click", () => {
      if (block.status === "pending") {
        startBlock(block);
      }
    });

    els.ganttBlocks.appendChild(blockEl);
  });

  // Adjust container height based on rows
  const minHeight = Math.max(100, rows.length * ROW_HEIGHT + 24);
  els.ganttBlocks.style.minHeight = `${minHeight}px`;
}

function updateMissedBlocks() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let changed = false;

  blocks = blocks.map((block) => {
    const blockEnd = timeToMinutes(block.startTime) + block.duration;

    // Block pending đã qua giờ kết thúc → missed
    if (block.status === "pending" && minutesNow > blockEnd) {
      changed = true;
      return { ...block, status: "missed" };
    }

    // Block in_progress nhưng timer không chạy và đã qua giờ → missed
    // (trường hợp user đóng app giữa chừng)
    if (block.status === "in_progress" && !isRunning && minutesNow > blockEnd) {
      // Nếu đây không phải block đang active → missed
      if (block.id !== activeBlockId) {
        changed = true;
        return { ...block, status: "missed" };
      }
    }

    return block;
  });

  if (changed) {
    saveBlocks();
  }
}

async function retryBlock(blockId) {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return;

  // Reset block về pending và cập nhật thời gian bắt đầu
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const newStartTime = minutesToTime(Math.ceil(currentMinutes / 5) * 5);

  blocks = blocks.map((b) =>
    b.id === blockId ? { ...b, status: "pending", startTime: newStartTime } : b
  );
  saveBlocks();
  renderBlocks();

  // Optionally start the block immediately
  const confirmed = await showCustomConfirm(`Block "${block.title}" đã được đặt lại lúc ${newStartTime}. Bắt đầu ngay?`);
  if (confirmed) {
    const updatedBlock = blocks.find((b) => b.id === blockId);
    if (updatedBlock) startBlock(updatedBlock);
  }
}

async function editBlock(blockId) {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return;

  const newTitle = await showCustomPrompt("Sửa tiêu đề block:", block.title);
  if (newTitle === null) return;
  if (newTitle.trim() === "") return;

  const newDuration = await showCustomPrompt("Thời lượng (phút):", String(block.duration));
  if (newDuration === null) return;
  const parsedDuration = parseInt(newDuration, 10);
  if (isNaN(parsedDuration) || parsedDuration < 10 || parsedDuration > 240) {
    showToast("Thời lượng phải từ 10 đến 240 phút", "warning");
    return;
  }

  blocks = blocks.map((b) =>
    b.id === blockId ? { ...b, title: newTitle.trim(), duration: parsedDuration } : b
  );
  saveBlocks();
  renderBlocks();
}

async function removeBlock(blockId) {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return;

  // Confirm trước khi xóa (trừ khi block đã completed hoặc missed)
  if (block.status === "pending" || block.status === "in_progress") {
    const confirmed = await showCustomConfirm(`Xóa block "${block.title}"?`);
    if (!confirmed) return;
  }

  pushUndoAction("delete_block", { block: { ...block } }, `Xóa block "${block.title}"`);
  blocks = blocks.filter((b) => b.id !== blockId);
  saveBlocks();
  renderBlocks();
  showUndoToast(`Đã xóa block "${block.title}".`, "info");
}

function prefillBlockFromTask(task) {
  els.blockTitle.value = task.text;
  els.blockDuration.value = task.estimateMinutes;
  if (!els.blockStart.value) {
    els.blockStart.value = getNextQuarterHour();
  }
  // Set dropdown để liên kết task
  if (els.blockTaskLink) {
    els.blockTaskLink.value = task.id;
  }
  scrollToBlocks();
}

function startBlock(block) {
  pauseTimer();
  mode = "focus";
  currentFocusMinutes = block.duration;
  remainingSeconds = block.duration * 60;

  // Reset block cũ đang in_progress về pending (nếu có và khác block mới)
  // Và đánh dấu block mới đang chạy
  activeBlockId = block.id;
  activeTaskId = block.linkedTaskId || null;
  blocks = blocks.map((b) => {
    if (b.id === block.id) {
      return { ...b, status: "in_progress" };
    }
    // Reset block cũ đang in_progress về pending
    if (b.status === "in_progress" && b.id !== block.id) {
      return { ...b, status: "pending" };
    }
    return b;
  });
  saveBlocks();
  renderBlocks();

  updateDisplay();
  saveState();
  startTimer();
  scrollToTimer();
}

function startFocusForTask(task) {
  pauseTimer();
  mode = "focus";
  currentFocusMinutes = task.estimateMinutes;
  remainingSeconds = task.estimateMinutes * 60;

  // Đánh dấu task đang làm
  activeTaskId = task.id;
  activeBlockId = null;

  updateDisplay();
  saveState();
  startTimer();
  scrollToTimer();
}

function scrollToTimer() {
  navigateTo("timer");
}

function scrollToBlocks() {
  navigateTo("blocks");
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getNextQuarterHour() {
  const now = new Date();
  const minutes = now.getMinutes();
  const next = Math.ceil((minutes + 1) / 15) * 15;
  const nextDate = new Date(now);
  nextDate.setMinutes(next, 0, 0);
  return minutesToTime(nextDate.getHours() * 60 + nextDate.getMinutes());
}

function refreshInsights() {
  renderStats();
  renderGoal();
  renderWeeklyChart();
  updateNavBadges();
  updateDashboard();
}

function getTodayFocusSessions() {
  const todayKey = formatDateKey(new Date());
  return sessions.filter((session) => session.type === "focus" && sessionKey(session) === todayKey);
}

function renderStats() {
  const focusSessions = getTodayFocusSessions();
  const minutesToday = focusSessions.reduce((sum, session) => sum + session.durationMinutes, 0);

  els.statToday.textContent = String(focusSessions.length);
  els.statMinutes.textContent = String(minutesToday);
  els.statStreak.textContent = String(calculateStreak());
}

function renderGoal() {
  const goal = settings.dailyGoal;
  const focusToday = getTodayFocusSessions();
  const completed = focusToday.length;
  const progress = goal > 0 ? Math.min(completed / goal, 1) : 0;
  const degrees = `${progress * 360}deg`;

  els.goalProgress.textContent = `${completed}/${goal}`;
  els.goalRing.style.setProperty("--progress", degrees);
  els.goalRemaining.textContent =
    completed >= goal ? "Đã đạt mục tiêu hôm nay." : `Còn ${goal - completed} phiên để đạt mục tiêu.`;
}

function scrollToView(viewName) {
  navigateTo(viewName);
}

function renderWeeklyChart() {
  const data = getWeekData();
  const maxMinutes = Math.max(30, ...data.map((day) => day.minutes));
  els.weekChart.innerHTML = "";

  data.forEach((day) => {
    const bar = document.createElement("div");
    bar.className = "week-bar";
    bar.title = `${day.minutes} phút`;

    const fill = document.createElement("div");
    fill.className = "week-bar__fill";
    if (day.minutes === 0) {
      fill.classList.add("is-zero");
    }

    const height = Math.max(10, Math.round((day.minutes / maxMinutes) * 100));
    fill.style.setProperty("--bar-height", `${height}%`);

    const label = document.createElement("span");
    label.className = "week-bar__label";
    label.textContent = day.label;

    bar.appendChild(fill);
    bar.appendChild(label);
    els.weekChart.appendChild(bar);
  });

  const totalMinutes = data.reduce((sum, day) => sum + day.minutes, 0);
  els.weekTotal.textContent = `Tổng 7 ngày: ${totalMinutes} phút focus.`;
}

function getWeekData() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = formatDateKey(date);
    const minutes = sessions
      .filter((session) => session.type === "focus" && sessionKey(session) === key)
      .reduce((sum, session) => sum + session.durationMinutes, 0);
    const label = date.toLocaleDateString("vi-VN", { weekday: "short" });
    days.push({ label, minutes });
  }
  return days;
}

function sessionKey(session) {
  return formatDateKey(new Date(session.completedAt));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateStreak() {
  const daysWithSessions = new Set(
    sessions.filter((session) => session.type === "focus").map((session) => sessionKey(session))
  );
  let streak = 0;
  const current = new Date();

  while (true) {
    const key = formatDateKey(current);
    if (!daysWithSessions.has(key)) break;
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function updateDashboard() {
  const nextTask = pickNextTask();
  dashboardNextTask = nextTask;
  if (nextTask) {
    const quadrant = QUADRANT_LABELS[getQuadrant(nextTask)] || "";
    els.dashboardNextTask.textContent = nextTask.text;
    els.dashboardNextTaskMeta.textContent = `Ước tính ${nextTask.estimateMinutes}p · ${quadrant}`;
    els.dashboardStartTask.disabled = false;
  } else {
    els.dashboardNextTask.textContent = "Chưa có việc.";
    els.dashboardNextTaskMeta.textContent = "Thêm việc để bắt đầu.";
    els.dashboardStartTask.disabled = true;
  }

  const nextBlock = pickNextBlock();
  dashboardNextBlock = nextBlock;
  if (nextBlock) {
    const end = minutesToTime(timeToMinutes(nextBlock.startTime) + nextBlock.duration);
    els.dashboardNextBlock.textContent = `${nextBlock.startTime}–${end}`;
    els.dashboardNextBlockMeta.textContent = nextBlock.title;
    els.dashboardStartBlock.disabled = false;
  } else {
    els.dashboardNextBlock.textContent = "Chưa có block.";
    els.dashboardNextBlockMeta.textContent = "Tạo block để giữ nhịp.";
    els.dashboardStartBlock.disabled = true;
  }

  const focusToday = getTodayFocusSessions();
  const minutesToday = focusToday.reduce((sum, session) => sum + session.durationMinutes, 0);
  const goal = settings.dailyGoal;
  const progress = goal > 0 ? Math.min(Math.round((focusToday.length / goal) * 100), 100) : 0;

  els.dashboardSessions.textContent = String(focusToday.length);
  els.dashboardMinutes.textContent = String(minutesToday);
  els.dashboardGoal.textContent = `${progress}%`;

  // Cập nhật flow progress (trong sidebar và hints)
  updateFlowProgress();
}

function pickNextTask() {
  const activeTasks = tasks.filter((task) => !task.done);
  if (activeTasks.length === 0) return null;

  const buckets = {
    do: [],
    schedule: [],
    delegate: [],
    eliminate: [],
  };

  activeTasks.forEach((task) => {
    buckets[getQuadrant(task)].push(task);
  });

  // Ưu tiên theo thứ tự quadrant: Do > Schedule > Delegate > Eliminate
  // Trong mỗi quadrant: task cũ nhất (createdAt nhỏ nhất) được ưu tiên
  const order = ["do", "schedule", "delegate", "eliminate"];
  for (const key of order) {
    if (buckets[key].length > 0) {
      return buckets[key].sort((a, b) => a.createdAt - b.createdAt)[0];
    }
  }

  return null;
}

function pickNextBlock() {
  // Chỉ lấy block pending hoặc in_progress
  const activeBlocks = blocks.filter((b) => b.status === "pending" || b.status === "in_progress");
  if (activeBlocks.length === 0) return null;

  const sorted = [...activeBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  // Ưu tiên block đang chạy
  const running = sorted.find((b) => b.status === "in_progress");
  if (running) return running;

  // Sau đó block sắp tới
  return sorted.find((block) => timeToMinutes(block.startTime) >= minutesNow) || sorted[0];
}

function applySettings() {
  const focusValue = Number(els.focusInput.value);
  const breakValue = Number(els.breakInput.value);
  const goalValue = Number(els.goalInput.value);
  const nextFocus = clamp(focusValue || settings.focusMinutes, 10, 90);

  settings.focusMinutes = nextFocus;
  settings.breakMinutes = clamp(breakValue || settings.breakMinutes, 3, 30);
  settings.dailyGoal = clamp(goalValue || settings.dailyGoal, 1, 12);
  settings.autoAdvance = els.autoToggle.checked;
  saveSettings();

  if (!(isRunning && mode === "focus")) {
    currentFocusMinutes = nextFocus;
    if (mode === "focus") {
      remainingSeconds = currentFocusMinutes * 60;
    }
  }

  updatePresetActive(nextFocus);
  updateDisplay();
  saveState();
  refreshInsights();
}

function applyGoal() {
  const goalValue = Number(els.goalInput.value);
  settings.dailyGoal = clamp(goalValue || settings.dailyGoal, 1, 12);
  saveSettings();
  refreshInsights();
}

function updatePresetActive(value) {
  els.presetButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.focusPreset) === value);
  });
}

function applyFocusPreset(value) {
  settings.focusMinutes = value;
  saveSettings();
  els.focusInput.value = value;
  updatePresetActive(value);
  if (!(isRunning && mode === "focus")) {
    currentFocusMinutes = value;
    if (mode === "focus") {
      remainingSeconds = value * 60;
    }
  }
  updateDisplay();
  saveState();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setTodayLabel() {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const label = formatter.format(new Date());
  if (els.todayDate) {
    els.todayDate.textContent = label;
  }

  // Cập nhật lời chào theo thời gian
  updateGreeting();
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greetingEl = document.querySelector("#view-dashboard .view-header h2");
  const descEl = document.querySelector("#view-dashboard .view-desc");

  if (!greetingEl || !descEl) return;

  let greeting, desc;
  if (hour >= 5 && hour < 12) {
    greeting = "Chào buổi sáng ☀️";
    desc = "Năng lượng tràn đầy, sẵn sàng chinh phục!";
  } else if (hour >= 12 && hour < 14) {
    greeting = "Buổi trưa rồi 🌤️";
    desc = "Nghỉ ngơi một chút rồi tiếp tục nhé!";
  } else if (hour >= 14 && hour < 18) {
    greeting = "Buổi chiều năng suất 🔥";
    desc = "Đây là lúc để hoàn thành công việc quan trọng.";
  } else if (hour >= 18 && hour < 22) {
    greeting = "Buổi tối yên tĩnh 🌙";
    desc = "Thời điểm tuyệt vời để tập trung sâu.";
  } else {
    greeting = "Đêm khuya rồi 🌌";
    desc = "Nghỉ ngơi cũng là một phần của hiệu suất!";
  }

  greetingEl.textContent = greeting;
  descEl.textContent = desc;
}

function initSettingsUI() {
  els.focusInput.value = settings.focusMinutes;
  els.breakInput.value = settings.breakMinutes;
  els.autoToggle.checked = settings.autoAdvance;
  els.soundToggle.checked = settings.soundOn;
  els.notifyToggle.checked = settings.notifyOn;
  els.goalInput.value = settings.dailyGoal;
  updatePresetActive(settings.focusMinutes);
  refreshNotificationStatus();
}

// ================== TOAST NOTIFICATION SYSTEM ==================
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const iconEl = document.createElement("span");
  iconEl.className = "toast__icon";
  iconEl.textContent = icons[type] || icons.info;

  const msgEl = document.createElement("span");
  msgEl.className = "toast__message";
  msgEl.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast__close";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", () => dismissToast(toast));

  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.add("is-leaving");
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 300);
}

// ================== DATA EXPORT/IMPORT ==================
function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settings,
    tasks: tasks,
    sessions: sessions,
    blocks: blocks,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `focusflow-backup-${formatDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast("Đã xuất dữ liệu thành công!", "success");
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.version || !data.tasks || !data.sessions) {
        showToast("File không hợp lệ. Vui lòng chọn file backup FocusFlow.", "error");
        return;
      }

      if (data.settings) {
        settings = { ...settings, ...data.settings };
        saveSettings();
      }
      if (data.tasks) {
        tasks = data.tasks;
        saveTasks();
      }
      if (data.sessions) {
        sessions = data.sessions;
        saveSessions();
      }
      if (data.blocks) {
        blocks = data.blocks;
        saveBlocks();
      }

      // Re-render everything
      initSettingsUI();
      updateDisplay();
      renderMatrix();
      renderBlocks();
      renderSessions();
      refreshInsights();
      updateNavBadges();

      showToast("Nhập dữ liệu thành công! Đã khôi phục tất cả.", "success");
    } catch (err) {
      showToast("Lỗi đọc file. Đảm bảo file là JSON hợp lệ.", "error");
    }
  };
  reader.readAsText(file);
}

function prepareAudio() {
  if (!settings.soundOn) return;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBeep() {
  if (!settings.soundOn || !audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.35);
}

function announceSessionComplete(completedMode) {
  playBeep();

  // Hiển thị modal khi hoàn thành phiên focus
  if (completedMode === "focus") {
    showCompletionModal();
  }

  if (!settings.notifyOn) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const title = completedMode === "focus" ? "Xong phiên focus" : "Xong phiên nghỉ";
  const body =
    completedMode === "focus"
      ? `Đến giờ nghỉ ${settings.breakMinutes} phút.`
      : `Bắt đầu focus ${settings.focusMinutes} phút.`;
  new Notification(title, { body });
}

function showCompletionModal() {
  const currentBlock = activeBlockId ? blocks.find((b) => b.id === activeBlockId) : null;
  // Task có thể là activeTaskId hoặc linked task từ block
  let currentTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  if (!currentTask && currentBlock && currentBlock.linkedTaskId) {
    currentTask = tasks.find((t) => t.id === currentBlock.linkedTaskId);
  }
  const nextBlock = getNextBlockAfterCurrent();
  const nextTask = getNextTaskAfterCurrent();

  // Cập nhật nội dung modal
  els.modalMessage.textContent = `Bạn vừa hoàn thành ${currentFocusMinutes} phút tập trung.`;

  // Hiển thị block vừa hoàn thành
  if (currentBlock) {
    els.modalBlockSection.hidden = false;
    els.modalBlockName.textContent = `${currentBlock.title} (${currentBlock.startTime})`;
  } else {
    els.modalBlockSection.hidden = true;
  }

  // Hiển thị task đang làm nếu có (và chưa done)
  if (currentTask && !currentTask.done) {
    els.modalTaskSection.hidden = false;
    els.modalTaskName.textContent = currentTask.text;
  } else {
    els.modalTaskSection.hidden = true;
  }

  // Hiển thị block tiếp theo
  if (nextBlock) {
    els.modalNextBlock.hidden = false;
    els.modalNextBlockName.textContent = `${nextBlock.title} (${nextBlock.startTime})`;
    els.modalStartNextBlock.replaceWith(els.modalStartNextBlock.cloneNode(true));
    els.modalStartNextBlock = document.getElementById("modal-start-next-block");
    els.modalStartNextBlock.addEventListener("click", () => {
      hideCompletionModal();
      startBlock(nextBlock);
    });
  } else {
    els.modalNextBlock.hidden = true;
  }

  // Hiển thị task tiếp theo (nếu không có block tiếp theo)
  if (!nextBlock && nextTask) {
    els.modalNextTask.hidden = false;
    els.modalNextTaskName.textContent = nextTask.text;
    els.modalStartNextTask.replaceWith(els.modalStartNextTask.cloneNode(true));
    els.modalStartNextTask = document.getElementById("modal-start-next-task");
    els.modalStartNextTask.addEventListener("click", () => {
      hideCompletionModal();
      startFocusForTask(nextTask);
    });
  } else {
    els.modalNextTask.hidden = true;
  }

  // Không còn gì để làm
  if (!nextBlock && !nextTask) {
    els.modalNoNext.hidden = false;
  } else {
    els.modalNoNext.hidden = true;
  }

  // Hiện modal
  els.completionModal.hidden = false;
}

function getNextBlockAfterCurrent() {
  const pendingBlocks = blocks.filter(
    (b) => b.id !== activeBlockId && (b.status === "pending")
  );
  if (pendingBlocks.length === 0) return null;

  // Sort theo thời gian
  const sorted = [...pendingBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  // Trả về block sắp tới gần nhất
  return sorted.find((b) => timeToMinutes(b.startTime) >= minutesNow) || sorted[0];
}

function hideCompletionModal() {
  els.completionModal.hidden = true;
  // Reset timer UI
  renderTimerWorkOptions();
  updateTimerContext();
  updateNavBadges();
}

function getNextTaskAfterCurrent() {
  const activeTasks = tasks.filter((t) => !t.done && t.id !== activeTaskId);
  if (activeTasks.length === 0) return null;

  const buckets = { do: [], schedule: [], delegate: [], eliminate: [] };
  activeTasks.forEach((task) => {
    buckets[getQuadrant(task)].push(task);
  });

  const order = ["do", "schedule", "delegate", "eliminate"];
  for (const key of order) {
    if (buckets[key].length > 0) {
      return buckets[key].sort((a, b) => a.createdAt - b.createdAt)[0];
    }
  }
  return null;
}

function markCurrentTaskDone() {
  // Lấy taskId từ activeTaskId hoặc từ block's linkedTaskId
  let taskIdToMark = activeTaskId;
  if (!taskIdToMark && activeBlockId) {
    const block = blocks.find((b) => b.id === activeBlockId);
    if (block && block.linkedTaskId) {
      taskIdToMark = block.linkedTaskId;
    }
  }

  if (!taskIdToMark) return;

  tasks = tasks.map((t) => (t.id === taskIdToMark ? { ...t, done: true } : t));
  saveTasks();
  renderMatrix();
  renderBlocks();
  updateNavBadges();

  // Ẩn section task trong modal vì đã done
  els.modalTaskSection.hidden = true;
}

function handleNotifyToggle() {
  if (!("Notification" in window)) {
    els.notifyToggle.checked = false;
    settings.notifyOn = false;
    els.notifyStatus.textContent = "Trình duyệt không hỗ trợ thông báo.";
    saveSettings();
    return;
  }

  if (!els.notifyToggle.checked) {
    settings.notifyOn = false;
    els.notifyStatus.textContent = "Đã tắt thông báo.";
    saveSettings();
    return;
  }

  if (Notification.permission === "granted") {
    settings.notifyOn = true;
    els.notifyStatus.textContent = "Đã bật thông báo.";
    saveSettings();
    return;
  }

  if (Notification.permission === "denied") {
    els.notifyToggle.checked = false;
    settings.notifyOn = false;
    els.notifyStatus.textContent = "Bạn đã chặn thông báo trong trình duyệt.";
    saveSettings();
    return;
  }

  Notification.requestPermission().then((permission) => {
    settings.notifyOn = permission === "granted";
    els.notifyToggle.checked = settings.notifyOn;
    els.notifyStatus.textContent = settings.notifyOn
      ? "Đã bật thông báo."
      : "Chưa được cấp quyền thông báo.";
    saveSettings();
  });
}

function refreshNotificationStatus() {
  if (!("Notification" in window)) {
    els.notifyToggle.checked = false;
    els.notifyToggle.disabled = true;
    els.notifyStatus.textContent = "Trình duyệt không hỗ trợ thông báo.";
    settings.notifyOn = false;
    saveSettings();
    return;
  }

  if (Notification.permission !== "granted") {
    els.notifyToggle.checked = false;
    settings.notifyOn = false;
  }

  els.notifyStatus.textContent = settings.notifyOn ? "Đã bật thông báo." : "Thông báo đang tắt.";
  saveSettings();
}

// ================== THEME SYSTEM ==================
function getThemePreference() {
  return localStorage.getItem(THEME_KEY) || "auto";
}

function resolveTheme(pref) {
  if (pref === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyTheme(resolved) {
  document.documentElement.setAttribute("data-theme", resolved);
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", resolved === "dark" ? "#1a1a2e" : "#ffffff");
  }
  // Sync sidebar toggle: checked = dark
  const sidebarToggle = document.getElementById("sidebar-theme-toggle");
  if (sidebarToggle) {
    sidebarToggle.checked = resolved === "dark";
  }
}

function setTheme(pref) {
  localStorage.setItem(THEME_KEY, pref);
  const resolved = resolveTheme(pref);
  applyTheme(resolved);
  updateThemeSelectorUI(pref);
}

function toggleTheme() {
  const current = resolveTheme(getThemePreference());
  setTheme(current === "dark" ? "light" : "dark");
}

function updateThemeSelectorUI(pref) {
  const selector = document.getElementById("theme-selector");
  if (!selector) return;
  selector.querySelectorAll("[data-theme-value]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.themeValue === pref);
  });
}

function initThemeSystem() {
  // Apply saved theme
  const pref = getThemePreference();
  const resolved = resolveTheme(pref);
  applyTheme(resolved);
  updateThemeSelectorUI(pref);

  // Sidebar toggle listener
  const sidebarToggle = document.getElementById("sidebar-theme-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("change", () => {
      setTheme(sidebarToggle.checked ? "dark" : "light");
    });
  }

  // Settings page selector
  const selector = document.getElementById("theme-selector");
  if (selector) {
    selector.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme-value]");
      if (!btn) return;
      setTheme(btn.dataset.themeValue);
    });
  }

  // OS preference change
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getThemePreference() === "auto") {
      applyTheme(resolveTheme("auto"));
    }
  });
}

// ================== KEYBOARD SHORTCUTS & FOCUS MODE ==================
function showShortcutsModal() {
  const modal = document.getElementById("shortcuts-modal");
  if (modal) modal.hidden = false;
}

function hideShortcutsModal() {
  const modal = document.getElementById("shortcuts-modal");
  if (modal) modal.hidden = true;
}

function updateFocusMode() {
  document.body.classList.toggle("timer-running", isRunning);
  const dot = document.getElementById("nav-focus-dot");
  if (dot) {
    dot.classList.toggle("is-visible", isRunning);
  }
}

function playSoundAchievement() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Celebration melody: C5 E5 G5 C6
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const startTime = audioContext.currentTime;

  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime + i * 0.15);
    gain.gain.setValueAtTime(0.0001, startTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + i * 0.15 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + i * 0.15 + 0.3);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(startTime + i * 0.15);
    osc.stop(startTime + i * 0.15 + 0.35);
  });
}

// Shortcuts modal close button
(function() {
  const closeBtn = document.getElementById("shortcuts-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", hideShortcutsModal);
  const modal = document.getElementById("shortcuts-modal");
  if (modal) {
    const backdrop = modal.querySelector(".shortcuts-modal__backdrop");
    if (backdrop) backdrop.addEventListener("click", hideShortcutsModal);
  }
})();

function bootApp() {
  settings = loadSettings();
  tasks = loadTasks();
  sessions = loadSessions();
  blocks = loadBlocks();

  // Tự động xóa blocks từ ngày hôm trước
  clearOldBlocks();

  // Kiểm tra và reset block "in_progress" không hợp lệ
  validateBlockStates();

  const savedState = loadState();
  mode = savedState.mode || "focus";
  currentFocusMinutes = savedState.focusMinutesOverride || settings.focusMinutes;
  remainingSeconds = savedState.remainingSeconds || getDurationForMode(mode);
  activeBlockId = savedState.activeBlockId || null;
  activeTaskId = savedState.activeTaskId || null;

  // Nếu có activeBlockId nhưng timer không chạy, kiểm tra block đó
  if (activeBlockId && !savedState.isRunning) {
    const activeBlock = blocks.find((b) => b.id === activeBlockId);
    if (activeBlock) {
      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const blockEnd = timeToMinutes(activeBlock.startTime) + activeBlock.duration;
      // Nếu đã qua giờ, đánh dấu missed
      if (minutesNow > blockEnd) {
        blocks = blocks.map((b) =>
          b.id === activeBlockId ? { ...b, status: "missed" } : b
        );
        activeBlockId = null;
        saveBlocks();
      }
    }
  }

  setTodayLabel();
  initThemeSystem();
  initSettingsUI();
  updateDisplay();
  updateTimerContext();
  renderMatrix();
  renderBlocks();
  renderSessions();
  refreshInsights();
  updateNavBadges();
  renderDashboardRecentSessions();
  updateBlockTaskSelect();
  updateColorPickerUI();

  // Auto-refresh trạng thái mỗi phút
  startAutoRefresh();

  // === Initialize Premium Modules ===
  // Modules load via defer scripts AFTER app.js finishes.
  // We poll until they appear (max ~2 seconds).
  (function pollModules(attempts) {
    var ready = typeof StreakModule !== "undefined" && typeof SharingModule !== "undefined";
    if (ready) {
      try {
        StreakModule.renderStreakWidget();
        SharingModule.init();
      } catch (e) { console.warn("[Modules] Init error:", e); }
    } else if (attempts < 20) {
      setTimeout(function() { pollModules(attempts + 1); }, 100);
    }
  })(0);

  // === Cloud Sync: Reload data when cloud overwrites localStorage ===
  document.addEventListener("sync:updated", function() {
    console.log("[App] Cloud sync updated localStorage — reloading data");
    tasks = loadTasks();
    sessions = loadSessions();
    blocks = loadBlocks();
    settings = loadSettings();
    renderMatrix();
    renderBlocks();
    renderSessions();
    refreshInsights();
    updateNavBadges();
    renderDashboardRecentSessions();
    updateBlockTaskSelect();
    if (typeof StreakModule !== "undefined") {
      try { StreakModule.renderStreakWidget(); } catch (e) {}
    }
    if (typeof showToast === "function") {
      showToast("Du lieu da dong bo tu may chu.", "success", 2500);
    }
  });

  // Start on tasks (bước 1: Priority Task Flow - xác định việc cần làm)
  navigateTo("tasks");
}

// Kiểm tra và reset các block có trạng thái không hợp lệ
function validateBlockStates() {
  let changed = false;
  const inProgressBlocks = blocks.filter((b) => b.status === "in_progress");

  // Nếu có nhiều hơn 1 block in_progress, chỉ giữ lại 1 (mới nhất theo createdAt)
  if (inProgressBlocks.length > 1) {
    const sorted = [...inProgressBlocks].sort((a, b) => b.createdAt - a.createdAt);
    const keepBlockId = sorted[0].id;

    blocks = blocks.map((b) => {
      if (b.status === "in_progress" && b.id !== keepBlockId) {
        changed = true;
        return { ...b, status: "pending" };
      }
      return b;
    });
  }

  if (changed) {
    saveBlocks();
  }
}

// Tự động refresh trạng thái mỗi phút
let autoRefreshInterval = null;

function startAutoRefresh() {
  // Clear interval cũ nếu có
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  // Refresh mỗi 30 giây
  autoRefreshInterval = setInterval(() => {
    // Cập nhật Gantt Chart (now line)
    if (currentView === "blocks") {
      renderGanttChart();
    }

    // Cập nhật missed blocks
    const hadMissed = blocks.some((b) => b.status === "pending");
    updateMissedBlocks();
    const hasMissedNow = blocks.some((b) => b.status === "missed");

    // Nếu có block mới bị missed, re-render
    if (hadMissed && hasMissedNow) {
      if (currentView === "blocks") {
        renderBlocks();
      }
      updateNavBadges();
    }

    // Cập nhật greeting theo thời gian
    updateGreeting();
  }, 30000); // 30 giây
}

els.startBtn.addEventListener("click", () => {
  prepareAudio();
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

els.resetBtn.addEventListener("click", resetTimer);

els.skipBtn.addEventListener("click", () => {
  switchMode();
  if (!isRunning) {
    updateDisplay();
  }
});

els.applyBtn.addEventListener("click", applySettings);

els.addTaskBtn.addEventListener("click", addTask);
els.taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

els.clearCompletedBtn.addEventListener("click", clearCompleted);

els.blockAddBtn.addEventListener("click", () => {
  addBlock();
});

// Color picker popup trigger
if (els.blockColorTrigger) {
  els.blockColorTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleColorPopup();
  });
}

// Color picker - select color
if (els.blockColorPicker) {
  els.blockColorPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".block-color-btn");
    if (!btn) return;

    // Update selected color
    selectedBlockColor = btn.dataset.color;

    // Update UI and close popup
    updateColorPickerUI();
    closeColorPopup();
  });
}

// Close popup when clicking outside
document.addEventListener("click", (e) => {
  if (els.blockColorPopup && !els.blockColorPopup.hidden) {
    if (!e.target.closest(".block-color-wrapper")) {
      closeColorPopup();
    }
  }
});

// Data export/import listeners
const exportBtn = document.getElementById("export-data-btn");
const importBtn = document.getElementById("import-data-btn");
const importFileInput = document.getElementById("import-file-input");

if (exportBtn) {
  exportBtn.addEventListener("click", exportData);
}

if (importBtn && importFileInput) {
  importBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      importData(file);
      importFileInput.value = "";
    }
  });
}

els.soundToggle.addEventListener("change", () => {
  settings.soundOn = els.soundToggle.checked;
  saveSettings();
});

els.notifyToggle.addEventListener("change", handleNotifyToggle);

els.presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.focusPreset);
    if (!Number.isNaN(value)) {
      applyFocusPreset(value);
    }
  });
});

els.dashboardStartTask.addEventListener("click", () => {
  if (dashboardNextTask) {
    startFocusForTask(dashboardNextTask);
  }
});

els.dashboardStartBlock.addEventListener("click", () => {
  if (dashboardNextBlock) {
    startBlock(dashboardNextBlock);
  }
});

// Navigation event listeners
els.navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const viewName = item.dataset.view;
    if (viewName) {
      navigateTo(viewName);
      // Close mobile menu after navigation
      closeMobileMenu();
    }
  });
});

// Mobile menu toggle
function toggleMobileMenu() {
  els.navSidebar.classList.toggle("is-open");
  els.mobileMenuToggle.classList.toggle("is-active");
  const isOpen = els.navSidebar.classList.contains("is-open");
  els.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMobileMenu() {
  els.navSidebar.classList.remove("is-open");
  els.mobileMenuToggle.classList.remove("is-active");
  els.mobileMenuToggle.setAttribute("aria-expanded", "false");
}

if (els.mobileMenuToggle) {
  els.mobileMenuToggle.addEventListener("click", toggleMobileMenu);
}

// Modal event listeners
els.modalMarkDone.addEventListener("click", markCurrentTaskDone);

els.modalTakeBreak.addEventListener("click", () => {
  hideCompletionModal();
  // Break mode đã được switch tự động trong handleSessionComplete
});

els.modalClose.addEventListener("click", hideCompletionModal);

els.completionModal.querySelector(".modal__backdrop").addEventListener("click", hideCompletionModal);

// Next step hint buttons and home action cards
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.dataset.goto;
    if (target) navigateTo(target);
  });
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Không xử lý nếu đang focus vào input
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
    return;
  }

  // Space: Toggle timer (chỉ khi đang ở view timer)
  if (e.code === "Space" && currentView === "timer") {
    e.preventDefault();
    prepareAudio();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  // Escape: Đóng modal
  if (e.code === "Escape") {
    if (!els.completionModal.hidden) {
      hideCompletionModal();
    }
    if (els.blockColorPopup && !els.blockColorPopup.hidden) {
      closeColorPopup();
    }
    const shortcutsModal = document.getElementById("shortcuts-modal");
    if (shortcutsModal && !shortcutsModal.hidden) {
      hideShortcutsModal();
    }
  }

  // ? key: Show keyboard shortcuts modal
  if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
    e.preventDefault();
    const shortcutsModal = document.getElementById("shortcuts-modal");
    if (shortcutsModal && shortcutsModal.hidden) {
      showShortcutsModal();
    } else {
      hideShortcutsModal();
    }
  }

  // N key: Navigate to timer + start if not running (on dashboard)
  if (e.key === "n" || e.key === "N") {
    if (currentView === "dashboard") {
      e.preventDefault();
      navigateTo("timer");
      if (!isRunning) {
        prepareAudio();
        startTimer();
      }
    }
  }

  // Ctrl+Z: Undo
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    performUndo();
  }

  // Number keys 1-5: Navigate views (khi không focus input)
  if (e.code === "Digit1") navigateTo("dashboard");
  if (e.code === "Digit2") navigateTo("tasks");
  if (e.code === "Digit3") navigateTo("blocks");
  if (e.code === "Digit4") navigateTo("timer");
  if (e.code === "Digit5") navigateTo("stats");
});

migrateFromAuth();
bootApp();
