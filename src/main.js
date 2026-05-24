// ==============================================================================
// Dashboard Main Client Engine (Vanilla JS)
// ==============================================================================

// Global cache of system telemetry states
let systemsCache = [];
const OFFLINE_THRESHOLD_MINUTES = 30;

// Dynamic SVG Icons for Operating Systems & Hardware Types
const OS_ICONS = {
  macos: `<svg class="h-5 w-5 text-slate-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.63.73-1.18 1.87-1.03 2.97 1.1.09 2.22-.55 2.96-1.42z"/></svg>`,
  windows: `<svg class="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/></svg>`,
  linux: `<svg class="h-5 w-5 text-amber-600 dark:text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
  omv: `<svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`,
  ugos: `<svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>`,
  pios: `<svg class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>`
};

// Initialize Dashboard UI & Hook Listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchTelemetry();

  // Setup Theme Toggle Action
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("color-theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("color-theme", "dark");
      }
    });
  }

  // Bind Refresh button with spinning animation
  const refreshButton = document.getElementById("refresh-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      animateRefreshIcon();
      fetchTelemetry();
    });
  }

  // Start a clock to refresh relative timestamps every 10 seconds
  setInterval(updateAllRelativeTimes, 10000);

  // Auto-refresh telemetry data silently in the background every 60 seconds
  setInterval(fetchTelemetry, 60000);
});

// Fetch metrics from Cloudflare Pages API
async function fetchTelemetry() {
  const gridContainer = document.getElementById("dashboard-grid");
  const emptyState = document.getElementById("empty-state");

  try {
    const response = await fetch("/api/metrics");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    systemsCache = data;

    if (!data || data.length === 0) {
      gridContainer.classList.add("hidden");
      emptyState.classList.remove("hidden");
      updateQuickStats(0, 0, 0);
      populateDock([]);
      return;
    }

    gridContainer.classList.remove("hidden");
    emptyState.classList.add("hidden");

    renderDashboard(data);
  } catch (error) {
    console.error("Error fetching telemetry metrics:", error);
    
    // Display error card in dashboard if fetching fails completely
    gridContainer.innerHTML = `
      <div class="glass-card p-6 border-rose-500/20 col-span-full bg-rose-500/5 dark:bg-rose-950/10">
        <h3 class="text-rose-600 dark:text-rose-400 font-semibold text-lg flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Telemetry Gateway Unreachable
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Could not retrieve system stats from the Cloudflare endpoint. Please ensure your <code>DASHBOARD_KV</code> namespace binding is fully configured and deployment completed.</p>
        <p class="text-xs text-slate-500 telemetry-font bg-slate-100 dark:bg-slate-950/40 p-2 rounded mt-3">Error details: ${error.message}</p>
      </div>
    `;
    updateQuickStats(0, 0, 0);
    populateDock([]);
  }
}

// Render device card layouts inside dashboard
function renderDashboard(machines) {
  const gridContainer = document.getElementById("dashboard-grid");
  gridContainer.innerHTML = ""; // Clear loader skeletons

  let onlineCount = 0;
  let offlineCount = 0;

  // Pre-calculate online status to avoid duplicate calls during sorting
  const machinesWithStatus = machines.map(m => ({
    machine: m,
    isOnline: checkIsOnline(m.lastSeen)
  }));

  // Helper to determine system type priority
  const getSystemPriority = (m) => {
    const osLower = (m.os || "").toLowerCase();
    const typeLower = (m.machine_type || "").toLowerCase();
    
    if (osLower.includes("windows")) return 1;
    if (typeLower.includes("ugos")) return 2;
    if (typeLower.includes("omv")) return 3;
    if (osLower.includes("linux") || typeLower.includes("pios") || typeLower.includes("raspbian") || typeLower.includes("debian") || typeLower.includes("ubuntu")) return 4;
    if (osLower.includes("macos") || osLower.includes("darwin")) return 5;
    return 6;
  };

  // Sort:
  // 1. Online status (online first)
  // 2. System type priority (Windows > UGOS > OMV > Linux > macOS > Other)
  // 3. Alphabetical by hostname
  machinesWithStatus.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    
    const priorityA = getSystemPriority(a.machine);
    const priorityB = getSystemPriority(b.machine);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return a.machine.hostname.localeCompare(b.machine.hostname);
  });

  machinesWithStatus.forEach(({ machine, isOnline }) => {
    if (isOnline) onlineCount++; else offlineCount++;

    const card = createMachineCard(machine, isOnline);
    gridContainer.appendChild(card);
  });

  updateQuickStats(machines.length, onlineCount, offlineCount);
  populateDock(machinesWithStatus.map(m => m.machine));
}

// Construct DOM node for a single machine
function createMachineCard(machine, isOnline) {
  const card = document.createElement("div");
  card.className = `glass-card p-6 flex flex-col justify-between relative overflow-hidden ${
    !isOnline ? "border-rose-200 dark:border-rose-500/10 bg-rose-50/40 dark:bg-rose-950/5 shadow-xs" : ""
  }`;
  card.id = `device-${machine.hostname.toLowerCase().trim()}`;

  // OS & specialized type icon resolution
  let iconHtml = OS_ICONS.linux;
  const osLower = machine.os.toLowerCase();
  const subTypeLower = (machine.machine_type || "").toLowerCase();

  if (osLower.includes("macos") || osLower.includes("darwin")) {
    iconHtml = OS_ICONS.macos;
  } else if (osLower.includes("windows")) {
    iconHtml = OS_ICONS.windows;
  } else if (subTypeLower.includes("omv")) {
    iconHtml = OS_ICONS.omv;
  } else if (subTypeLower.includes("ugos")) {
    iconHtml = OS_ICONS.ugos;
  } else if (subTypeLower.includes("pios") || subTypeLower.includes("raspbian")) {
    iconHtml = OS_ICONS.pios;
  }

  // Format Status Badge
  const statusBadge = isOnline
    ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
       </span>`
    : `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Stopped Reporting
       </span>`;

  // Format System Uptime
  const uptimeText = isOnline 
    ? `Uptime: ${formatUptime(machine.uptime_seconds)}` 
    : "System status unknown";

  // Build storage metrics HTML blocks
  let disksHtml = "";
  if (machine.disks && machine.disks.length > 0) {
    machine.disks.forEach((disk) => {
      const percentage = parseFloat(disk.used_percent) || 0;
      
      // Determine bar colors based on filling capacity thresholds
      let barColor = "bg-cyan-600 dark:bg-cyan-500";
      if (percentage >= 90) {
        barColor = "bg-rose-600 dark:bg-rose-500 shadow-sm dark:shadow-[0_0_8px_rgba(239,68,68,0.5)]";
      } else if (percentage >= 75) {
        barColor = "bg-amber-500";
      }

      const freeGb = formatBytes(disk.available_bytes);
      const totalGb = formatBytes(disk.size_bytes);

      disksHtml += `
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-medium">
            <span class="text-slate-800 dark:text-slate-200 font-semibold">${disk.mount} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 text-[10px] telemetry-font">${disk.device}</span></span>
            <span class="text-slate-700 dark:text-slate-400 telemetry-font">${percentage}%</span>
          </div>
          <!-- Outer Progress Track -->
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
            <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 telemetry-font">
            <span>${freeGb} free</span>
            <span>of ${totalGb}</span>
          </div>
        </div>
      `;
    });
  } else {
    disksHtml = `<div class="text-xs text-slate-400 dark:text-slate-500 italic py-2">No logical partitions discovered on host</div>`;
  }

  card.innerHTML = `
    <!-- Top Identity Section -->
    <div>
      <div class="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">${machine.hostname}</h3>
          <span class="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 telemetry-font">
            ${iconHtml}
            ${machine.machine_type || machine.os}
          </span>
        </div>
        ${statusBadge}
      </div>

      <!-- System Uptime Indicator -->
      <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4 telemetry-font">
        ${uptimeText}
      </div>

      <!-- Disks Metric Display Container -->
      <div class="space-y-4">
        ${disksHtml}
      </div>
    </div>

    <!-- Bottom Time Stamp Footer -->
    <div class="mt-6 pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 telemetry-font">
      <span>REFRESH INT: 10M</span>
      <span class="machine-time-ping" data-timestamp="${machine.lastSeen}">
        Seen: ${getRelativeTimeString(machine.lastSeen)}
      </span>
    </div>
  `;

  return card;
}

