(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();let y=[];const O=30;let x=!1,h=new Set;try{const e=localStorage.getItem("dashboard-hidden-devices");e&&JSON.parse(e).forEach(r=>h.add(r))}catch(e){console.error("Error reading hidden devices from localStorage:",e)}let p=null;const v={macos:'<svg class="h-5 w-5 text-slate-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.63.73-1.18 1.87-1.03 2.97 1.1.09 2.22-.55 2.96-1.42z"/></svg>',windows:'<svg class="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z"/></svg>',linux:'<svg class="h-5 w-5 text-amber-600 dark:text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>',omv:'<svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',ugos:'<svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>',pios:'<svg class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>'};document.addEventListener("DOMContentLoaded",()=>{k();const e=document.getElementById("theme-toggle");e&&e.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("color-theme","light")):(document.documentElement.classList.add("dark"),localStorage.setItem("color-theme","dark"))});const r=document.getElementById("hidden-toggle");r&&r.addEventListener("click",()=>{x=!x,x?r.classList.add("border-cyan-500","bg-cyan-50/50","dark:bg-cyan-950/20","text-cyan-600","dark:text-cyan-400"):r.classList.remove("border-cyan-500","bg-cyan-50/50","dark:bg-cyan-950/20","text-cyan-600","dark:text-cyan-400"),L(y)});const t=document.getElementById("refresh-button");t&&t.addEventListener("click",()=>{A(),k()}),setInterval(H,1e4),setInterval(k,6e4)});async function k(){const e=document.getElementById("dashboard-grid"),r=document.getElementById("empty-state");try{const t=await fetch("/api/metrics");if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const n=await t.json();if(y=n,!n||n.length===0){e.classList.add("hidden"),r.classList.remove("hidden"),C(0,0,0),E([]);return}e.classList.remove("hidden"),r.classList.add("hidden"),L(n)}catch(t){console.error("Error fetching telemetry metrics:",t),e.innerHTML=`
      <div class="glass-card p-6 border-rose-500/20 col-span-full bg-rose-500/5 dark:bg-rose-950/10">
        <h3 class="text-rose-600 dark:text-rose-400 font-semibold text-lg flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Telemetry Gateway Unreachable
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Could not retrieve system stats from the Cloudflare endpoint. Please ensure your <code>DASHBOARD_KV</code> namespace binding is fully configured and deployment completed.</p>
        <p class="text-xs text-slate-500 telemetry-font bg-slate-100 dark:bg-slate-950/40 p-2 rounded mt-3">Error details: ${t.message}</p>
      </div>
    `,C(0,0,0),E([])}}function L(e){const r=document.getElementById("dashboard-grid");r.innerHTML="";let t=[];try{const o=localStorage.getItem("dashboard-device-order");o&&(t=JSON.parse(o))}catch(o){console.error("Error reading custom order:",o)}const n=e.map(o=>({machine:o,isOnline:M(o.lastSeen)}));n.sort((o,c)=>{const m=o.machine.hostname.toLowerCase().trim(),f=c.machine.hostname.toLowerCase().trim();if(t.length>0){const u=t.indexOf(m),g=t.indexOf(f);if(u!==-1&&g!==-1)return u-g;if(u!==-1)return-1;if(g!==-1)return 1}if(o.isOnline&&!c.isOnline)return-1;if(!o.isOnline&&c.isOnline)return 1;const b=w(o.machine),i=w(c.machine);return b!==i?b-i:o.machine.hostname.localeCompare(c.machine.hostname)});const s=[];let a=0,d=0;n.forEach(({machine:o,isOnline:c})=>{const m=o.hostname.toLowerCase().trim();h.has(m)?x&&s.push({machine:o,isOnline:c,isHidden:!0}):(s.push({machine:o,isOnline:c,isHidden:!1}),c?a++:d++)}),s.forEach(({machine:o,isOnline:c,isHidden:m})=>{const f=T(o,c,m);r.appendChild(f)});const l=e.length-(x?0:h.size);C(l,a,d),z(),E(s.filter(o=>!o.isHidden).map(o=>o.machine))}function T(e,r,t=!1){const n=document.createElement("div"),s=e.hostname.toLowerCase().trim();n.setAttribute("draggable",t?"false":"true");let a="glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ";t?a+="ghost-card ":r||(a+="border-rose-200 dark:border-rose-500/10 bg-rose-50/40 dark:bg-rose-950/5 shadow-xs "),n.className=a,n.id=`device-${s}`;let d=v.linux;const l=e.os.toLowerCase(),o=(e.machine_type||"").toLowerCase();l.includes("macos")||l.includes("darwin")?d=v.macos:l.includes("windows")?d=v.windows:o.includes("omv")?d=v.omv:o.includes("ugos")?d=v.ugos:(o.includes("pios")||o.includes("raspbian"))&&(d=v.pios);const c=r?`<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
       </span>`:`<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
         <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Stopped Reporting
       </span>`,m=r?`Uptime: ${D(e.uptime_seconds)}`:"System status unknown";let f="";e.disks&&e.disks.length>0?e.disks.forEach(i=>{const u=parseFloat(i.used_percent)||0;let g="bg-cyan-600 dark:bg-cyan-500";u>=90?g="bg-rose-600 dark:bg-rose-500 shadow-sm dark:shadow-[0_0_8px_rgba(239,68,68,0.5)]":u>=85&&(g="bg-amber-500");const $=S(i.available_bytes),I=S(i.size_bytes);f+=`
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-medium">
            <span class="text-slate-800 dark:text-slate-200 font-semibold">${i.mount} <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 text-[10px] telemetry-font">${i.device}</span></span>
            <span class="text-slate-700 dark:text-slate-400 telemetry-font">${u}%</span>
          </div>
          <!-- Outer Progress Track -->
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
            <div class="${g} h-full rounded-full transition-all duration-500" style="width: ${u}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 telemetry-font">
            <span>Size: ${I}</span>
            <span>${$} free</span>
          </div>
        </div>
      `}):f='<div class="text-xs text-slate-400 dark:text-slate-500 italic py-2">No logical partitions discovered on host</div>',n.innerHTML=`
    <!-- Top Identity Section -->
    <div>
      <div class="flex justify-between items-start gap-4 mb-4">
        <div class="flex items-center gap-2">
          <!-- Grab handle (only if not a ghost card) -->
          ${t?"":`
            <div class="cursor-grab hover:text-cyan-500 text-slate-400 dark:text-slate-600 drag-handle p-1 -ml-2 rounded hover:bg-slate-100 dark:hover:bg-slate-900" title="Drag to reorder">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
              </svg>
            </div>
          `}
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">${e.hostname}</h3>
            <span class="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 telemetry-font">
              ${d}
              ${e.machine_type||e.os}
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          ${c}
          <!-- Dismiss (Hide) / Restore (Unhide) Button -->
          <button class="hide-device-btn p-1 rounded-md text-slate-400 dark:text-slate-600 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer" data-hostname="${s}" title="${t?"Restore System to Dashboard":"Hide System"}">
            ${t?`
              <!-- Eye / Restore Icon -->
              <svg class="h-4 w-4 text-emerald-500 hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            `:`
              <!-- Eye-slash / Hide Icon -->
              <svg class="h-4 w-4 hover:text-rose-500 dark:hover:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            `}
          </button>
        </div>
      </div>

      <!-- System Uptime Indicator -->
      <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4 telemetry-font">
        ${m}
      </div>

      <!-- Disks Metric Display Container -->
      <div class="space-y-4">
        ${f}
      </div>
    </div>

    <!-- Bottom Time Stamp Footer -->
    <div class="mt-6 pt-3 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 telemetry-font">
      <span>REFRESH INT: 10M</span>
      <span class="machine-time-ping" data-timestamp="${e.lastSeen}">
        Seen: ${B(e.lastSeen)}
      </span>
    </div>
  `,t||(n.addEventListener("dragstart",i=>{p=s,n.classList.add("dragging"),i.dataTransfer.effectAllowed="move",i.dataTransfer.setData("text/plain",s);const u=n.querySelector(".cursor-grab");u&&(u.classList.remove("cursor-grab"),u.classList.add("cursor-grabbing"))}),n.addEventListener("dragend",()=>{n.classList.remove("dragging");const i=n.querySelector(".cursor-grabbing");i&&(i.classList.remove("cursor-grabbing"),i.classList.add("cursor-grab")),document.querySelectorAll(".glass-card").forEach(u=>u.classList.remove("drag-over"))}),n.addEventListener("dragover",i=>{i.preventDefault(),i.dataTransfer.dropEffect="move"}),n.addEventListener("dragenter",i=>{i.preventDefault(),p&&p!==s&&n.classList.add("drag-over")}),n.addEventListener("dragleave",()=>{n.classList.remove("drag-over")}),n.addEventListener("drop",i=>{i.preventDefault(),n.classList.remove("drag-over"),p&&p!==s&&V(p,s)}));const b=n.querySelector(".hide-device-btn");return b&&b.addEventListener("click",i=>{i.stopPropagation(),j(s)}),n}function M(e){if(!e)return!1;const r=new Date(e);return(new Date-r)/1e3/60<O}function C(e,r,t){document.getElementById("stat-total").textContent=e,document.getElementById("stat-online").textContent=r,document.getElementById("stat-offline").textContent=t}function E(e){const r=document.getElementById("dock-links");if(r.innerHTML="",e.length===0){r.innerHTML='<span class="text-slate-400 dark:text-slate-500 py-1 px-2">Offline Gate</span>';return}e.forEach(t=>{const n=M(t.lastSeen);let s="bg-emerald-500";n||(s="bg-rose-500");const a=document.createElement("a");a.href=`#device-${t.hostname.toLowerCase().trim()}`,a.className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition-all cursor-pointer",a.innerHTML=`
      <span class="h-1.5 w-1.5 rounded-full ${s}"></span>
      ${t.hostname}
    `,a.addEventListener("click",d=>{d.preventDefault();const l=`device-${t.hostname.toLowerCase().trim()}`,o=document.getElementById(l);o&&(o.scrollIntoView({behavior:"smooth",block:"center"}),o.classList.add("ring-2","ring-cyan-500/50","border-cyan-500/30"),setTimeout(()=>{o.classList.remove("ring-2","ring-cyan-500/50","border-cyan-500/30")},1500))}),r.appendChild(a)})}function H(){document.querySelectorAll(".machine-time-ping").forEach(r=>{const t=r.getAttribute("data-timestamp");if(t){r.textContent=`Seen: ${B(t)}`;const n=M(t),s=r.closest(".glass-card");!n&&s&&(s.classList.contains("border-rose-200")||k())}})}function B(e){if(!e)return"never";const r=new Date(e),n=Math.floor((new Date-r)/1e3);if(n<1)return"just now";if(n<60)return`${n}s ago`;const s=Math.floor(n/60);if(s<60)return`${s}m ago`;const a=Math.floor(s/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}function D(e){if(!e||e<=0)return"0m";const r=Math.floor(e/(3600*24)),t=Math.floor(e%(3600*24)/3600),n=Math.floor(e%3600/60);let s="";return r>0&&(s+=`${r}d `),(t>0||r>0)&&(s+=`${t}h `),s+=`${n}m`,s}function S(e){if(e===0||!e)return"0 GB";const r=1024,t=["B","KB","MB","GB","TB","PB"],n=Math.floor(Math.log(e)/Math.log(r)),s=e/Math.pow(r,n);return`${Math.round(s*10)/10} ${t[n]}`}function A(){const e=document.getElementById("refresh-icon");e&&(e.classList.add("animate-spin"),setTimeout(()=>{e.classList.remove("animate-spin")},800))}function w(e){const r=(e.os||"").toLowerCase(),t=(e.machine_type||"").toLowerCase();return r.includes("windows")?1:t.includes("ugos")?2:t.includes("omv")?3:r.includes("linux")||t.includes("pios")||t.includes("raspbian")||t.includes("debian")||t.includes("ubuntu")?4:r.includes("macos")||r.includes("darwin")?5:6}function V(e,r){let t=[];try{const d=localStorage.getItem("dashboard-device-order");d&&(t=JSON.parse(d))}catch{}if(t.length===0){const d=y.map(l=>({machine:l,isOnline:M(l.lastSeen)}));d.sort((l,o)=>{if(l.isOnline&&!o.isOnline)return-1;if(!l.isOnline&&o.isOnline)return 1;const c=w(l.machine),m=w(o.machine);return c!==m?c-m:l.machine.hostname.localeCompare(o.machine.hostname)}),t=d.map(l=>l.machine.hostname.toLowerCase().trim())}let n=t.indexOf(e),s=t.indexOf(r);n===-1&&(t.push(e),n=t.length-1),s===-1&&(t.push(r),s=t.length-1);const a=t[n];t[n]=t[s],t[s]=a,localStorage.setItem("dashboard-device-order",JSON.stringify(t)),L(y)}function j(e){h.has(e)?h.delete(e):h.add(e);const r=Array.from(h);localStorage.setItem("dashboard-hidden-devices",JSON.stringify(r)),L(y)}function z(){const e=document.getElementById("hidden-toggle"),r=document.getElementById("hidden-count");if(e&&r){const t=h.size;t>0?(e.classList.remove("hidden"),r.textContent=`(${t})`):(e.classList.add("hidden"),x=!1,e.classList.remove("border-cyan-500","bg-cyan-50/50","dark:bg-cyan-950/20","text-cyan-600","dark:text-cyan-400"))}}
