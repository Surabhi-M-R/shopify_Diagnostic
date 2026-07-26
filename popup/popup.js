// Popup Script for Shopify Store Diagnostics Extension

document.addEventListener("DOMContentLoaded", () => {
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
      if (s === "Detected") return '<span class="badge badge-success">🟢 Detected</span>';
      if (s === "Possible") return '<span class="badge badge-warning">🟡 Possible</span>';
      if (s === "Not Detected") return '<span class="badge badge-critical">🔴 Not Detected</span>';
      return '<span class="badge badge-unknown">⚫ Unknown</span>';
    };

    const disBadge = (s) => (s === "Detected" || s === "Possible") 
      ? '<span class="badge badge-critical">⚠️ Trace Found</span>' 
      : '<span class="badge badge-success">🟢 Clean</span>';

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
      let icon = "ℹ️", cls = "rec-info";
      if (r.severity === "critical") { icon = "❌"; cls = "rec-critical"; }
      else if (r.severity === "warning") { icon = "⚠️"; cls = "rec-warning"; }
      else if (r.severity === "success") { icon = "✅"; cls = "rec-success"; }
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
    .logo-mark { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #5c6ac4, #3f4eae); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
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
    .rec-icon { font-size: 20px; flex-shrink: 0; }
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
      📋 Copy HTML Code
    </button>
    <button onclick="window.print()" class="btn-action btn-primary">
      🖨️ Export as PDF / Print
    </button>
  </div>
  <div class="report-container">
    <header class="header">
      <div class="header-logo">
        <div class="logo-mark">F</div>
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
