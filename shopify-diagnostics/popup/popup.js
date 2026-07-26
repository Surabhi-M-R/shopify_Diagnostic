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

        badge.innerHTML = `
          <div class="status-marker small-marker ${markerClass}"></div>
          <span class="app-name-label">${app.name}</span>
          <span class="app-conf">${app.confidence}%</span>
        `;
        
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
        if (featVal.status === "Present") {
          statusCircle.classList.add("marker-detected");
          featTag.setAttribute("title", `Present\nEvidence:\n- ${featVal.evidence.join("\n- ")}`);
        } else if (featVal.status === "Possible") {
          statusCircle.classList.add("marker-possible");
          featTag.setAttribute("title", `Possible Presence\nEvidence:\n- ${featVal.evidence.join("\n- ")}`);
        } else {
          statusCircle.classList.add("marker-not-detected");
          featTag.setAttribute("title", "Not Present");
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

  // Export button trigger
  exportBtn.addEventListener("click", async () => {
    if (!currentDiagnostics) return;
    const markdown = generateMarkdown(currentDiagnostics);
    try {
      await navigator.clipboard.writeText(markdown);
      const originalText = exportBtn.innerText;
      exportBtn.innerText = "Copied!";
      exportBtn.classList.add("success");
      setTimeout(() => {
        exportBtn.innerText = originalText;
        exportBtn.classList.remove("success");
      }, 1500);
    } catch (e) {
      console.error("Failed to copy markdown report", e);
    }
  });

  // Markdown format generator helper
  function generateMarkdown(diagnostics) {
    if (!diagnostics) return "";

    const info = diagnostics.storeInfo || {};
    const products = diagnostics.flexypeProducts || {};
    const disabled = diagnostics.disabledIntegrations || {};
    const apps = diagnostics.thirdPartyApps || [];
    const features = diagnostics.storeFeatures || {};

    let md = `# 🔍 Shopify Diagnostics Report - ${info.shopName || "Unknown Shop"}\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;

    md += `## 🏬 Store Information\n`;
    md += `- **Shop Name**: ${info.shopName || "N/A"}\n`;
    md += `- **Page Type**: ${info.pageType || "Unknown"}\n`;
    md += `- **Hostname**: ${info.hostname || "N/A"}\n`;
    md += `- **Shopify Domain**: ${info.shopifyDomain || "N/A"}\n`;
    md += `- **Locale / Lang**: ${info.locale || "N/A"}\n`;
    md += `- **Country / Currency**: ${[info.country, info.currency].filter(Boolean).join(" / ") || "N/A"}\n`;
    md += `- **Active Theme**: ${info.themeName || "N/A"} (ID: ${info.themeId || "N/A"}, Role: ${info.themeRole || "N/A"}, Store ID: ${info.themeStoreId || "N/A"})\n\n`;

    md += `## 🚀 FlexyPe Products\n`;
    ["checkout", "pass", "cart"].forEach(key => {
      const prodNames = { checkout: "FlexyPe Checkout", pass: "FlexyPass Open Login", cart: "FlexyCart Slide Drawer" };
      const data = products[key];
      if (data) {
        md += `- **${prodNames[key]}**: ${data.status} (Confidence: ${data.confidence}%)\n`;
        if (data.evidence && data.evidence.length > 0) {
          data.evidence.forEach(evi => {
            md += `  - *${evi}*\n`;
          });
        }
      } else {
        md += `- **${prodNames[key]}**: Unknown / Scan failed\n`;
      }
    });
    md += `\n`;

    md += `## ⚠️ Disabled Integrations\n`;
    let disabledLines = [];
    ["checkout", "pass", "cart"].forEach(key => {
      const prodNames = { checkout: "FlexyPe Checkout", pass: "FlexyPass", cart: "FlexyCart" };
      const data = disabled[key];
      if (data) {
        if (data.status === "Detected" || data.status === "Possible") {
          let line = `- **${prodNames[key]}**: ${data.status} Inactive/Disabled (${data.reason})`;
          if (data.evidence && data.evidence.length > 0) {
            line += ` [Evidence: ${data.evidence.join(", ")}]`;
          }
          disabledLines.push(line);
        } else {
          disabledLines.push(`- **${prodNames[key]}**: Active / No inactive traces detected.`);
        }
      }
    });
    md += disabledLines.join("\n") + "\n\n";

    md += `## ⚙️ Third Party Apps\n`;
    const detectedApps = apps.filter(app => app.status === "Detected" || app.status === "Possible");
    if (detectedApps.length === 0) {
      md += `*None detected*\n\n`;
    } else {
      detectedApps.forEach(app => {
        md += `- **${app.name}**: ${app.status} (Confidence: ${app.confidence}%)\n`;
        if (app.evidence && app.evidence.length > 0) {
          app.evidence.forEach(evi => {
            md += `  - *${evi}*\n`;
          });
        }
      });
      md += `\n`;
    }

    md += `## 🛠️ Store Features\n`;
    const featureLabels = {
      search: "Search",
      predictiveSearch: "Predictive Search",
      wishlist: "Wishlist",
      customerLogin: "Customer Login",
      customerAccounts: "Customer Accounts",
      currencySelector: "Currency Selector",
      languageSelector: "Language Selector",
      cartDrawer: "Cart Drawer",
      quickView: "Quick View",
      recentlyViewed: "Recently Viewed",
      newsletter: "Newsletter Form",
      chatWidget: "Chat Widget",
      reviews: "Product Reviews",
      productRecommendations: "Recommendations",
      infiniteScroll: "Infinite Scroll"
    };

    Object.keys(features).forEach(key => {
      const featVal = features[key];
      const label = featureLabels[key] || key;
      md += `- **${label}**: ${featVal.status}\n`;
      if (featVal.evidence && featVal.evidence.length > 0) {
        featVal.evidence.forEach(evi => {
          md += `  - *${evi}*\n`;
        });
      }
    });

    return md;
  }

  // Refresh button trigger
  refreshBtn.addEventListener("click", performScan);

  // Auto trigger scan on popup open
  performScan();
});