// Check if device lastSeen is within threshold limits
function checkIsOnline(lastSeenIso) {
  if (!lastSeenIso) return false;
  const lastSeen = new Date(lastSeenIso);
  const now = new Date();
  const diffMs = now - lastSeen;
  const diffMins = diffMs / 1000 / 60;
  return diffMins < OFFLINE_THRESHOLD_MINUTES;
}

// Format summary counters in header
function updateQuickStats(total, online, offline) {
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-online").textContent = online;
  document.getElementById("stat-offline").textContent = offline;
}

// Populate the interactive floating HUD Dock dynamically with jumps
function populateDock(machines) {
  const dockContainer = document.getElementById("dock-links");
  dockContainer.innerHTML = "";

  if (machines.length === 0) {
    dockContainer.innerHTML = `<span class="text-slate-400 dark:text-slate-500 py-1 px-2">Offline Gate</span>`;
    return;
  }

  machines.forEach((machine) => {
    const isOnline = checkIsOnline(machine.lastSeen);
    
    // Status dot color in dock
    let dotColor = "bg-emerald-500";
    if (!isOnline) dotColor = "bg-rose-500";

    const link = document.createElement("a");
    link.href = `#device-${machine.hostname.toLowerCase().trim()}`;
    link.className = `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer`;
    link.innerHTML = `
      <span class="h-1.5 w-1.5 rounded-full ${dotColor}"></span>
      ${machine.hostname}
    `;

    // Click handler to smooth scroll and briefly highlight the target card
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = `device-${machine.hostname.toLowerCase().trim()}`;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Highlight flash effect
        element.classList.add("ring-2", "ring-cyan-500/50", "border-cyan-500/30");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-cyan-500/50", "border-cyan-500/30");
        }, 1500);
      }
    });

    dockContainer.appendChild(link);
  });
}

