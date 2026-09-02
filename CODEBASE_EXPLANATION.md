# Codebase Deep-Dive & Technical Theory

This document provides a comprehensive, line-by-line and module-by-module explanation of the entire **Shopify Store Inspector & Diagnostics** codebase.

---

## 1. Theoretical Foundation & Core Architecture

### 1.1 Why Standard Extensions Fail on Shopify
Chrome extensions execute content scripts in an **Isolated World** by default. While this provides security isolation, it isolates the extension script's `window` object from the main web page's `window` object. 

On a Shopify storefront:
- Global variables such as `window.Shopify`, `window.ShopifyAnalytics`, `window.ShopifyPay`, and theme configuration objects (`window.theme`) exist strictly inside the page's **MAIN World**.
- If a content script inside an isolated world tries to access `window.Shopify`, it will receive `undefined`.

### 1.2 The MAIN World Script Injection Solution
To bypass isolated world boundaries safely:
1. The extension popup triggers `chrome.scripting.executeScript()` with `world: "MAIN"`.
2. Chrome injects the extension's helper and detector JavaScript files directly into the web page's top-level document context.
3. The scripts run inside the exact same execution scope as Shopify's theme scripts, granting direct access to global variables, metadata, and script execution engines.

---

## 2. Line-by-Line & Module-by-Module Explanation

---

### Module 1: `manifest.json` (Extension Configuration)

```json
{
  "manifest_version": 3,
  "name": "Shopify Store Inspector & Diagnostics",
  "version": "1.0.0",
  "description": "Universal diagnostic inspector for Shopify storefronts...",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { ... }
  },
  "background": {
    "service_worker": "background/background.js"
  }
}
```

* **Lines 1-4**: Specifies Manifest V3 compliance, human-readable extension title, versioning, and description.
* **Lines 5-8 (`permissions`)**:
  * `"activeTab"`: Grants temporary elevated tab access when the user clicks the extension popup icon.
  * `"scripting"`: Unlocks the `chrome.scripting.executeScript` API to inject scripts.
* **Lines 9-12 (`host_permissions`)**: Grants wildcard host permissions (`http://*/*`, `https://*/*`) so the extension can inspect custom merchant domains (e.g., `brand.com`).
* **Lines 13-20 (`action`)**: Defines the default popup HTML file (`popup/popup.html`) and toolbar icons.
* **Lines 21-23 (`background`)**: Registers `background/background.js` as an event-driven service worker.

---

### Module 2: `background/background.js` (Service Worker)

```javascript
chrome.runtime.onInstalled.addListener(() => {
  console.log("Shopify Store Diagnostics Chrome Extension installed successfully.");
});
```

* **Purpose**: Serves as the background lifecycle service worker. It listens for extension installation/update events and keeps the extension service worker registered in Manifest V3.

---

### Module 3: `utils/constants.js` (Detection Signatures)

```javascript
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Constants = {
  DETECTION_STATUS: {
    DETECTED: "Detected",
    POSSIBLE: "Possible",
    NOT_DETECTED: "Not Detected",
    UNAVAILABLE: "Unavailable"
  },
  THIRD_PARTY_APPS: [ ... ]
};
```

* **Namespace Pattern**: Attaches data to `window.__shopifyDiagnostics` to prevent global scope pollution across injected scripts.
* **`DETECTION_STATUS`**: Standardized status strings used by all detector modules (`Detected`, `Possible`, `Not Detected`).
* **`THIRD_PARTY_APPS`**: An array of 27 app detection rules (e.g., Klaviyo, Yotpo, Gorgias, Recharge, PageFly). Each rule defines matching script patterns (`scripts`), global variables (`globals`), and DOM selectors (`dom`).

---

### Module 4: `utils/helpers.js` (Cached DOM Engine & Math)

```javascript
window.__shopifyDiagnostics.Helpers = {
  _cache: null,
  initContext: function() { ... },
  resetContext: function() { ... },
  evaluateDetection: function(signals, threshold) { ... }
}
```

#### Key Functions in `helpers.js`:

1. **`initContext()` (Single-Pass DOM Caching)**:
   * Line 14: Extracts all `<script>` elements into `scriptEntries`, parsing `src`, `textContent`, `type`, and disabled flags.
   * Line 28: Collects all `<link rel="stylesheet">` hrefs.
   * Line 34: Creates a `document.createNodeIterator` to parse up to 500 HTML comment nodes in one pass.
   * *Benefit*: Eliminates hundreds of expensive `querySelectorAll` calls; a single DOM walk serves all 15+ detectors.

2. **`hasGlobal(name)`**:
   * Splits property paths like `"Shopify.theme.name"` by `.` and traverses `window` safely without throwing reference errors.

3. **`evaluateDetection(signals, threshold)`**:
   * Calculates confidence percentage: $\text{Confidence} = \left(\frac{\text{Sum of Detected Weights}}{\text{Total Weight}}\right) \times 100$.
   * If $\text{Confidence} \ge 80\% \rightarrow \text{"Detected"}$.
   * If $0\% < \text{Confidence} < 80\% \rightarrow \text{"Possible"}$.
   * If $\text{Confidence} = 0\% \rightarrow \text{"Not Detected"}$.

---

### Module 5: `detectors/storeDetector.js` (Store Verification & Theme Metadata)

