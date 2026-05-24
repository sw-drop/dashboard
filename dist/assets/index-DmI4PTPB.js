(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function r(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(t){if(t.ep)return;t.ep=!0;const n=r(t);fetch(t.href,n)}})();let k=[];const w=30,d={macos:'<svg class="h-5 w-5 text-slate-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.63.73-1.18 1.87-1.03 2.97 1.1.09 2.22-.55 2.96-1.42z"/></svg>',windows:'<svg class="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/></svg>',linux:'<svg class="h-5 w-5 text-amber-600 dark:text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>',omv:'<svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',ugos:'<svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>',pios:'<svg class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>'};document.addEventListener("DOMContentLoaded",()=>{u();const e=document.getElementById("theme-toggle");e&&e.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("color-theme","light")):(document.documentElement.classList.add("dark"),localStorage.setItem("color-theme","dark"))});const s=document.getElementById("refresh-button");s&&s.addEventListener("click",()=>{E(),u()}),setInterval(C,1e4)});async function u(){const e=document.getElementById("dashboard-grid"),s=document.getElementById("empty-state");try{const r=await fetch("/api/metrics");if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const o=await r.json();if(k=o,!o||o.length===0){e.classList.add("hidden"),s.classList.remove("hidden"),p(0,0,0),g([]);return}e.classList.remove("hidden"),s.classList.add("hidden"),M(o)}catch(r){console.error("Error fetching telemetry metrics:",r),e.innerHTML=`
      <div class="glass-card p-6 border-rose-500/20 col-span-full bg-rose-500/5 dark:bg-rose-950/10">
        <h3 class="text-rose-600 dark:text-rose-400 font-semibold text-lg flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Telemetry Gateway Unreachable
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Could not retrieve system stats from the Cloudflare endpoint. Please ensure your <code>DASHBOARD_KV</code> namespace binding is fully configured and deployment completed.</p>
        <p class="text-xs text-slate-500 telemetry-font bg-slate-100 dark:bg-slate-950/40 p-2 rounded mt-3">Error details: ${r.message}</p>
      </div>
    `,p(0,0,0),g([])}}function M(e){const s=document.getElementById("dashboard-grid");s.innerHTML="";let r=0,o=0;e.forEach(t=>{const n=h(t.lastSeen);n?r++:o++;const a=L(t,n);s.appendChild(a)}),p(e.length,r,o),g(e)}function L(e,s){const r=document.createElement("div");r.className=`glass-card p-6 flex flex-col justify-between relative overflow-hidden ${s?"":"border-rose-200 dark:border-rose-500/10 bg-rose-50/40 dark:bg-rose-950/5 shadow-xs"}`,r.id=`device-${e.hostname.toLowerCase().trim()}`;let o=d.linux;const t=e.os.toLowerCase(),n=(e.machine_type||"").toLowerCase();t.includes("macos")||t.includes("darwin")?o=d.macos:t.includes("windows")?o=d.windows:n.includes("omv")?o=d.omv:n.includes("ugos")?o=d.ugos:(n.includes("pios")||n.includes("raspbian"))&&(o=d.pios);const a=s?`<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
       </span>`:`<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Stopped Reporting
       </span>`,f=s?`Uptime: ${$(e.uptime_seconds)}`:"System status unknown";let l="";return e.disks&&e.disks.length>0?e.disks.forEach(i=>{const c=parseFloat(i.used_percent)||0;let m="bg-cyan-600 dark:bg-cyan-500";c>=90?m="bg-rose-600 dark:bg-rose-500 shadow-sm dark:shadow-[0_0_8px_rgba(239,68,68,0.5)]":c>=75&&(m="bg-amber-500");const b=v(i.available_bytes),y=v(i.size_bytes);l+=`
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-medium">
            <span class="text-slate-800 dark:text-slate-200 font-semibold">${i.mount} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 text-[10px] telemetry-font">${i.device}</span></span>
            <span class="text-slate-700 dark:text-slate-400 telemetry-font">${c}%</span>
          </div>
          <!-- Outer Progress Track -->
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
            <div class="${m} h-full rounded-full transition-all duration-500" style="width: ${c}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 telemetry-font">
            <span>${b} free</span>
            <span>of ${y}</span>
          </div>
        </div>
      `}):l='<div class="text-xs text-slate-400 dark:text-slate-500 italic py-2">No logical partitions discovered on host</div>',r.innerHTML=`
    <!-- Top Identity Section -->
    <div>
      <div class="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">${e.hostname}</h3>
          <span class="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 telemetry-font">
            ${o}
            ${e.machine_type||e.os}
          </span>
        </div>
        ${a}
      </div>

      <!-- System Uptime Indicator -->
      <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4 telemetry-font">
        ${f}
      </div>

      <!-- Disks Metric Display Container -->
      <div class="space-y-4">
        ${l}
      </div>
    </div>

    <!-- Bottom Time Stamp Footer -->
    <div class="mt-6 pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 telemetry-font">
      <span>REFRESH INT: 10M</span>
      <span class="machine-time-ping" data-timestamp="${e.lastSeen}">
        Seen: ${x(e.lastSeen)}
      </span>
    </div>
  `,r}function h(e){if(!e)return!1;const s=new Date(e);return(new Date-s)/1e3/60<w}function p(e,s,r){document.getElementById("stat-total").textContent=e,document.getElementById("stat-online").textContent=s,document.getElementById("stat-offline").textContent=r}function g(e){const s=document.getElementById("dock-links");if(s.innerHTML="",e.length===0){s.innerHTML='<span class="text-slate-400 dark:text-slate-500 py-1 px-2">Offline Gate</span>';return}e.forEach(r=>{const o=h(r.lastSeen);let t="bg-emerald-500";o||(t="bg-rose-500");const n=document.createElement("a");n.href=`#device-${r.hostname.toLowerCase().trim()}`,n.className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer",n.innerHTML=`
      <span class="h-1.5 w-1.5 rounded-full ${t}"></span>
      ${r.hostname}
    `,n.addEventListener("click",a=>{a.preventDefault();const f=`device-${r.hostname.toLowerCase().trim()}`,l=document.getElementById(f);l&&(l.scrollIntoView({behavior:"smooth",block:"center"}),l.classList.add("ring-2","ring-cyan-500/50","border-cyan-500/30"),setTimeout(()=>{l.classList.remove("ring-2","ring-cyan-500/50","border-cyan-500/30")},1500))}),s.appendChild(n)})}function C(){document.querySelectorAll(".machine-time-ping").forEach(s=>{const r=s.getAttribute("data-timestamp");if(r){s.textContent=`Seen: ${x(r)}`;const o=h(r),t=s.closest(".glass-card");!o&&t&&(t.classList.contains("border-rose-200")||u())}})}function x(e){if(!e)return"never";const s=new Date(e),o=Math.floor((new Date-s)/1e3);if(o<1)return"just now";if(o<60)return`${o}s ago`;const t=Math.floor(o/60);if(t<60)return`${t}m ago`;const n=Math.floor(t/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}function $(e){if(!e||e<=0)return"0m";const s=Math.floor(e/(3600*24)),r=Math.floor(e%(3600*24)/3600),o=Math.floor(e%3600/60);let t="";return s>0&&(t+=`${s}d `),(r>0||s>0)&&(t+=`${r}h `),t+=`${o}m`,t}function v(e){if(e===0||!e)return"0 GB";const s=1024,r=["B","KB","MB","GB","TB","PB"],o=Math.floor(Math.log(e)/Math.log(s)),t=e/Math.pow(s,o);return`${Math.round(t*10)/10} ${r[o]}`}function E(){const e=document.getElementById("refresh-icon");e&&(e.classList.add("animate-spin"),setTimeout(()=>{e.classList.remove("animate-spin")},800))}
