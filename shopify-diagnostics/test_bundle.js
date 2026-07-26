// Constants for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Constants = {
  PAGE_TYPES: {
    HOME: "Home",
    PRODUCT: "Product",
    COLLECTION: "Collection",
    CART: "Cart",
    SEARCH: "Search",
    BLOG: "Blog",
    ARTICLE: "Article",
    CUSTOMER_LOGIN: "Customer Login",
    CUSTOMER_REGISTER: "Customer Register",
    CUSTOMER_ACCOUNT: "Customer Account",
    CHECKOUT: "Checkout",
    NOT_FOUND: "404",
    UNKNOWN: "Unknown"
  },

  DETECTION_STATUS: {
    DETECTED: "Detected",
    POSSIBLE: "Possible",
    NOT_DETECTED: "Not Detected",
    UNAVAILABLE: "Unavailable"
  },

  // Third-Party Apps to detect with their signatures
  THIRD_PARTY_APPS: [
    {
      name: "Klaviyo",
      scripts: ["klaviyo.js", "static.klaviyo.com"],
      globals: ["klaviyo", "_klSend"],
      dom: ["#klaviyo-bis-iframe", ".klaviyo-form"]
    },
    {
      name: "Judge.me",
      scripts: ["judge.me", "judgeme"],
      globals: ["jdgm"],
      dom: [".jdgm-widget", ".jdgm-preview-badge"]
    },
    {
      name: "Loox",
      scripts: ["loox.io", "loox.js"],
      globals: ["LOOX"],
      dom: ["#looxReviews", ".loox-rating"]
    },
    {
      name: "Yotpo",
      scripts: ["yotpo.com", "yotpo.js"],
      globals: ["yotpo", "Yotpo"],
      dom: [".yotpo-widget-instance", ".yotpo"]
    },
    {
      name: "AfterShip",
      scripts: ["aftership.com", "aftership-tracking"],
      globals: ["AfterShip"],
      dom: [".aftership-widget", "#aftership-body"]
    },
    {
      name: "Recharge",
      scripts: ["rechargeapps.com", "recharge.js"],
      globals: ["recharge", "ReCharge"],
      dom: [".rc_container", ".recharge-subscription-widget"]
    },
    {
      name: "Gorgias",
      scripts: ["gorgias.io", "gorgias-chat-bundle"],
      globals: ["GorgiasChat", "gorgiasChatSettings"],
      dom: ["#gorgias-chat-container"]
    },
    {
      name: "Hotjar",
      scripts: ["hotjar.com", "hotjar-"],
      globals: ["hj", "hjSiteSettings"],
      dom: []
    },
    {
      name: "Google Analytics",
      scripts: ["google-analytics.com/analytics.js", "google-analytics.com/ga.js"],
      globals: ["ga", "gaGlobal"],
      dom: []
    },
    {
      name: "Google Tag Manager",
      scripts: ["googletagmanager.com/gtm.js"],
      globals: ["google_tag_manager", "dataLayer"],
      dom: []
    },
    {
      name: "Meta Pixel",
      scripts: ["connect.facebook.net/en_US/fbevents.js"],
      globals: ["fbq", "_fbq"],
      dom: []
    },
    {
      name: "TikTok Pixel",
      scripts: ["analytics.tiktok.com/i18n/pixel/"],
      globals: ["ttq", "_ttq"],
      dom: []
    },
    {
      name: "Zendesk",
      scripts: ["assets.zendesk.com", "zendesk.com/embeddable"],
      globals: ["zE", "zEmbed"],
      dom: ["#ze-container"]
    },
    {
      name: "Intercom",
      scripts: ["widget.intercom.io/widget"],
      globals: ["Intercom", "intercomSettings"],
      dom: ["#intercom-container"]
    },
    {
      name: "Crisp",
      scripts: ["client.crisp.chat"],
      globals: ["$crisp", "CRISP_WEBSITE_ID"],
      dom: ["#crisp-chatbox"]
    }
  ]
};
// Helper Functions for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Helpers = {
  /**
   * Safely selects a DOM element, returning null if it doesn't exist
   * @param {string} selector 
   * @returns {Element|null}
   */
  safeQuerySelector: function(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn("Invalid selector: " + selector, e);
      return null;
    }
  },

  /**
   * Safely selects all matching DOM elements, returning an empty array if invalid
   * @param {string} selector 
   * @returns {Element[]}
   */
  safeQuerySelectorAll: function(selector) {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      console.warn("Invalid selector helper: " + selector, e);
      return [];
    }
  },

  /**
   * Safely checks if a global variable exists on window
   * @param {string} name 
   * @returns {boolean}
   */
  hasGlobal: function(name) {
    try {
      const parts = name.split(".");
      let current = window;
      for (const part of parts) {
        if (current === undefined || current === null) return false;
        current = current[part];
      }
      return current !== undefined && current !== null;
    } catch (e) {
      return false;
    }
  },

  /**
   * Safely retrieves the value of a global variable or returns null
   * @param {string} name 
   * @returns {any}
   */
  getGlobalValue: function(name) {
    try {
      const parts = name.split(".");
      let current = window;
      for (const part of parts) {
        if (current === undefined || current === null) return null;
        current = current[part];
      }
      return current;
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if any script element has src containing pattern or content matching pattern
   * @param {string|RegExp} pattern 
   * @returns {boolean}
   */
  hasScript: function(pattern) {
    try {
      const scripts = this.safeQuerySelectorAll("script");
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      return scripts.some(script => {
        if (script.src && regex.test(script.src)) return true;
        if (script.textContent && regex.test(script.textContent)) return true;
        return false;
      });
    } catch (e) {
      return false;
    }
  },

  /**
   * Checks if any link or stylesheet contains pattern
   * @param {string|RegExp} pattern 
   * @returns {boolean}
   */
  hasStylesheet: function(pattern) {
    try {
      const links = this.safeQuerySelectorAll("link[rel='stylesheet']");
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      return links.some(link => link.href && regex.test(link.href));
    } catch (e) {
      return false;
    }
  },

  /**
   * Retrieves meta tag content
   * @param {string} name - name or property attribute
   * @returns {string|null}
   */
  getMetaContent: function(name) {
    try {
      const meta = this.safeQuerySelector(`meta[name='${name}'], meta[property='${name}']`);
      return meta ? meta.getAttribute("content") : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Search HTML comments for a string or regex
   * @param {string|RegExp} pattern 
   * @returns {string[]} - Array of matching comment texts
   */
  searchComments: function(pattern) {
    const matches = [];
    try {
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      const iterator = document.createNodeIterator(
        document.documentElement,
        NodeFilter.SHOW_COMMENT,
        null
      );
      
      let currentNode;
      let count = 0;
      // Safeguard against infinite loops and excessive scanning
      while ((currentNode = iterator.nextNode()) && count < 200) {
        count++;
        if (regex.test(currentNode.nodeValue)) {
          matches.push(currentNode.nodeValue.trim());
        }
      }
    } catch (e) {
      console.warn("Error scanning comment nodes", e);
    }
    return matches;
  },

  /**
   * Calculates confidence score based on input signals
   * @param {Array<{detected: boolean, weight: number, name: string}>} signals 
   * @returns {{score: number, evidence: string[]}}
   */
  evaluateDetection: function(signals) {
    let score = 0;
    let totalWeight = 0;
    const evidence = [];

    signals.forEach(sig => {
      totalWeight += sig.weight;
      if (sig.detected) {
        score += sig.weight;
        evidence.push(sig.name);
      }
    });

    const confidence = totalWeight > 0 ? Math.min(100, Math.round((score / totalWeight) * 100)) : 0;
    
    let status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.NOT_DETECTED;
    if (confidence >= 80) {
      status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.DETECTED;
    } else if (confidence > 0) {
      status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.POSSIBLE;
    }

    return {
      status,
      confidence,
      evidence
    };
  }
};
// Store Information Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.StoreDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;
    const Types = window.__shopifyDiagnostics.Constants.PAGE_TYPES;

    // 1. Is this actually a Shopify store?
    // We check several high-confidence signals of Shopify.
    const isShopify = 
      H.hasGlobal("Shopify") || 
      H.hasGlobal("ShopifyAnalytics") ||
      H.safeQuerySelector("link[href*='cdn.shopify.com']") !== null ||
      H.safeQuerySelector("script[src*='cdn.shopify.com']") !== null ||
      H.getMetaContent("shopify-digital-wallet") !== null ||
      H.getMetaContent("shopify-checkout-api-token") !== null;

    if (!isShopify) {
      return {
        isShopify: false,
        data: null
      };
    }

    // 2. Fetch Shop Details using multiple fallbacks
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Shopify domain fallback
    let shopifyDomain = 
      H.getGlobalValue("Shopify.shop") || 
      H.getGlobalValue("ShopifyAnalytics.lib.treasury.shop") ||
      "";
    if (!shopifyDomain) {
      // Try to find it in script links
      const shopifyLink = H.safeQuerySelector("link[href*='.myshopify.com']");
      if (shopifyLink) {
        const match = shopifyLink.href.match(/([a-zA-Z0-9-]+\.myshopify\.com)/);
        if (match) shopifyDomain = match[1];
      }
    }

    // Shop Name fallback
    let shopName = 
      H.getMetaContent("og:site_name") || 
      H.getGlobalValue("Shopify.shop")?.split(".")[0] ||
      document.title ||
      "";
    // Clean shop name from domain name if needed
    if (shopName.includes(".myshopify")) {
      shopName = shopName.split(".")[0];
    }
    
    // Locale & Country
    const locale = 
      H.getGlobalValue("Shopify.locale") || 
      H.getGlobalValue("ShopifyAnalytics.meta.page.locale") || 
      H.getMetaContent("content-language") ||
      document.documentElement.lang ||
      "";

    const country = 
      H.getGlobalValue("Shopify.country") || 
      H.getGlobalValue("ShopifyAnalytics.meta.page.country") ||
      "";

    // Currency
    const currency = 
      H.getGlobalValue("Shopify.currency.active") || 
      H.getGlobalValue("ShopifyAnalytics.meta.currency") || 
      "";

    // 3. Theme Information
    const themeName = 
      H.getGlobalValue("Shopify.theme.name") || 
      "Unknown Theme";

    const themeId = 
      H.getGlobalValue("Shopify.theme.id") ? String(H.getGlobalValue("Shopify.theme.id")) : "Unknown";

    const themeRole = 
      H.getGlobalValue("Shopify.theme.role") || "Unknown";

    const themeStoreId = 
      H.getGlobalValue("Shopify.theme.theme_store_id") ? String(H.getGlobalValue("Shopify.theme.theme_store_id")) : "Custom/Unknown";

    // 4. Page Type Detection
    const pageType = this.detectPageType(Types, H);

    return {
      isShopify: true,
      data: {
        storeUrl: url,
        hostname: hostname,
        shopName: shopName,
        currentUrl: url,
        shopifyDomain: shopifyDomain,
        locale: locale,
        country: country,
        currency: currency,
        themeName: themeName,
        themeId: themeId,
        themeRole: themeRole,
        themeStoreId: themeStoreId,
        pageType: pageType
      }
    };
  },

  /**
   * Identifies the current page type on Shopify.
   * @param {Object} Types 
   * @param {Object} H 
   * @returns {string}
   */
  detectPageType: function(Types, H) {
    // Check Shopify Analytics Meta first (highly reliable)
    const rawPageType = H.getGlobalValue("ShopifyAnalytics.meta.page.pageType");
    if (rawPageType) {
      const mapping = {
        "index": Types.HOME,
        "product": Types.PRODUCT,
        "collection": Types.COLLECTION,
        "cart": Types.CART,
        "search": Types.SEARCH,
        "blog": Types.BLOG,
        "article": Types.ARTICLE,
        "checkout": Types.CHECKOUT,
        "404": Types.NOT_FOUND
      };
      if (mapping[rawPageType]) return mapping[rawPageType];
    }

    // Check pathname patterns and body classes
    const pathname = window.location.pathname;
    const body = H.safeQuerySelector("body");
    const bodyClasses = body ? Array.from(body.classList) : [];

    // Customer Account details
    if (pathname.startsWith("/account/login") || bodyClasses.includes("template-customers-login")) {
      return Types.CUSTOMER_LOGIN;
    }
    if (pathname.startsWith("/account/register") || bodyClasses.includes("template-customers-register")) {
      return Types.CUSTOMER_REGISTER;
    }
    if (pathname.startsWith("/account") || bodyClasses.includes("template-customers-account") || pathname.startsWith("/addresses") || pathname.startsWith("/orders")) {
      return Types.CUSTOMER_ACCOUNT;
    }
    if (pathname.startsWith("/checkout")) {
      return Types.CHECKOUT;
    }

    // Standard paths checking
    if (pathname === "/" || pathname === "/index" || bodyClasses.some(c => c.includes("template-index") || c === "index")) {
      return Types.HOME;
    }
    if (pathname.startsWith("/products/") || bodyClasses.some(c => c.includes("template-product") || c.startsWith("product"))) {
      return Types.PRODUCT;
    }
    if (pathname.startsWith("/collections/") || bodyClasses.some(c => c.includes("template-collection") || c.startsWith("collection"))) {
      return Types.COLLECTION;
    }
    if (pathname === "/cart" || pathname.startsWith("/cart/") || bodyClasses.some(c => c.includes("template-cart") || c === "cart")) {
      return Types.CART;
    }
    if (pathname === "/search" || pathname.startsWith("/search/") || bodyClasses.some(c => c.includes("template-search"))) {
      return Types.SEARCH;
    }
    if (pathname.startsWith("/blogs/") && (pathname.split("/").length > 3)) {
      return Types.ARTICLE;
    }
    if (pathname.startsWith("/blogs/") || bodyClasses.some(c => c.includes("template-blog"))) {
      return Types.BLOG;
    }
    if (bodyClasses.some(c => c.includes("template-404") || c === "404")) {
      return Types.NOT_FOUND;
    }

    // Check title tag for 404
    if (document.title.toLowerCase().includes("page not found") || document.title.includes("404")) {
      return Types.NOT_FOUND;
    }

    return Types.UNKNOWN;
  }
};
// FlexyPe Products Detection Engine for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FlexyPeDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;

    // Detect FlexyPe Checkout
    const checkoutSignals = [
      {
        name: "Global object 'FlexyPe' or 'FlexyPeCheckoutInstance' found",
        detected: H.hasGlobal("FlexyPe") || H.hasGlobal("FlexyPeCheckoutInstance") || H.hasGlobal("FlexyCheckout"),
        weight: 40
      },
      {
        name: "FlexyPe Checkout JavaScript loaded",
        detected: H.hasScript(/flexype-sdk/i) || H.hasScript(/checkout\.flexype\.com/i) || H.hasScript(/cdn\.flexype\.com\/checkout/i) || H.hasScript(/flexy-checkout/i),
        weight: 35
      },
      {
        name: "FlexyPe Checkout DOM elements present",
        detected: 
          H.safeQuerySelector("#flexype-checkout-container") !== null ||
          H.safeQuerySelector(".flexype-checkout-button") !== null ||
          H.safeQuerySelector("[data-flexype-checkout]") !== null,
        weight: 20
      },
      {
        name: "FlexyPe Custom Elements (<flexype-checkout>) present",
        detected: H.safeQuerySelector("flexype-checkout, flexype-button") !== null,
        weight: 15
      },
      {
        name: "FlexyPe stylesheets linked",
        detected: H.hasStylesheet(/flexype/i) || H.hasStylesheet(/flexy-checkout/i),
        weight: 10
      }
    ];

    // Detect FlexyPass
    const passSignals = [
      {
        name: "Global object 'FlexyPass' or 'FlexyPassInstance' found",
        detected: H.hasGlobal("FlexyPass") || H.hasGlobal("FlexyPassInstance"),
        weight: 40
      },
      {
        name: "FlexyPass JavaScript loaded",
        detected: H.hasScript(/flexype-pass/i) || H.hasScript(/pass\.flexype\.com/i) || H.hasScript(/flexypass/i),
        weight: 35
      },
      {
        name: "FlexyPass login button or selector present",
        detected: 
          H.safeQuerySelector(".flexypass-login-btn") !== null || 
          H.safeQuerySelector("[data-flexypass]") !== null || 
          H.safeQuerySelector("#flexypass-profile") !== null,
        weight: 25
      },
      {
        name: "FlexyPass Custom Elements (<flexy-pass>) present",
        detected: H.safeQuerySelector("flexy-pass, flexype-pass") !== null,
        weight: 15
      }
    ];

    // Detect FlexyCart
    const cartSignals = [
      {
        name: "Global object 'FlexyCart' or 'FlexyCartInstance' found",
        detected: H.hasGlobal("FlexyCart") || H.hasGlobal("FlexyCartInstance"),
        weight: 40
      },
      {
        name: "FlexyCart JavaScript loaded",
        detected: H.hasScript(/flexype-cart/i) || H.hasScript(/cart\.flexype\.com/i) || H.hasScript(/flexycart/i),
        weight: 35
      },
      {
        name: "FlexyCart drawer or elements found in DOM",
        detected: 
          H.safeQuerySelector("#flexy-cart") !== null || 
          H.safeQuerySelector(".flexy-cart-drawer") !== null || 
          H.safeQuerySelector(".flexy-cart-trigger") !== null ||
          H.safeQuerySelector("[data-flexycart]") !== null,
        weight: 25
      },
      {
        name: "FlexyCart CSS attributes or class prefix found",
        detected: H.safeQuerySelector("[class*='flexy-cart-'], [id*='flexy-cart-']") !== null,
        weight: 15
      }
    ];

    return {
      checkout: H.evaluateDetection(checkoutSignals),
      pass: H.evaluateDetection(passSignals),
      cart: H.evaluateDetection(cartSignals)
    };
  }
};
// Disabled Integration Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.DisabledDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;
    const Status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS;

    // Detect disabled Checkout
    const checkoutDisabledSignals = [];
    
    // Check comments
    const checkoutComments = H.searchComments(/flexype-checkout|flexy-checkout/i);
    checkoutDisabledSignals.push({
      name: "Commented references to FlexyPe Checkout in DOM",
      detected: checkoutComments.length > 0,
      weight: 35
    });

    // Check disabled script tags
    const disabledCheckoutScripts = H.safeQuerySelectorAll("script[type='text/plain'], script[type='text/x-template'], script[disabled]")
      .filter(s => {
        const text = s.textContent || "";
        const src = s.getAttribute("src") || "";
        return /flexype-sdk|checkout\.flexype\.com|flexy-checkout/i.test(text) || /flexype-sdk|checkout\.flexype\.com|flexy-checkout/i.test(src);
      });
    checkoutDisabledSignals.push({
      name: "Disabled script tags (type='text/plain' or disabled attribute) containing FlexyPe Checkout",
      detected: disabledCheckoutScripts.length > 0,
      weight: 40
    });

    // Check hidden DOM elements
    const hiddenCheckoutElements = H.safeQuerySelectorAll("[id*='flexype-checkout'], [class*='flexype-checkout'], [data-flexype-checkout]")
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === "none" || style.visibility === "hidden" || el.hasAttribute("hidden") || el.style.display === "none";
      });
    checkoutDisabledSignals.push({
      name: "FlexyPe Checkout DOM containers found but hidden (display:none or visibility:hidden)",
      detected: hiddenCheckoutElements.length > 0,
      weight: 35
    });

    // Configuration flags showing disabled
    const configGlobal = H.getGlobalValue("FlexyPeConfig") || H.getGlobalValue("FlexyPeCheckoutInstance.config");
    const isConfigDisabled = configGlobal && (configGlobal.enabled === false || configGlobal.active === false || configGlobal.disabled === true);
    checkoutDisabledSignals.push({
      name: "Global FlexyPeConfig variable explicitly disables checkout",
      detected: !!isConfigDisabled,
      weight: 30
    });


    // Detect disabled FlexyPass
    const passDisabledSignals = [];
    
    const passComments = H.searchComments(/flexype-pass|flexypass/i);
    passDisabledSignals.push({
      name: "Commented references to FlexyPass in DOM",
      detected: passComments.length > 0,
      weight: 35
    });

    const disabledPassScripts = H.safeQuerySelectorAll("script[type='text/plain'], script[type='text/x-template'], script[disabled]")
      .filter(s => {
        const text = s.textContent || "";
        const src = s.getAttribute("src") || "";
        return /flexype-pass|pass\.flexype\.com|flexypass/i.test(text) || /flexype-pass|pass\.flexype\.com|flexypass/i.test(src);
      });
    passDisabledSignals.push({
      name: "Disabled script tags containing FlexyPass",
      detected: disabledPassScripts.length > 0,
      weight: 40
    });

    const hiddenPassElements = H.safeQuerySelectorAll("[id*='flexypass'], [class*='flexypass'], [data-flexypass], flexy-pass, flexype-pass")
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === "none" || style.visibility === "hidden" || el.hasAttribute("hidden") || el.style.display === "none";
      });
    passDisabledSignals.push({
      name: "FlexyPass DOM containers found but hidden",
      detected: hiddenPassElements.length > 0,
      weight: 35
    });

    const passConfigGlobal = H.getGlobalValue("FlexyPassConfig");
    const isPassConfigDisabled = passConfigGlobal && (passConfigGlobal.enabled === false || passConfigGlobal.active === false);
    passDisabledSignals.push({
      name: "Global FlexyPassConfig variable explicitly disables app",
      detected: !!isPassConfigDisabled,
      weight: 30
    });


    // Detect disabled FlexyCart
    const cartDisabledSignals = [];
    
    const cartComments = H.searchComments(/flexype-cart|flexycart/i);
    cartDisabledSignals.push({
      name: "Commented references to FlexyCart in DOM",
      detected: cartComments.length > 0,
      weight: 35
    });

    const disabledCartScripts = H.safeQuerySelectorAll("script[type='text/plain'], script[type='text/x-template'], script[disabled]")
      .filter(s => {
        const text = s.textContent || "";
        const src = s.getAttribute("src") || "";
        return /flexype-cart|cart\.flexype\.com|flexycart/i.test(text) || /flexype-cart|cart\.flexype\.com|flexycart/i.test(src);
      });
    cartDisabledSignals.push({
      name: "Disabled script tags containing FlexyCart",
      detected: disabledCartScripts.length > 0,
      weight: 40
    });

    const hiddenCartElements = H.safeQuerySelectorAll("[id*='flexy-cart'], [class*='flexy-cart'], [data-flexycart], #flexy-cart, .flexy-cart-drawer")
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === "none" || style.visibility === "hidden" || el.hasAttribute("hidden") || el.style.display === "none";
      });
    cartDisabledSignals.push({
      name: "FlexyCart DOM containers found but hidden",
      detected: hiddenCartElements.length > 0,
      weight: 35
    });

    const cartConfigGlobal = H.getGlobalValue("FlexyCartConfig");
    const isCartConfigDisabled = cartConfigGlobal && (cartConfigGlobal.enabled === false || cartConfigGlobal.active === false);
    cartDisabledSignals.push({
      name: "Global FlexyCartConfig variable explicitly disables cart",
      detected: !!isCartConfigDisabled,
      weight: 30
    });

    // Formatting evaluation results
    const checkoutResult = H.evaluateDetection(checkoutDisabledSignals);
    const passResult = H.evaluateDetection(passDisabledSignals);
    const cartResult = H.evaluateDetection(cartDisabledSignals);

    return {
      checkout: {
        ...checkoutResult,
        reason: checkoutResult.status !== Status.NOT_DETECTED ? "FlexyPe Checkout configuration files, DOM nodes, or scripts found but marked as inactive, commented, or styled display:none." : "No signals of disabled checkout integration."
      },
      pass: {
        ...passResult,
        reason: passResult.status !== Status.NOT_DETECTED ? "FlexyPass files, login triggers, or configuration parameters found in commented block/hidden DOM status." : "No signals of disabled authentication integration."
      },
      cart: {
        ...cartResult,
        reason: cartResult.status !== Status.NOT_DETECTED ? "FlexyCart elements found in DOM with stylesheet display:none configuration or inactive config variables." : "No signals of disabled cart integration."
      }
    };
  }
};
// Third-Party App Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.AppDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;
    const Constants = window.__shopifyDiagnostics.Constants;
    const detectedApps = [];

    Constants.THIRD_PARTY_APPS.forEach(app => {
      const signals = [];

      // Generate script URL signals
      app.scripts.forEach(scr => {
        signals.push({
          name: `Script file pattern '${scr}' loaded`,
          detected: H.hasScript(scr),
          weight: 40
        });
      });

      // Generate window global variable signals
      app.globals.forEach(glob => {
        signals.push({
          name: `Window global '${glob}' active`,
          detected: H.hasGlobal(glob),
          weight: 40
        });
      });

      // Generate DOM element signals
      app.dom.forEach(selector => {
        signals.push({
          name: `DOM selector '${selector}' exists`,
          detected: H.safeQuerySelector(selector) !== null,
          weight: 35
        });
      });

      const evaluation = H.evaluateDetection(signals);
      
      // If we got positive confidence signals, classify it
      if (evaluation.status !== Constants.DETECTION_STATUS.NOT_DETECTED) {
        detectedApps.push({
          name: app.name,
          ...evaluation
        });
      }
    });

    return detectedApps;
  }
};
// Store Feature Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FeatureDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;

    const translateStatus = (evaluatedResult) => {
      let status = "Not Present";
      if (evaluatedResult.status === "Detected") {
        status = "Present";
      } else if (evaluatedResult.status === "Possible") {
        status = "Possible";
      }
      return {
        status: status,
        confidence: evaluatedResult.confidence,
        evidence: evaluatedResult.evidence
      };
    };

    // 1. Search
    const searchSignals = [
      {
        name: "Standard search form (action='/search') found",
        detected: H.safeQuerySelector("form[action*='/search']") !== null,
        weight: 60
      },
      {
        name: "Search query input (name='q') found",
        detected: H.safeQuerySelector("input[name='q']") !== null,
        weight: 40
      }
    ];

    // 2. Predictive Search
    const predictiveSignals = [
      {
        name: "Predictive search custom element found",
        detected: H.safeQuerySelector("predictive-search, .predictive-search") !== null,
        weight: 45
      },
      {
        name: "Input element with predictive search actions or aria-autocomplete found",
        detected: H.safeQuerySelector("input[aria-autocomplete='list'], input[data-predictive-search-input]") !== null,
        weight: 35
      },
      {
        name: "Predictive search core script references found",
        detected: H.hasScript(/predictive-search/i),
        weight: 20
      }
    ];

    // 3. Wishlist
    const wishlistSignals = [
      {
        name: "Wishlist buttons or links found in DOM",
        detected: H.safeQuerySelector("[class*='wishlist'], [id*='wishlist'], [data-wishlist]") !== null,
        weight: 50
      },
      {
        name: "Third-party wishlist app script (like Swym / Smart Wishlist) detected",
        detected: H.hasScript(/swym/i) || H.hasScript(/wishlist/i) || H.hasGlobal("Swym"),
        weight: 50
      }
    ];

    // 4. Customer Login
    const loginSignals = [
      {
        name: "Login link or action path (/account/login) found",
        detected: H.safeQuerySelector("a[href*='/account/login']") !== null,
        weight: 60
      },
      {
        name: "Login input form action (/account/login) found",
        detected: H.safeQuerySelector("form[action*='/account/login']") !== null,
        weight: 40
      }
    ];

    // 5. Customer Accounts
    const accountSignals = [
      {
        name: "Account settings path (/account) or logout path found",
        detected: H.safeQuerySelector("a[href='/account'], a[href*='/account/logout']") !== null,
        weight: 60
      },
      {
        name: "Shopify customer accounts global variable registered",
        detected: H.hasGlobal("Shopify.checkout.customer_id") || H.safeQuerySelector("meta[name='shopify-customer-id']") !== null,
        weight: 40
      }
    ];

    // 6. Currency Selector
    const currencySignals = [
      {
        name: "Form action targeting /localization found with currency_code",
        detected: H.safeQuerySelector("form[action*='/localization'] select[name='currency_code'], form[action*='/localization'] input[name='currency_code']") !== null,
        weight: 50
      },
      {
        name: "Currency switcher selector / custom buttons found",
        detected: H.safeQuerySelector("[data-currency-selector], .currency-selector, select.currency-picker") !== null,
        weight: 50
      }
    ];

    // 7. Language Selector
    const languageSignals = [
      {
        name: "Form action targeting /localization found with locale_code",
        detected: H.safeQuerySelector("form[action*='/localization'] select[name='locale_code'], form[action*='/localization'] input[name='locale_code']") !== null,
        weight: 50
      },
      {
        name: "Language selector elements found in header or footer",
        detected: H.safeQuerySelector("[data-language-selector], .language-selector, .locale-selector") !== null,
        weight: 50
      }
    ];

    // 8. Cart Drawer
    const cartDrawerSignals = [
      {
        name: "Cart drawer DOM container classes found",
        detected: H.safeQuerySelector("[class*='cart-drawer'], [id*='CartDrawer'], [class*='mini-cart'], [class*='ajax-cart']") !== null,
        weight: 60
      },
      {
        name: "Cart drawer HTML features or triggers found",
        detected: H.safeQuerySelector("[data-cart-drawer-toggle], [aria-controls*='CartDrawer']") !== null,
        weight: 40
      }
    ];

    // 9. Quick View
    const quickViewSignals = [
      {
        name: "Quick view classes, buttons or details in DOM",
        detected: H.safeQuerySelector("[class*='quick-view'], [class*='quickview'], [data-quickview], .js-quick-view") !== null,
        weight: 60
      },
      {
        name: "Quick view attributes or template handles loaded",
        detected: H.safeQuerySelector("[id*='quick-view'], [data-action='quick-view']") !== null,
        weight: 40
      }
    ];

    // 10. Recently Viewed
    const recentlyViewedSignals = [
      {
        name: "Recently viewed wrapper or container class encountered",
        detected: H.safeQuerySelector("[class*='recently-viewed'], [id*='recently-viewed']") !== null,
        weight: 60
      },
      {
        name: "Recently viewed cookies or localStorage cache verified",
        detected: (() => {
          try {
            return localStorage.getItem("shopify_recently_viewed") !== null || 
                   localStorage.getItem("recently-viewed-products") !== null ||
                   document.cookie.includes("recently_viewed");
          } catch(e) { return false; }
        })(),
        weight: 40
      }
    ];

    // 11. Newsletter
    const newsletterSignals = [
      {
        name: "Newsletter tag input tag (contact[tags] = newsletter) found",
        detected: H.safeQuerySelector("form input[name='contact[tags]'][value*='newsletter']") !== null,
        weight: 60
      },
      {
        name: "Newsletter form layout, classes, or IDs present",
        detected: H.safeQuerySelector("form[class*='newsletter'], .newsletter-form, #newsletter-form") !== null,
        weight: 40
      }
    ];

    // 12. Chat Widget
    const chatSignals = [
      {
        name: "Known support/chat widget markup or triggers found (Shopify Chat, Gorgias, Crisp, HelpScout)",
        detected: H.safeQuerySelector("#shopify-chat, #gorgias-chat-container, #crisp-chatbox, #ze-container, #intercom-container") !== null,
        weight: 60
      },
      {
        name: "Active global chat constructors on window",
        detected: H.hasGlobal("GorgiasChat") || H.hasGlobal("$crisp") || H.hasGlobal("zE") || H.hasGlobal("Intercom") || H.hasGlobal("Tawk_API"),
        weight: 40
      }
    ];

    // 13. Reviews
    const reviewsSignals = [
      {
        name: "Reviews wrappers (Shopify Reviews, Judge.me, Loox, Yotpo) found",
        detected: H.safeQuerySelector("#shopify-product-reviews, .spr-reviews, .jdgm-widget, #looxReviews, .yotpo-main-widget, .yotpo-review") !== null,
        weight: 60
      },
      {
        name: "Reviews global properties active",
        detected: H.hasGlobal("jdgm") || H.hasGlobal("LOOX") || H.hasGlobal("yotpo"),
        weight: 40
      }
    ];

    // 14. Product Recommendations
    const recsSignals = [
      {
        name: "Product recommendation tags or section classes present",
        detected: H.safeQuerySelector(".product-recommendations, #product-recommendations, [data-recommendations-url]") !== null,
        weight: 60
      },
      {
        name: "Targeting recommend scripts or Shopify Recommendations API loaded",
        detected: H.safeQuerySelector("[data-url*='/recommendations/products']") !== null || H.hasScript(/recommendations/i),
        weight: 40
      }
    ];

    // 15. Infinite Scroll
    const scrollSignals = [
      {
        name: "AJAX load more/infinite scroll tags or classes found",
        detected: H.safeQuerySelector(".infinite-scroll, .ajax-load-more, [data-infinite-scroll]") !== null,
        weight: 60
      },
      {
        name: "Infinite scrolling library paths in DOM scripts",
        detected: H.hasScript(/infinite-scroll/i) || H.hasScript(/ajax-scroll/i) || H.hasScript(/ias\.min\.js/i),
        weight: 40
      }
    ];

    return {
      search: translateStatus(H.evaluateDetection(searchSignals)),
      predictiveSearch: translateStatus(H.evaluateDetection(predictiveSignals)),
      wishlist: translateStatus(H.evaluateDetection(wishlistSignals)),
      customerLogin: translateStatus(H.evaluateDetection(loginSignals)),
      customerAccounts: translateStatus(H.evaluateDetection(accountSignals)),
      currencySelector: translateStatus(H.evaluateDetection(currencySignals)),
      languageSelector: translateStatus(H.evaluateDetection(languageSignals)),
      cartDrawer: translateStatus(H.evaluateDetection(cartDrawerSignals)),
      quickView: translateStatus(H.evaluateDetection(quickViewSignals)),
      recentlyViewed: translateStatus(H.evaluateDetection(recentlyViewedSignals)),
      newsletter: translateStatus(H.evaluateDetection(newsletterSignals)),
      chatWidget: translateStatus(H.evaluateDetection(chatSignals)),
      reviews: translateStatus(H.evaluateDetection(reviewsSignals)),
      productRecommendations: translateStatus(H.evaluateDetection(recsSignals)),
      infiniteScroll: translateStatus(H.evaluateDetection(scrollSignals))
    };
  }
};
// Content Script wrapper executing detectors and collecting results
(() => {
  try {
    if (!window.__shopifyDiagnostics) {
      return {
        error: "Diagnostics namespaces could not be initialized or files injected out of order.",
        isShopify: false
      };
    }

    const SD = window.__shopifyDiagnostics.StoreDetector;
    const FD = window.__shopifyDiagnostics.FlexyPeDetector;
    const DD = window.__shopifyDiagnostics.DisabledDetector;
    const AD = window.__shopifyDiagnostics.AppDetector;
    const FeatD = window.__shopifyDiagnostics.FeatureDetector;

    // Run Store Detection first
    const storeCheck = SD.detect();
    if (!storeCheck.isShopify) {
      return {
        isShopify: false
      };
    }

    // Run all other detectors
    const flexypeResult = FD.detect();
    const disabledResult = DD.detect();
    const appsResult = AD.detect();
    const featuresResult = FeatD.detect();

    // Pack the final response payload
    return {
      isShopify: true,
      data: {
        storeInfo: storeCheck.data,
        flexypeProducts: flexypeResult,
        disabledIntegrations: disabledResult,
        thirdPartyApps: appsResult,
        storeFeatures: featuresResult
      }
    };
  } catch (e) {
    return {
      error: e.message || "Failed running DOM inspections",
      isShopify: false
    };
  }
})();
