const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COFFEE_URL = "https://buymeacoffee.com/YOUR_USERNAME"; // <-- swap in your real link
const STORAGE_KEY = "nextclass_classes";

let classes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let countdownInterval = null;
let notifiedIds = new Set();

const el = (id) => document.getElementById(id);

function saveClasses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

function todayAbbr() {
  return DAY_ORDER[new Date().getDay()];
}

function timeStrToDate(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getTodaysClasses() {
  const today = todayAbbr();
  return classes
    .filter((c) => c.days.includes(today))
    .sort((a, b) => a.start.localeCompare(b.start));
}

function findConflicts(list) {
  const conflicts = new Set();
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (a.start < b.end && b.start < a.end) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }
  return conflicts;
}

function renderList() {
  const todays = getTodaysClasses();
  const conflicts = findConflicts(todays);
  const listEl = el("classList");
  const emptyEl = el("emptyState");
  const badge = el("conflictBadge");

  listEl.innerHTML = "";
  emptyEl.classList.toggle("hidden", classes.length !== 0);
  badge.classList.toggle("hidden", conflicts.size === 0);

  if (todays.length === 0 && classes.length > 0) {
    const li = document.createElement("li");
    li.textContent = "No classes today 🎉";
    listEl.appendChild(li);
  }

  todays.forEach((c) => {
    const li = document.createElement("li");
    const timeSpan = document.createElement("span");
    timeSpan.className = "class-time";
    timeSpan.textContent = `${c.start}–${c.end}`;
    const nameSpan = document.createElement("span");
    nameSpan.className = "class-name";
    nameSpan.textContent = c.name + (c.location ? ` · ${c.location}` : "");
    nameSpan.style.color = conflicts.has(c.id) ? "var(--danger)" : "var(--paper)";
    const removeBtn = document.createElement("button");
    removeBtn.className = "class-remove";
    removeBtn.textContent = "✕";
    removeBtn.onclick = () => {
      classes = classes.filter((x) => x.id !== c.id);
      saveClasses();
      renderList();
      updateNowCard();
    };
    li.append(timeSpan, nameSpan, removeBtn);
    listEl.appendChild(li);
  });
}

function maybeNotify(cls, msLeft) {
  if (Notification.permission !== "granted") return;
  if (notifiedIds.has(cls.id)) return;
  if (msLeft <= 0) {
    notifiedIds.add(cls.id);
    new Notification(`Leave for ${cls.name}`, {
      body: cls.location ? `Head to ${cls.location} now.` : "Class starts soon.",
      icon: "icons/icon192.png",
    });
  }
}

function updateNowCard() {
  const now = new Date();
  const todays = getTodaysClasses();
  const next = todays.find((c) => timeStrToDate(c.end) > now);
  const nowCard = el("nowCard");

  if (!next) {
    nowCard.classList.add("hidden");
    if (countdownInterval) clearInterval(countdownInterval);
    return;
  }

  nowCard.classList.remove("hidden");
  el("nowCourse").textContent = next.name;
  el("nowMeta").textContent = `${next.start}–${next.end}${next.location ? " · " + next.location : ""}`;

  const startDate = timeStrToDate(next.start);
  const leadMs = (next.leadTime || 0) * 60000;

  function tick() {
    const now2 = new Date();
    const diffMs = startDate - now2;
    const statusTag = el("statusTag");
    const countdownEl = el("countdown");
    const leaveDiff = diffMs - leadMs;

    maybeNotify(next, leaveDiff);

    if (diffMs <= 0) {
      countdownEl.textContent = "IN SESSION";
      statusTag.textContent = "IN PROGRESS";
      statusTag.classList.remove("urgent");
      return;
    }

    const totalMin = Math.floor(diffMs / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const s = Math.floor((diffMs % 60000) / 1000);
    countdownEl.textContent = h > 0 ? `${h}h ${m}m` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    if (diffMs <= leadMs) {
      statusTag.textContent = `LEAVE NOW · ${next.location || "check location"}`;
      statusTag.classList.add("urgent");
    } else {
      statusTag.textContent = "SCHEDULED";
      statusTag.classList.remove("urgent");
    }
  }

  tick();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(tick, 1000);
}

function showSheet(show) {
  el("sheetOverlay").classList.toggle("hidden", !show);
}

el("addBtn").addEventListener("click", () => {
  if (Notification.permission === "default") Notification.requestPermission();
  showSheet(true);
});
el("cancelBtn").addEventListener("click", () => showSheet(false));
el("sheetOverlay").addEventListener("click", (e) => {
  if (e.target.id === "sheetOverlay") showSheet(false);
});

el("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const days = Array.from(document.querySelectorAll("#daysRow input:checked")).map((c) => c.value);
  if (days.length === 0) {
    alert("Pick at least one day.");
    return;
  }
  classes.push({
    id: Date.now().toString(),
    name: el("courseName").value.trim(),
    location: el("location").value.trim(),
    start: el("startTime").value,
    end: el("endTime").value,
    days,
    leadTime: parseInt(el("leadTime").value, 10) || 0,
  });
  saveClasses();
  e.target.reset();
  el("leadTime").value = 10;
  showSheet(false);
  renderList();
  updateNowCard();
});

el("coffeeLink").href = COFFEE_URL;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

renderList();
updateNowCard();
