// Popup Script for Shopify Store Diagnostics Extension

document.addEventListener("DOMContentLoaded", () => {
  const FLEXYPE_LOGO_BASE64 = "data:image/png;base64,﻿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";

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
          "detectors/flexypeDetector.js",
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

    // 2. FlexyPe Products
    const products = diagnostics.flexypeProducts || {};
    renderProductStatus("checkout", products.checkout);
    renderProductStatus("pass", products.pass);
    renderProductStatus("cart", products.cart);

    // 3. Disabled Integrations
    const disabled = diagnostics.disabledIntegrations || {};
    renderDisabledStatus("checkout", disabled.checkout);
    renderDisabledStatus("pass", disabled.pass);
    renderDisabledStatus("cart", disabled.cart);

    // 4. Third Party Apps
    const apps = diagnostics.thirdPartyApps || [];
    const appsContainer = document.getElementById("apps-container");
    appsContainer.innerHTML = "";
    
    if (apps.length === 0) {
      appsContainer.innerHTML = `<div class="no-apps-detected">No common third party apps detected.</div>`;
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
        
        // Add title for evidence tooltips
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
        
        // Match status to classes
        statusCircle.className = "feature-status"; // Reset
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

  // Render product details helper
  function renderProductStatus(prefix, data) {
    const marker = document.getElementById(`${prefix}-marker`);
    const conf = document.getElementById(`${prefix}-confidence`);
    const evidenceList = document.getElementById(`${prefix}-evidence-list`);
    const toggleBtn = document.querySelector(`.evidence-toggle[data-target="${prefix}-evidence"]`);
    const evidenceBox = document.getElementById(`${prefix}-evidence`);
    
    // Reset toggle
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
      evidenceList.innerHTML = "<li>No evidence gathered for status.</li>";
    }
  }

  // Render disabled metadata helper
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
      marker.classList.add("marker-possible"); // Yellow warning
      reason.textContent = data.reason;
      if (data.evidence && data.evidence.length > 0) {
        reason.textContent += ` Evidence: ${data.evidence.join(", ")}`;
      }
    } else if (data.status === "Possible") {
      marker.classList.add("marker-possible");
      reason.textContent = `${data.reason} Trace: ${data.evidence.join(", ")}`;
    } else {
      marker.classList.add("marker-unavailable"); // Grey indicating normal
      reason.textContent = "No inactive/disabled traces detected.";
    }
  }

  // Interactive events setup: Copy values
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

  // Interactive events setup: Evidence disclosure accordions
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
    let score = 25; // Base Shopify Setup
    const products = diagnostics.flexypeProducts || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const features = diagnostics.storeFeatures || {};

    if (products.checkout) {
      if (products.checkout.status === "Detected") score += 20;
      else if (products.checkout.status === "Possible") score += 10;
    }
    if (products.pass) {
      if (products.pass.status === "Detected") score += 10;
      else if (products.pass.status === "Possible") score += 5;
    }
    if (products.cart) {
      if (products.cart.status === "Detected") score += 10;
      else if (products.cart.status === "Possible") score += 5;
    }

    let tracePenalties = 0;
    ["checkout", "pass", "cart"].forEach(k => {
      const d = disabled[k];
      if (d) {
        if (d.status === "Detected") tracePenalties += 10;
        else if (d.status === "Possible") tracePenalties += 5;
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
      score += Math.round((detFeat / totalFeat) * 35);
    }
    return Math.max(0, Math.min(100, score));
  }

  function generateRecommendations(diagnostics) {
    if (!diagnostics) return [];
    const recs = [];
    const products = diagnostics.flexypeProducts || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const features = diagnostics.storeFeatures || {};
    const apps = diagnostics.thirdPartyApps || [];
    const info = diagnostics.storeInfo || {};

    if (!products.checkout || products.checkout.status === "Not Detected") {
      recs.push({
        title: "Integrate FlexyPe Checkout",
        desc: "Active checkout SDK tags were not found, meaning the store has not enabled FlexyPe checkout. Integrating it will speed up checkout and elevate merchant sales.",
        severity: "critical"
      });
    } else if (products.checkout.confidence < 80) {
      recs.push({
        title: "Verify Checkout Integration Flags",
        desc: "Checkout elements are partially present. Ensure window config states are synced without script loading failures.",
        severity: "warning"
      });
    }

    let disabledProds = [];
    ["checkout", "pass", "cart"].forEach(k => {
      const d = disabled[k];
      if (d && (d.status === "Detected" || d.status === "Possible")) {
        disabledProds.push(k === "checkout" ? "Checkout" : k === "pass" ? "Pass" : "Cart");
      }
    });
    if (disabledProds.length > 0) {
      recs.push({
        title: "Remove Disabled FlexyPe Code Traces",
        desc: `Scanned files contain script snippets or display:none tags hiding FlexyPe ${disabledProds.join(", ")}. Recommend clean-up.`,
        severity: "warning"
      });
    }

    if (features.cartDrawer && features.cartDrawer.status === "Not Detected") {
      recs.push({
        title: "Enable Cart Drawer Interface",
        desc: "Traditional redirect checkouts impede conversions. Recommend activating an AJAX side cart drawer to improve UX.",
        severity: "info"
      });
    }

    if (info.themeRole && info.themeRole !== "main") {
      recs.push({
        title: "Theme Mode in Preview / Draft State",
        desc: `Active theme '${info.themeName}' is '${info.themeRole}'. Ensure tokens and parameters resolve correctly before launching.`,
        severity: "info"
      });
    }

    const builders = apps.filter(a => ["PageFly", "GemPages", "Shogun"].includes(a.name) && (a.status === "Detected" || a.status === "Possible"));
    if (builders.length > 1) {
      recs.push({
        title: "Audit Page Builder Script Overhead",
        desc: `Detected builders: ${builders.map(b => b.name).join(", ")}. Using multiple systems increases page payload significantly.`,
        severity: "warning"
      });
    }

    if (recs.length === 0) {
      recs.push({
        title: "All Storefront Scans Healthy",
        desc: "No critical errors or invalid deactivation instances were observed in checkout modules.",
        severity: "success"
      });
    }
    return recs;
  }

  function generateHtmlReport(diagnostics) {
    if (!diagnostics) return "";
    const info = diagnostics.storeInfo || {};
    const products = diagnostics.flexypeProducts || {};
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
      ? '<span class="badge badge-critical"><span class="status-dot status-dot-critical"></span>Trace Found</span>' 
      : '<span class="badge badge-success"><span class="status-dot status-dot-success"></span>Clean</span>';

    const progress = (c, s) => {
      let f = "progress-fill-success";
      if (s === "Not Detected") f = "progress-fill-critical";
      else if (s === "Possible") f = "progress-fill-warning";
      return `<div class="progress-bar-container"><div class="progress-track"><div class="progress-fill ${f}" style="width:${c}%"></div></div><span class="progress-text">${c}%</span></div>`;
    };

    let activeProds = 0;
    ["checkout", "pass", "cart"].forEach(p => { if (products[p] && products[p].status === "Detected") activeProds++; });
    const activeApps = apps.filter(a => a.status === "Detected" || a.status === "Possible").length;

    let recsHtml = "";
    recs.forEach(r => {
      let icon = "", cls = "rec-info";
      if (r.severity === "critical") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rec-svg"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        cls = "rec-critical"; 
      }
      else if (r.severity === "warning") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rec-svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        cls = "rec-warning"; 
      }
      else if (r.severity === "success") { 
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rec-svg"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        cls = "rec-success"; 
      }
      else {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rec-svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      }
      recsHtml += `<div class="rec-item ${cls}"><span class="rec-icon">${icon}</span><div class="rec-content"><h4>${r.title}</h4><p>${r.desc}</p></div></div>`;
    });

    let prodsHtml = "";
    const prodMeta = [
      { k: "checkout", name: "FlexyPe Checkout", desc: "One-click express checkout system with local payment integrations." },
      { k: "pass", name: "FlexyPass Open Login", desc: "Passwordless sign-in and biometric-enabled authentication service." },
      { k: "cart", name: "FlexyCart Slide Drawer", desc: "Animated sliding slide-drawer cart overlay panel." }
    ];
    prodMeta.forEach(pm => {
      const d = products[pm.k] || { status: "Not Detected", confidence: 0, evidence: [] };
      const evi = d.evidence?.length ? d.evidence.map(e => `<li>${e}</li>`).join("") : "<li>No diagnostic evidence gathered.</li>";
      prodsHtml += `<div class="detection-card"><div class="detection-card-header"><div><h4 class="detection-name">${pm.name}</h4><p class="detection-desc">${pm.desc}</p></div>${badge(d.status)}</div><div class="card-details-grid"><div class="info-group-box"><label class="info-lbl">Confidence Level</label>${progress(d.confidence, d.status)}</div><div class="evidence-box"><div class="evidence-title">Verified Signals</div><ul class="evidence-list">${evi}</ul></div></div></div>`;
    });

    let disHtml = "";
    ["checkout", "pass", "cart"].forEach(k => {
      const d = disabled[k] || { status: "Not Detected", reason: "No inactive/disabled traces detected.", evidence: [] };
      const warning = d.status === "Detected" || d.status === "Possible";
      let traces = (warning && d.evidence?.length) ? `<div style="margin-top:8px;"><div class="info-lbl" style="font-size:10px;">Traces Detected:</div><div class="code-block">${d.evidence.map(e => `<code>${e.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`).join("<br/>")}</div></div>` : "";
      disHtml += `<div class="disabled-card ${warning ? 'alert' : ''}"><div class="disabled-card-header"><span class="disabled-name">FlexyPe ${k.charAt(0).toUpperCase() + k.slice(1)}</span>${disBadge(d.status)}</div><p class="disabled-desc">${warning ? d.reason : "No deactivated snippets or CSS overrides hiding active blocks were found."}</p>${traces}</div>`;
    });

    const categories = {
      "Klaviyo": "Marketing", "Omnisend": "Marketing", "Privy": "Marketing", "Mailchimp": "Marketing",
      "Judge.me": "Reviews", "Loox": "Reviews", "Yotpo": "Reviews", "Stamped.io": "Reviews",
      "AfterShip": "Shipping", "Recharge": "Subscriptions", "Smile.io": "Loyalty",
      "Gorgias": "Support", "Tidio": "Support", "Zendesk": "Support", "Crisp": "Support", "Intercom": "Support",
      "Hotjar": "Analytics", "Lucky Orange": "Analytics", "Microsoft Clarity": "Analytics",
      "Google Analytics": "Analytics & Tracking", "Google Tag Manager": "Analytics & Tracking",
      "Facebook Pixel / Meta Pixel": "Analytics & Tracking", "TikTok Pixel": "Analytics & Tracking",
      "PageFly": "Page Builder", "GemPages": "Page Builder", "Shogun": "Page Builder"
    };

    const detApps = apps.filter(a => a.status === "Detected" || a.status === "Possible");
    let appsHtml = "";
    if (!detApps.length) {
      appsHtml = '<div class="empty-state">No common third-party application modules spotted.</div>';
    } else {
      appsHtml = '<div class="apps-summary-grid">';
      detApps.forEach(a => {
        const cat = categories[a.name] || "General";
        const evi = a.evidence?.length ? `<div class="app-detail-row" style="flex-direction:column;align-items:flex-start;gap:4px;"><span class="detail-label">Evidence:</span><span class="detail-val text-muted" style="font-size:11px;">${a.evidence.join(", ")}</span></div>` : "";
        appsHtml += `<div class="app-card"><div class="app-group-header"><span class="app-title">${a.name}</span>${badge(a.status)}</div><div class="app-details"><div class="app-detail-row"><span class="detail-label">Category:</span><span class="detail-val">${cat}</span></div><div class="app-detail-row"><span class="detail-label">Confidence:</span><span class="detail-val">${a.confidence}%</span></div>${evi}</div></div>`;
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
  <title>FlexyPe Store Diagnostics - ${info.shopName || "Store"}</title>
  <style>
    :root {
      --primary: #5c6ac4; --primary-hover: #4e5ba8; --bg-app: #f6f6f7; --bg-card: #ffffff;
      --border-color: #e1e3e5; --text-main: #202223; --text-sub: #6d7175;
      --success: #008060; --success-bg: #e6f4ea; --warning: #b98900; --warning-bg: #fff5ea;
      --critical: #d82c0d; --critical-bg: #fff0ed; --unknown: #8c9196; --unknown-bg: #f1f2f3;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: var(--bg-app); color: var(--text-main); line-height: 1.5; padding: 40px 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .actions-bar { max-width: 950px; margin: 0 auto 16px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-action { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .btn-action:hover { background-color: #f9fafb; transform: translateY(-1px); }
    .btn-primary { background-color: var(--primary); color: white; border-color: var(--primary); }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .report-container { max-width: 950px; margin: 0 auto; background: var(--bg-card); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02); padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 24px; margin-bottom: 32px; }
    .header-logo { display: flex; align-items: center; gap: 12px; }
    .logo-mark { width: 36px; height: 36px; border-radius: 8px; display: block; object-fit: contain; }
    .logo-text { font-weight: 700; font-size: 22px; color: var(--text-main); letter-spacing: -0.5px; }
    .report-meta { text-align: right; font-size: 13px; color: var(--text-sub); }
    .dashboard-hero { display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px; margin-bottom: 32px; }
    .hero-info-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 24px; background-color: #fafbfc; display: flex; flex-direction: column; justify-content: space-between; }
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
    .info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f4f5f6; padding-bottom: 8px; }
    .info-label { font-size: 13px; color: var(--text-sub); }
    .info-val { font-size: 13px; font-weight: 600; color: var(--text-main); }
    .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; line-height: 1; }
    .badge-success { background-color: var(--success-bg); color: var(--success); }
    .badge-warning { background-color: var(--warning-bg); color: var(--warning); }
    .badge-critical { background-color: var(--critical-bg); color: var(--critical); }
    .badge-unknown { background-color: var(--unknown-bg); color: var(--unknown); }
    .progress-bar-container { display: flex; align-items: center; gap: 8px; width: 100%; }
    .progress-track { flex-grow: 1; height: 8px; background-color: #f1f2f3; border-radius: 4px; overflow: hidden; }
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
    .evidence-box { background-color: #fafbfc; border-radius: 6px; padding: 14px; border: 1px solid #f0f0f1; }
    .evidence-title { font-weight: 600; color: var(--text-main); margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
    .evidence-list { list-style-type: none; }
    .evidence-list li { position: relative; padding-left: 14px; margin-bottom: 4px; color: #4f5660; font-size: 12px; }
    .evidence-list li::before { content: "✓"; position: absolute; left: 0; color: var(--success); font-weight: bold; }
    .disabled-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .disabled-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background-color: #ffffff; }
    .disabled-card.alert { border-color: #fad2cb; background-color: #fdf6f5; }
    .disabled-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .disabled-name { font-weight: 600; font-size: 13px; color: var(--text-main); }
    .disabled-desc { font-size: 12px; color: var(--text-sub); }
    .code-block { background-color: #272822; color: #f8f8f2; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 10px; margin-top: 6px; overflow-x: auto; white-space: pre-wrap; }
    .apps-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .app-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background-color: #ffffff; }
    .app-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f4f5f6; padding-bottom: 8px; }
    .app-title { font-weight: 600; font-size: 13px; color: var(--text-main); }
    .app-details { display: flex; flex-direction: column; gap: 6px; }
    .app-detail-row { display: flex; justify-content: space-between; font-size: 12px; }
    .detail-label { color: var(--text-sub); }
    .detail-val { font-weight: 500; color: var(--text-main); }
    .detail-val.text-muted { color: var(--text-sub); line-height: 1.4; background: #fafbfc; padding: 4px 6px; border-radius: 4px; width: 100%; border: 1px dashed var(--border-color); margin-top: 2px; }
    .empty-state { padding: 32px; text-align: center; color: var(--text-sub); font-size: 13px; border: 1px dashed var(--border-color); border-radius: 8px; background: #fafbfc; }
    .features-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .feature-card-item { border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 14px; background-color: #fafbfc; }
    .feature-card-name { font-size: 12px; font-weight: 600; color: var(--text-main); }
    .recommendations-box { border: 1px solid var(--border-color); border-left: 4px solid var(--primary); border-radius: 8px; padding: 24px; background-color: #fafbfe; margin-bottom: 32px; }
    .rec-item { display: flex; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eef0f5; }
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
        <img class="logo-mark" src="${FLEXYPE_LOGO_BASE64}" alt="FlexyPe Logo">
        <div>
          <h1 class="logo-text">FLEXY<span style="color: var(--primary);">PE</span></h1>
          <span style="font-size: 11px; color: var(--text-sub); text-transform: uppercase; font-weight: 600;">Storefront Diagnostics</span>
        </div>
      </div>
      <div class="report-meta">
        <div style="font-weight: 600; color: var(--text-main);">Store Review Report</div>
        <div>Generated: <span style="font-family: monospace;">${new Date().toLocaleString()}</span></div>
        <div>System Version: <span style="font-family: monospace;">1.0.0</span></div>
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
        <p style="font-size: 10px; color: var(--text-sub); margin-top: 4px;">Evaluates checklist execution ratios and module status values.</p>
      </div>
    </div>
    
    <div class="kpis-grid">
      <div class="kpi-card">
        <div class="kpi-title">Store Type</div>
        <div class="kpi-value">${info.pageType || "Unknown"}</div>
        <div class="kpi-sub">${[info.country, info.currency].filter(Boolean).join(" - ") || "No geo information"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Active Theme</div>
        <div class="kpi-value" style="font-size: 14px; word-break: break-word;">${info.themeName || "N/A"}</div>
        <div class="kpi-sub">Role: <span style="font-family: monospace; font-weight: 600;">${info.themeRole || "unknown"}</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">FlexyPe Status</div>
        <div class="kpi-value">${activeProds} / 3 Active</div>
        <div class="kpi-sub">Verified Checkout &amp; Apps</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Third-party Apps</div>
        <div class="kpi-value">${activeApps} Spotted</div>
        <div class="kpi-sub">Detected script dependencies</div>
      </div>
    </div>
    
    <h3 class="section-title">🛠️ Engineering Recommendations</h3>
    <div class="recommendations-box">${recsHtml}</div>
    
    <h3 class="section-title">🚀 FlexyPe Products Scan Details</h3>
    <div class="card-list" style="margin-bottom: 32px;">${prodsHtml}</div>
    
    <h3 class="section-title">⚠️ Deactivations &amp; Latent Traces</h3>
    <div class="disabled-group" style="margin-bottom: 32px;">${disHtml}</div>
    
    <h3 class="section-title">⚙️ Installed Third-Party Integrations</h3>
    <div style="margin-bottom: 32px;">${appsHtml}</div>
    
    <h3 class="section-title">📋 Storefront Capabilities Checklist</h3>
    <div>${featHtml}</div>
    
    <footer class="footer">
      <div>© FlexyPe support client-side extraction.</div>
      <div>Agent: <span style="font-weight: 600;">FlexyPe client diagnostics</span> · V1.0.0</div>
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