```javascript
window.__shopifyDiagnostics.StoreDetector = {
  detect: function() { ... }
}
```

* **Shopify Verification (8 Signals)**: Checks `window.Shopify`, `window.ShopifyAnalytics`, Shopify CDN script URLs (`cdn.shopify.com`), preconnect header links, and `<meta name="shopify-digital-wallet">`.
* **Triple-Layer Page Type Detection**:
  1. Primary: Reads `ShopifyAnalytics.meta.page.pageType`.
  2. Secondary: Inspects URL path (`/products/` $\rightarrow$ Product, `/cart` $\rightarrow$ Cart) and `document.body` CSS classes (`template-product`, `template-collection`).
  3. Fallback: Reads `<title>` text.
* **Metadata Extraction**: Extracts shop name, primary domain, myshopify domain, currency, language locale, theme name, theme ID, and theme role (`main` live vs `unpublished` draft).

---

### Module 6: `detectors/stackDetector.js` (Core E-Commerce Architecture)

```javascript
window.__shopifyDiagnostics.StackDetector = {
  detect: function() { ... }
}
```

Evaluates 3 main e-commerce components:
1. **Checkout & Payment Engine**: Weights Shop Pay API availability (35%), dynamic payment buttons (25%), express checkout buttons (Apple Pay, PayPal - 20%), and custom checkout SDKs (20%).
2. **Customer Auth Stack**: Weights Shopify customer account meta tags (35%), native login/register forms (30%), passwordless auth scripts (20%), and account DOM containers (15%).
3. **Cart & Drawer Engine**: Weights AJAX slide drawer containers `#CartDrawer` / `.slide-cart` (40%), theme cart drawer APIs (25%), drawer script tags (20%), and trigger buttons (15%).

---

### Module 7: `detectors/disabledDetector.js` (Inactive Code & Comment Traces)

```javascript
window.__shopifyDiagnostics.DisabledDetector = {
  detect: function() { ... }
}
```

* **Purpose**: Identifies code that exists in theme files but is currently turned off or hidden.
* **Checks Performed**:
  1. Searches pre-cached HTML comments for keywords (`checkout`, `cart-drawer`, `customer-login`).
  2. Scans for disabled `<script>` tags (`type="text/plain"` or `[disabled]`).
  3. Checks DOM elements matching checkout/cart selectors that have `display: none` or `visibility: hidden` computed styles.

---

### Module 8: `detectors/appDetector.js` (Third-Party App Stack)

```javascript
window.__shopifyDiagnostics.AppDetector = {
  detect: function() { ... }
}
```

* Loops through the 27 third-party app signatures in `constants.js`.
* Scores app presence across three independent categories:
  * **Scripts**: Checks if app JS URLs exist in the DOM script cache.
  * **Globals**: Checks if app global JS objects exist on `window`.
  * **DOM**: Checks if app container elements exist on the page.
* Collapses scores so background analytics tools (which lack DOM elements) can still reach 100% confidence via script + global matches.

---

### Module 9: `detectors/featureDetector.js` (Storefront Capabilities)

```javascript
window.__shopifyDiagnostics.FeatureDetector = {
  detect: function() { ... }
}
```

* Audits 15 common e-commerce features:
  Search, Predictive Search, Wishlist, Customer Login, Customer Accounts, Currency Selector, Language Selector, Cart Drawer, Quick View, Recently Viewed, Newsletter Form, Live Chat Widget, Product Reviews, Recommendations Widget, Infinite Scroll.
* Uses 3 signals per feature (DOM selectors, Global JS objects, Inline script references).

---

### Module 10: `content/content.js` (Execution Coordinator)

```javascript
(function() {
  try {
    var NS = window.__shopifyDiagnostics;
    NS.Helpers.initContext(); // Initialize DOM Cache

    var storeResult = NS.StoreDetector.detect();
    if (!storeResult.isShopify) return { isShopify: false };

    var stackResult = NS.StackDetector.detect();
    var disabledResult = NS.DisabledDetector.detect();
    var appResult = NS.AppDetector.detect();
    var featureResult = NS.FeatureDetector.detect();

    NS.Helpers.resetContext(); // Clean up memory

    return {
      isShopify: true,
      data: {
        storeInfo: storeResult.data,
        coreStack: stackResult,
        disabledIntegrations: disabledResult,
        thirdPartyApps: appResult,
        storeFeatures: featureResult
      }
    };
  } catch(e) { ... }
})();
```

* **Purpose**: Acts as the main entry point during script injection. Initializes the shared DOM cache, runs all detectors in order, cleans up the DOM cache to prevent memory leaks, and returns the aggregated JSON payload back to the popup script.

---

### Module 11: `popup/popup.js` & `popup/popup.html` (Dashboard UI & HTML Report Generator)

1. **`performScan()`**:
   * Uses `chrome.tabs.query({ active: true, currentWindow: true })` to get the current page URL.
   * Calls `chrome.scripting.executeScript()` with `world: "MAIN"`, passing all detector files sequentially.
   * Receives the returned payload from `content.js` and renders it into the popup cards.
2. **`generateHtmlReport(diagnostics)`**:
   * Generates a complete, self-contained HTML page string containing CSS styling, health gauge score calculation, recommendations, KPI cards, and printable audit sheets.
   * Copies the HTML report code to the user's clipboard and opens it in a new browser tab for printing or PDF export.