// Update relative time strings dynamically for all elements
function updateAllRelativeTimes() {
  const elements = document.querySelectorAll(".machine-time-ping");
  elements.forEach((el) => {
    const timestamp = el.getAttribute("data-timestamp");
    if (timestamp) {
      el.textContent = `Seen: ${getRelativeTimeString(timestamp)}`;
      
      // Dynamic color shift if threshold is close or exceeded
      const isOnline = checkIsOnline(timestamp);
      const parentCard = el.closest(".glass-card");
      
      // Dynamically toggle card styles if a machine status shifts while dashboard is open!
      if (!isOnline && parentCard) {
        if (!parentCard.classList.contains("border-rose-200")) {
          // Trigger a silent page repaint to flag offline
          fetchTelemetry();
        }
      }
    }
  });
}

// Convert ISO timestamp to readable relative text
function getRelativeTimeString(isoString) {
  if (!isoString) return "never";
  const date = new Date(isoString);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 1) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Convert seconds into human-readable uptime formats
function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return "0m";
  
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  let uptimeStr = "";
  if (d > 0) uptimeStr += `${d}d `;
  if (h > 0 || d > 0) uptimeStr += `${h}h `;
  uptimeStr += `${m}m`;
  return uptimeStr;
}

// Format capacity Bytes into readable Gigabytes or Terabytes
function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return "0 GB";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Storage is usually best represented in GB and TB
  // For telemetry cards, we enforce standard GB format for sizes below 1TB
  const val = bytes / Math.pow(k, i);
  
  // Round to 1 decimal place
  const formattedVal = Math.round(val * 10) / 10;
  return `${formattedVal} ${sizes[i]}`;
}

// Spin refresh icon on reload trigger
function animateRefreshIcon() {
  const icon = document.getElementById("refresh-icon");
  if (icon) {
    icon.classList.add("animate-spin");
    setTimeout(() => {
      icon.classList.remove("animate-spin");
    }, 800);
  }
}
