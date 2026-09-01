// Popup Script for Shopify Store Inspector & Diagnostics Extension

document.addEventListener("DOMContentLoaded", () => {
  const INSPECTOR_LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NkYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE2LjUgM0wyMSA3LjVMMTYuNSAxMiIvPjxwYXRoIGQ9Ik0yMSA3LjVIOUM1LjY4NjI5IDcuNSAzIDEwLjE4NjMgMyAxMy41QzMgMTYuODEzNyA1LjY4NjI5IDE5LjUgOSAxOS41SDE1Ii8+PC9zdmc+";

  // UI Elements
  const loadingState = document.getElementById("loading-state");
  const dashboard = document.getElementById("dashboard");
  const notShopifyState = document.getElementById("not-shopify-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");
  const tabStatusBadge = document.getElementById("tab-status-badge");
  const refreshBtn = document.getElementById("refresh-btn");
  const exportBtn = document.getElementById("export-btn");

  let currentDiagnostics = null;

  // Core Function to execute scan
  async function performScan() {
    currentDiagnostics = null;
    // Reset UI view states
    showState("loading");
    updateTabBadge("Scanning", "badge-grey");

    try {
      // Get the active window tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        showError("No active tab found. Please reload pages.");
        return;
      }

      // Check URL protocol (restricted on internal pages)
      const url = tab.url || "";
      if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("edge://") || url.startsWith("about:")) {
        showError("Diagnostics cannot inspect internal browser pages. Navigate to a Shopify storefront to run scan.");
        return;
      }

      // Inject dependency and detector scripts into target tab's MAIN world
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        files: [
          "utils/constants.js",
          "utils/helpers.js",
          "detectors/storeDetector.js",
          "detectors/stackDetector.js",
          "detectors/appDetector.js",
          "detectors/featureDetector.js",
          "detectors/disabledDetector.js",
          "content/content.js"
        ]
      });

      // Capture diagnostic results (content.js returns values)
      const resultObj = results[0]?.result;
      if (!resultObj) {
        showError("Active tab failed to return diagnostic data. Refresh the page and try again.");
        return;
      }

      if (resultObj.error) {
        showError(`Detector exception: ${resultObj.error}`);
        return;
      }

      if (!resultObj.isShopify) {
        showState("not-shopify");
        updateTabBadge("Non-Shopify", "badge-red");
        return;
      }

      // Render details
      renderDiagnostics(resultObj.data);
      currentDiagnostics = resultObj.data;
      showState("dashboard");
      updateTabBadge("Completed", "badge-green");

    } catch (err) {
      console.error("Extraction error:", err);
      showError(`Execution Blocked: Inability to access page state. Ensure the page is completely loaded or try permissions check. Extra: ${err.message}`);
    }
  }

  // State swappers
  function showState(state) {
    loadingState.classList.add("hidden");
    dashboard.classList.add("hidden");
    notShopifyState.classList.add("hidden");
    errorState.classList.add("hidden");
    exportBtn.classList.add("hidden");

    if (state === "loading") loadingState.classList.remove("hidden");
    else if (state === "dashboard") {
      dashboard.classList.remove("hidden");
      exportBtn.classList.remove("hidden");
    }
    else if (state === "not-shopify") notShopifyState.classList.remove("hidden");
    else if (state === "error") errorState.classList.remove("hidden");
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    showState("error");
    updateTabBadge("Error", "badge-red");
  }

  function updateTabBadge(text, className) {
    tabStatusBadge.textContent = text;
    tabStatusBadge.className = "badge " + className;
  }

  // Render variables to DOM
  function renderDiagnostics(diagnostics) {
    // 1. Store Information
    const info = diagnostics.storeInfo || {};
    document.getElementById("info-shop-name").textContent = info.shopName || "N/A";
    document.getElementById("info-page-type").textContent = info.pageType || "Unknown";
    document.getElementById("info-hostname").textContent = info.hostname || "N/A";
    document.getElementById("info-shopify-domain").textContent = info.shopifyDomain || "N/A";
    document.getElementById("info-locale").textContent = info.locale || "N/A";
    
    const country = info.country ? info.country : "";
    const currency = info.currency ? info.currency : "";
    document.getElementById("info-country-currency").textContent = [country, currency].filter(Boolean).join(" / ") || "N/A";

    document.getElementById("info-theme-name").textContent = info.themeName || "N/A";
    document.getElementById("info-theme-id").textContent = info.themeId || "N/A";
    document.getElementById("info-theme-role").textContent = info.themeRole || "N/A";
    document.getElementById("info-theme-store-id").textContent = info.themeStoreId || "N/A";

    // 2. Core Stack Architecture
    const stack = diagnostics.coreStack || {};
    renderProductStatus("checkout", stack.checkout);
    renderProductStatus("auth", stack.auth);
    renderProductStatus("cart", stack.cart);

    // 3. Disabled & Inactive Traces
    const disabled = diagnostics.disabledIntegrations || {};
    renderDisabledStatus("checkout", disabled.checkout);
    renderDisabledStatus("auth", disabled.auth);
    renderDisabledStatus("cart", disabled.cart);

    // 4. Third Party Apps
    const apps = diagnostics.thirdPartyApps || [];
    const appsContainer = document.getElementById("apps-container");
    appsContainer.innerHTML = "";
    
    if (apps.length === 0) {
      appsContainer.innerHTML = `<div class="no-apps-detected">No common third-party apps detected.</div>`;
    } else {
      apps.forEach(app => {
        const badge = document.createElement("div");
        badge.className = "app-badge";
        
        let markerClass = "marker-not-detected";
        if (app.status === "Detected") markerClass = "marker-detected";
        else if (app.status === "Possible") markerClass = "marker-possible";

        const markerDiv = document.createElement("div");
        markerDiv.className = `status-marker small-marker ${markerClass}`;
        const nameSpan = document.createElement("span");
        nameSpan.className = "app-name-label";
        nameSpan.textContent = app.name;
        const confSpan = document.createElement("span");
        confSpan.className = "app-conf";
        confSpan.textContent = `${app.confidence}%`;
        badge.appendChild(markerDiv);
        badge.appendChild(nameSpan);
        badge.appendChild(confSpan);
        
        if (app.evidence && app.evidence.length > 0) {
          badge.setAttribute("title", `Evidence:\n- ${app.evidence.join("\n- ")}`);
        }
        appsContainer.appendChild(badge);
      });
    }

    // 5. Store Features
    const features = diagnostics.storeFeatures || {};
    Object.keys(features).forEach(featureKey => {
      const featVal = features[featureKey];
      const featTag = document.getElementById(`feat-${featureKey}`);
      if (featTag) {
        const statusCircle = featTag.querySelector(".feature-status");
        
        statusCircle.className = "feature-status";
        if (featVal.status === "Detected") {
          statusCircle.classList.add("marker-detected");
          featTag.setAttribute("title", `Detected\nEvidence:\n- ${(featVal.evidence || []).join("\n- ")}`);
        } else if (featVal.status === "Possible") {
          statusCircle.classList.add("marker-possible");
          featTag.setAttribute("title", `Possible\nEvidence:\n- ${(featVal.evidence || []).join("\n- ")}`);
        } else {
          statusCircle.classList.add("marker-not-detected");
          featTag.setAttribute("title", "Not Detected");
        }
      }
    });
  }

  // Render status helper
  function renderProductStatus(prefix, data) {
    const marker = document.getElementById(`${prefix}-marker`);
    const conf = document.getElementById(`${prefix}-confidence`);
    const evidenceList = document.getElementById(`${prefix}-evidence-list`);
    const toggleBtn = document.querySelector(`.evidence-toggle[data-target="${prefix}-evidence"]`);
    const evidenceBox = document.getElementById(`${prefix}-evidence`);
    
    evidenceBox.classList.add("hidden");
    if (toggleBtn) toggleBtn.innerText = "Inspect Signals";

    if (!data) {
      marker.className = "status-marker marker-unavailable";
      conf.textContent = "-";
      evidenceList.innerHTML = "<li>No scans executed</li>";
      return;
    }

    marker.className = "status-marker";
    if (data.status === "Detected") {
      marker.classList.add("marker-detected");
    } else if (data.status === "Possible") {
      marker.classList.add("marker-possible");
    } else {
      marker.classList.add("marker-not-detected");
    }

    conf.textContent = `${data.confidence}%`;

    evidenceList.innerHTML = "";
    if (data.evidence && data.evidence.length > 0) {
      data.evidence.forEach(evi => {
        const li = document.createElement("li");
        li.textContent = evi;
        evidenceList.appendChild(li);
      });
    } else {
      evidenceList.innerHTML = "<li>No specific evidence gathered.</li>";
    }
  }

  // Render disabled helper
  function renderDisabledStatus(prefix, data) {
    const box = document.getElementById(`${prefix}-disabled-box`);
    const marker = document.getElementById(`${prefix}-disabled-marker`);
    const reason = document.getElementById(`${prefix}-disabled-reason`);

    if (!data) {
      box.style.display = "none";
      return;
    }

    box.style.display = "block";
    marker.className = "status-marker small-marker";
    
    if (data.status === "Detected") {
      marker.classList.add("marker-possible");
      reason.textContent = data.reason;
      if (data.evidence && data.evidence.length > 0) {
        reason.textContent += ` Evidence: ${data.evidence.join(", ")}`;
      }
    } else if (data.status === "Possible") {
      marker.classList.add("marker-possible");
      reason.textContent = `${data.reason} Trace: ${data.evidence.join(", ")}`;
    } else {
      marker.classList.add("marker-unavailable");
      reason.textContent = "No inactive/disabled code traces detected.";
    }
  }

  // Copy values
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-copy");
      const el = document.getElementById(targetId);
      if (el) {
        const text = el.innerText || el.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("copied");
          setTimeout(() => {
            btn.classList.remove("copied");
          }, 1500);
        } catch (e) {
          console.error("Clipboard copy failed.", e);
        }
      }
    });
  });

  // Accordions
  document.querySelectorAll(".evidence-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const box = document.getElementById(targetId);
      if (box) {
        const isHidden = box.classList.toggle("hidden");
        btn.innerText = isHidden ? "Inspect Signals" : "Hide Signals";
      }
    });
  });

  function calculateHealthScore(diagnostics) {
    if (!diagnostics) return 0;
    let score = 40; // Base Shopify Setup
    const stack = diagnostics.coreStack || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const features = diagnostics.storeFeatures || {};

    if (stack.checkout && stack.checkout.status === "Detected") score += 15;
    if (stack.auth && stack.auth.status === "Detected") score += 10;
    if (stack.cart && stack.cart.status === "Detected") score += 10;

    let tracePenalties = 0;
    ["checkout", "auth", "cart"].forEach(k => {
      const d = disabled[k];
      if (d) {
        if (d.status === "Detected") tracePenalties += 5;
      }
    });
    score -= tracePenalties;

    let totalFeat = 0, detFeat = 0;
    Object.keys(features).forEach(k => {
      totalFeat++;
      if (features[k].status === "Detected") detFeat += 1;
      else if (features[k].status === "Possible") detFeat += 0.5;
    });
    if (totalFeat > 0) {
      score += Math.round((detFeat / totalFeat) * 25);
    }
    return Math.max(0, Math.min(100, score));
  }

  function generateRecommendations(diagnostics) {
    if (!diagnostics) return [];
    const recs = [];
    const stack = diagnostics.coreStack || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const features = diagnostics.storeFeatures || {};
    const apps = diagnostics.thirdPartyApps || [];
    const info = diagnostics.storeInfo || {};

    if (info.themeRole && info.themeRole !== "main") {
      recs.push({
        title: "Theme Mode in Preview / Draft State",
        desc: `Active theme '${info.themeName}' is in '${info.themeRole}' state. Verify theme settings before publishing live.`,
        severity: "warning"
      });
    }

    let disabledCategories = [];
    ["checkout", "auth", "cart"].forEach(k => {
      const d = disabled[k];
      if (d && (d.status === "Detected" || d.status === "Possible")) {
        disabledCategories.push(k === "checkout" ? "Checkout" : k === "auth" ? "Auth" : "Cart");
      }
    });
    if (disabledCategories.length > 0) {
      recs.push({
        title: "Deactivated or Hidden Code Traces Found",
        desc: `Theme files contain script snippets or display:none tags hiding ${disabledCategories.join(", ")} components. Code cleanup is recommended.`,
        severity: "warning"
      });
    }

    if (features.cartDrawer && features.cartDrawer.status === "Not Detected") {
      recs.push({
        title: "Consider Enabling Cart Slide Drawer",
        desc: "Store relies on standard page redirects for cart view. Activating an AJAX side cart drawer often improves mobile user experience.",
        severity: "info"
      });
    }

    const builders = apps.filter(a => ["PageFly", "GemPages"].includes(a.name) && (a.status === "Detected" || a.status === "Possible"));
    if (builders.length > 1) {
      recs.push({
        title: "Audit Page Builder Script Overhead",
        desc: `Multiple page builders detected: ${builders.map(b => b.name).join(", ")}. Using multiple builders increases page loading payload.`,
        severity: "warning"
      });
    }

    if (recs.length === 0) {
      recs.push({
        title: "Storefront Diagnostics Healthy",
        desc: "No critical errors or invalid deactivation instances were observed in core storefront modules.",
        severity: "success"
      });
    }
    return recs;
  }

  function generateHtmlReport(diagnostics) {
    if (!diagnostics) return "";
    const info = diagnostics.storeInfo || {};
    const stack = diagnostics.coreStack || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const apps = diagnostics.thirdPartyApps || [];
    const features = diagnostics.storeFeatures || {};

    const healthScore = calculateHealthScore(diagnostics);
    const recs = generateRecommendations(diagnostics);

    const badge = (s) => {
      if (s === "Detected") return '<span class="badge badge-success"><span class="status-dot status-dot-success"></span>Detected</span>';
      if (s === "Possible") return '<span class="badge badge-warning"><span class="status-dot status-dot-warning"></span>Possible</span>';
      if (s === "Not Detected") return '<span class="badge badge-critical"><span class="status-dot status-dot-critical"></span>Not Detected</span>';
      return '<span class="badge badge-unknown"><span class="status-dot status-dot-unknown"></span>Unknown</span>';
    };

    const disBadge = (s) => (s === "Detected" || s === "Possible") 
      ? '<span class="badge badge-warning"><span class="status-dot status-dot-warning"></span>Trace Found</span>' 
      : '<span class="badge badge-success"><span class="status-dot status-dot-success"></span>Clean</span>';

    const progress = (c, s) => {
      let f = "progress-fill-success";
      if (s === "Not Detected") f = "progress-fill-critical";
      else if (s === "Possible") f = "progress-fill-warning";
      return `<div class="progress-bar-container"><div class="progress-track"><div class="progress-fill ${f}" style="width:${c}%"></div></div><span class="progress-text">${c}%</span></div>`;
    };

    const activeApps = apps.filter(a => a.status === "Detected" || a.status === "Possible").length;

    let recsHtml = "";
    recs.forEach(r => {
      let icon = "", cls = "rec-info";
      if (r.severity === "critical") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-svg"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        cls = "rec-critical"; 
      }
      else if (r.severity === "warning") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        cls = "rec-warning"; 
      }
      else if (r.severity === "success") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-svg"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        cls = "rec-success"; 
      }
      else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rec-svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      }
      recsHtml += `<div class="rec-item ${cls}"><span class="rec-icon">${icon}</span><div class="rec-content"><h4>${r.title}</h4><p>${r.desc}</p></div></div>`;
    });

    let stackHtml = "";
    const stackMeta = [
      { k: "checkout", name: "Checkout & Payment Engine", desc: "Monitors express payment options (Shop Pay, Apple Pay) and custom checkout integrations." },
      { k: "auth", name: "Customer Auth & Login Stack", desc: "Evaluates Shopify native customer accounts and passwordless SSO auth widgets." },
      { k: "cart", name: "Cart & Drawer Engine", desc: "Detects AJAX cart slide drawers, trigger handlers, and cart overlays." }
    ];
    stackMeta.forEach(sm => {
      const d = stack[sm.k] || { status: "Not Detected", confidence: 0, evidence: [] };
      const evi = d.evidence?.length ? d.evidence.map(e => `<li>${e}</li>`).join("") : "<li>No specific evidence gathered.</li>";
      stackHtml += `<div class="detection-card"><div class="detection-card-header"><div><h4 class="detection-name">${sm.name}</h4><p class="detection-desc">${sm.desc}</p></div>${badge(d.status)}</div><div class="card-details-grid"><div class="info-group-box"><label class="info-lbl">Confidence Level</label>${progress(d.confidence, d.status)}</div><div class="evidence-box"><div class="evidence-title">Verified Signals</div><ul class="evidence-list">${evi}</ul></div></div></div>`;
    });

    let disHtml = "";
    [
      { k: "checkout", title: "Checkout & Payment Traces" },
      { k: "auth", title: "Authentication Traces" },
      { k: "cart", title: "Cart Engine Traces" }
    ].forEach(item => {
      const d = disabled[item.k] || { status: "Not Detected", reason: "No inactive/disabled traces detected.", evidence: [] };
      const warning = d.status === "Detected" || d.status === "Possible";
      let traces = (warning && d.evidence?.length) ? `<div style="margin-top:8px;"><div class="info-lbl" style="font-size:10px;">Traces Detected:</div><div class="code-block">${d.evidence.map(e => `<code>${e.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`).join("<br/>")}</div></div>` : "";
      disHtml += `<div class="disabled-card ${warning ? 'alert' : ''}"><div class="disabled-card-header"><span class="disabled-name">${item.title}</span>${disBadge(d.status)}</div><p class="disabled-desc">${warning ? d.reason : "No deactivated script tags or CSS display:none overrides were found."}</p>${traces}</div>`;
    });

    const detApps = apps.filter(a => a.status === "Detected" || a.status === "Possible");
    let appsHtml = "";
    if (!detApps.length) {
      appsHtml = '<div class="empty-state">No common third-party application modules spotted.</div>';
    } else {
      appsHtml = '<div class="apps-summary-grid">';
      detApps.forEach(a => {
        const evi = a.evidence?.length ? `<div class="app-detail-row" style="flex-direction:column;align-items:flex-start;gap:4px;"><span class="detail-label">Signals:</span><span class="detail-val text-muted" style="font-size:11px;">${a.evidence.join(", ")}</span></div>` : "";
        appsHtml += `<div class="app-card"><div class="app-group-header"><span class="app-title">${a.name}</span>${badge(a.status)}</div><div class="app-details"><div class="app-detail-row"><span class="detail-label">Confidence:</span><span class="detail-val">${a.confidence}%</span></div>${evi}</div></div>`;
      });
      appsHtml += '</div>';
    }

    const featLabels = {
      search: "Native Search Form", predictiveSearch: "Predictive Search Dropdown", wishlist: "Wishlist Drawer / App",
      customerLogin: "Customer Account Log In", customerAccounts: "Customer Profile Space", currencySelector: "Local Currency Picker",
      languageSelector: "Storefront Language Switcher", cartDrawer: "AJAX Cart Slide-Out Drawer", quickView: "Product Modal Quick View",
      recentlyViewed: "Recently Viewed History Carousel", newsletter: "Newsletter E-mail Sign-Up Form", chatWidget: "Live Support Messaging Widget",
      reviews: "Product Review Widget Engine", productRecommendations: "Shopify Recommended Products Widget", infiniteScroll: "Infinite Product Listing Scroll"
    };

    let featHtml = '<div class="features-summary-grid">';
    Object.keys(features).forEach(k => {
      const fl = featLabels[k] || k, f = features[k];
      const ev = f.evidence?.length ? `<div style="font-size:11px;color:var(--text-sub);"><span style="font-weight:500;">Signals:</span> ${f.evidence.join(", ")}</div>` : "";
      featHtml += `<div class="feature-card-item"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span class="feature-card-name">${fl}</span>${badge(f.status)}</div>${ev}</div>`;
    });
    featHtml += '</div>';

    let scoreColor = "var(--success)";
    if (healthScore < 50) scoreColor = "var(--critical)";
    else if (healthScore < 80) scoreColor = "var(--warning)";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shopify Inspector Diagnostic Report - ${info.shopName || "Store"}</title>
  <style>
    :root {
      --primary: #6366f1; --primary-hover: #4f46e5; --bg-app: #f8fafc; --bg-card: #ffffff;
      --border-color: #e2e8f0; --text-main: #0f172a; --text-sub: #64748b;
      --success: #10b981; --success-bg: #ecfdf5; --warning: #f59e0b; --warning-bg: #fffbeb;
      --critical: #ef4444; --critical-bg: #fef2f2; --unknown: #94a3b8; --unknown-bg: #f1f5f9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: var(--bg-app); color: var(--text-main); line-height: 1.5; padding: 40px 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .actions-bar { max-width: 950px; margin: 0 auto 16px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-action { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .btn-action:hover { background-color: #f8fafc; transform: translateY(-1px); }
    .btn-primary { background-color: var(--primary); color: white; border-color: var(--primary); }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .report-container { max-width: 950px; margin: 0 auto; background: var(--bg-card); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02); padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 24px; margin-bottom: 32px; }
    .header-logo { display: flex; align-items: center; gap: 12px; }
    .logo-mark { width: 36px; height: 36px; border-radius: 8px; display: block; object-fit: contain; }
    .logo-text { font-weight: 800; font-size: 22px; color: var(--text-main); letter-spacing: -0.5px; }
    .report-meta { text-align: right; font-size: 13px; color: var(--text-sub); }
    .dashboard-hero { display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px; margin-bottom: 32px; }
    .hero-info-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; background-color: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; }
    .hero-heading { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 12px; }
    .health-gauge-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background-color: #ffffff; }
    .score-circle { width: 100px; height: 100px; border-radius: 50%; border: 8px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: ${scoreColor}; border-top-color: ${scoreColor}; border-right-color: ${scoreColor}; margin-bottom: 12px; }
    .score-circle .label { font-size: 10px; text-transform: uppercase; color: var(--text-sub); font-weight: 600; margin-top: -2px; }
    .kpis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; background: var(--bg-card); }
    .kpi-title { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-sub); margin-bottom: 8px; letter-spacing: 0.5px; }
    .kpi-value { font-size: 16px; font-weight: 700; color: var(--text-main); line-height: 1.25; }
    .kpi-sub { font-size: 11px; color: var(--text-sub); margin-top: 6px; }
    .section-title { font-size: 17px; font-weight: 600; margin: 24px 0 16px; color: var(--text-main); display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 24px; }
    .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .info-label { font-size: 13px; color: var(--text-sub); }
    .info-val { font-size: 13px; font-weight: 600; color: var(--text-main); }
    .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; line-height: 1; }
    .badge-success { background-color: var(--success-bg); color: var(--success); }
    .badge-warning { background-color: var(--warning-bg); color: var(--warning); }
    .badge-critical { background-color: var(--critical-bg); color: var(--critical); }
    .badge-unknown { background-color: var(--unknown-bg); color: var(--unknown); }
    .progress-bar-container { display: flex; align-items: center; gap: 8px; width: 100%; }
    .progress-track { flex-grow: 1; height: 8px; background-color: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .progress-fill-success { background-color: var(--success); }
    .progress-fill-warning { background-color: var(--warning); }
    .progress-fill-critical { background-color: var(--critical); }
    .progress-text { font-size: 12px; font-weight: 600; width: 32px; text-align: right; }
    .card-list { display: flex; flex-direction: column; gap: 16px; }
    .detection-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; background-color: #ffffff; }
    .detection-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .detection-name { font-weight: 700; font-size: 15px; color: var(--text-main); }
    .detection-desc { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
    .card-details-grid { display: grid; grid-template-columns: 1fr 1.55fr; gap: 24px; }
    .info-group-box { display: flex; flex-direction: column; justify-content: center; }
    .info-lbl { font-size: 11px; color: var(--text-sub); text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
    .evidence-box { background-color: #f8fafc; border-radius: 6px; padding: 14px; border: 1px solid #f1f5f9; }
    .evidence-title { font-weight: 600; color: var(--text-main); margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
    .evidence-list { list-style-type: none; }
    .evidence-list li { position: relative; padding-left: 14px; margin-bottom: 4px; color: #475569; font-size: 12px; }
    .evidence-list li::before { content: "✓"; position: absolute; left: 0; color: var(--success); font-weight: bold; }
    .disabled-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .disabled-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background-color: #ffffff; }
    .disabled-card.alert { border-color: #fde68a; background-color: #fffbeb; }
    .disabled-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .disabled-name { font-weight: 600; font-size: 13px; color: var(--text-main); }
    .disabled-desc { font-size: 12px; color: var(--text-sub); }
    .code-block { background-color: #1e293b; color: #f8fafc; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 10px; margin-top: 6px; overflow-x: auto; white-space: pre-wrap; }
    .apps-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .app-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background-color: #ffffff; }
    .app-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .app-title { font-weight: 600; font-size: 13px; color: var(--text-main); }
    .app-details { display: flex; flex-direction: column; gap: 6px; }
    .app-detail-row { display: flex; justify-content: space-between; font-size: 12px; }
    .detail-label { color: var(--text-sub); }
    .detail-val { font-weight: 500; color: var(--text-main); }
    .detail-val.text-muted { color: var(--text-sub); line-height: 1.4; background: #f8fafc; padding: 4px 6px; border-radius: 4px; width: 100%; border: 1px dashed var(--border-color); margin-top: 2px; }
    .empty-state { padding: 32px; text-align: center; color: var(--text-sub); font-size: 13px; border: 1px dashed var(--border-color); border-radius: 8px; background: #f8fafc; }
    .features-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .feature-card-item { border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 14px; background-color: #f8fafc; }
    .feature-card-name { font-size: 12px; font-weight: 600; color: var(--text-main); }
    .recommendations-box { border: 1px solid var(--border-color); border-left: 4px solid var(--primary); border-radius: 8px; padding: 24px; background-color: #f5f3ff; margin-bottom: 32px; }
    .rec-item { display: flex; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eef2ff; }
    .rec-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .rec-critical { border-left-color: var(--critical); }
    .rec-warning { border-left-color: var(--warning); }
    .rec-success { border-left-color: var(--success); }
    .rec-icon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .rec-svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2px; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .status-dot-success { background-color: var(--success); }
    .status-dot-warning { background-color: var(--warning); }
    .status-dot-critical { background-color: var(--critical); }
    .status-dot-unknown { background-color: var(--unknown); }
    .rec-content h4 { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .rec-content p { font-size: 13px; color: var(--text-sub); }
    .footer { border-top: 1px solid var(--border-color); padding-top: 24px; margin-top: 48px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-sub); }
    
    @media print {
      body { background-color: #ffffff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { box-shadow: none; padding: 0; max-width: 100%; }
      .detection-card, .disabled-card, .app-card, .feature-card-item, .rec-item { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="actions-bar no-print">
    <button onclick="navigator.clipboard.writeText(document.documentElement.outerHTML); alert('HTML source code copied!')" class="btn-action">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy HTML Code
    </button>
    <button onclick="window.print()" class="btn-action btn-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Export as PDF / Print
    </button>
  </div>
  <div class="report-container">
    <header class="header">
      <div class="header-logo">
        <img class="logo-mark" src="${INSPECTOR_LOGO_BASE64}" alt="Shopify Inspector Logo">
        <div>
          <h1 class="logo-text">SHOPIFY <span style="color: var(--primary);">INSPECTOR</span></h1>
          <span style="font-size: 11px; color: var(--text-sub); text-transform: uppercase; font-weight: 600;">Storefront Diagnostics Report</span>
        </div>
      </div>
      <div class="report-meta">
        <div style="font-weight: 600; color: var(--text-main);">Store Review Report</div>
        <div>Generated: <span style="font-family: monospace;">${new Date().toLocaleString()}</span></div>
        <div>Version: <span style="font-family: monospace;">1.0.0</span></div>
      </div>
    </header>
    
    <div class="dashboard-hero">
      <div class="hero-info-card">
        <h2 class="hero-heading">Diagnostics Summary</h2>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Shop Name:</span><span class="info-val">${info.shopName || "N/A"}</span></div>
          <div class="info-item"><span class="info-label">Locale:</span><span class="info-val">${info.locale || "N/A"}</span></div>
          <div class="info-item" style="grid-column: span 2;"><span class="info-label">URL:</span><span class="info-val" style="font-family: monospace; word-break: break-all;">${info.hostname || "N/A"}</span></div>
          <div class="info-item" style="grid-column: span 2;"><span class="info-label">Shopify Domain:</span><span class="info-val" style="font-family: monospace; word-break: break-all;">${info.shopifyDomain || "N/A"}</span></div>
        </div>
      </div>
      <div class="health-gauge-card">
        <div class="score-circle">
          <span>${healthScore}</span>
          <span class="label">Health</span>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Overall Store Health</div>
        <p style="font-size: 10px; color: var(--text-sub); margin-top: 4px;">Evaluates stack components, active features, and code cleanliness.</p>
      </div>
    </div>
    
    <div class="kpis-grid">
      <div class="kpi-card">
        <div class="kpi-title">Store Type</div>
        <div class="kpi-value">${info.pageType || "Unknown"}</div>
        <div class="kpi-sub">${[info.country, info.currency].filter(Boolean).join(" - ") || "No geo info"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Active Theme</div>
        <div class="kpi-value" style="font-size: 14px; word-break: break-word;">${info.themeName || "N/A"}</div>
        <div class="kpi-sub">Role: <span style="font-family: monospace; font-weight: 600;">${info.themeRole || "unknown"}</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Third-party Apps</div>
        <div class="kpi-value">${activeApps} Detected</div>
        <div class="kpi-sub">Script dependencies</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Capabilities</div>
        <div class="kpi-value">${Object.keys(features).length} Scanned</div>
        <div class="kpi-sub">Storefront features</div>
      </div>
    </div>
    
    <h3 class="section-title">🛠️ Storefront Audit Recommendations</h3>
    <div class="recommendations-box">${recsHtml}</div>
    
    <h3 class="section-title">🚀 Core Infrastructure Stack Details</h3>
    <div class="card-list" style="margin-bottom: 32px;">${stackHtml}</div>
    
    <h3 class="section-title">⚠️ Deactivations &amp; Latent Traces</h3>
    <div class="disabled-group" style="margin-bottom: 32px;">${disHtml}</div>
    
    <h3 class="section-title">⚙️ Installed Third-Party App Stack</h3>
    <div style="margin-bottom: 32px;">${appsHtml}</div>
    
    <h3 class="section-title">📋 Storefront Capabilities Checklist</h3>
    <div>${featHtml}</div>
    
    <footer class="footer">
      <div>Shopify Store Inspector Client Diagnostics.</div>
      <div>Agent: <span style="font-weight: 600;">Shopify Inspector Engine</span> · V1.0.0</div>
    </footer>
  </div>
</body>
</html>`;
  }

  // Export button trigger
  exportBtn.addEventListener("click", async () => {
    if (!currentDiagnostics) return;
    const htmlReport = generateHtmlReport(currentDiagnostics);
    
    try {
      await navigator.clipboard.writeText(htmlReport);
    } catch (e) {
      console.error("Failed to copy HTML report", e);
    }

    try {
      const reportWindow = window.open("", "_blank");
      if (reportWindow) {
        reportWindow.document.write(htmlReport);
        reportWindow.document.close();
      } else {
        alert("Report HTML copied to clipboard! (Enable popups to auto-open review tab)");
      }
    } catch (err) {
      console.error("Failed to open report tab", err);
      alert("Report HTML copied to clipboard!");
    }

    const originalText = exportBtn.innerText;
    exportBtn.innerText = "Report Opened!";
    exportBtn.classList.add("success");
    setTimeout(() => {
      exportBtn.innerText = originalText;
      exportBtn.classList.remove("success");
    }, 2000);
  });

  // Refresh button trigger
  refreshBtn.addEventListener("click", performScan);

  // Auto trigger scan on popup open
  performScan();
});
