// Store Information Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.StoreDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;
    var Types = window.__shopifyDiagnostics.Constants.PAGE_TYPES;

    // Multi-signal Shopify verification (8 independent signals)
    var isShopify =
      H.hasGlobal("Shopify") ||
      H.hasGlobal("ShopifyAnalytics") ||
      H.safeQuerySelector("link[href*='cdn.shopify.com']") !== null ||
      H.safeQuerySelector("script[src*='cdn.shopify.com']") !== null ||
      H.safeQuerySelector("link[rel='preconnect'][href*='cdn.shopify.com']") !== null ||
      H.getMetaContent("shopify-digital-wallet") !== null ||
      H.getMetaContent("shopify-checkout-api-token") !== null ||
      H.getMetaContent("shopify-features") !== null;

    if (!isShopify) {
      return { isShopify: false, data: null };
    }

    var hostname = window.location.hostname;
    var url = window.location.href;

    // Shopify domain — cascading fallbacks
    var shopifyDomain =
      H.getGlobalValue("Shopify.shop") ||
      H.getGlobalValue("ShopifyAnalytics.lib.treasury.shop") || "";
    if (!shopifyDomain) {
      var shopifyLink = H.safeQuerySelector("link[href*='.myshopify.com']");
      if (shopifyLink) {
        var match = shopifyLink.href.match(/([a-zA-Z0-9-]+\.myshopify\.com)/);
        if (match) shopifyDomain = match[1];
      }
    }
    if (!shopifyDomain) {
      var cdnScript = H.safeQuerySelector("script[src*='.myshopify.com']");
      if (cdnScript) {
        var m2 = cdnScript.src.match(/([a-zA-Z0-9-]+\.myshopify\.com)/);
        if (m2) shopifyDomain = m2[1];
      }
    }

    // Shop Name — cascading fallbacks
    var shopName =
      H.getMetaContent("og:site_name") ||
      (shopifyDomain ? shopifyDomain.split(".")[0] : "") ||
      document.title || "";
    if (shopName.includes(".myshopify")) shopName = shopName.split(".")[0];

    // Locale — 4-level cascade
    var locale =
      H.getGlobalValue("Shopify.locale") ||
      H.getGlobalValue("ShopifyAnalytics.meta.page.locale") ||
      H.getMetaContent("content-language") ||
      document.documentElement.lang || "";

    var country =
      H.getGlobalValue("Shopify.country") ||
      H.getGlobalValue("ShopifyAnalytics.meta.page.country") || "";

    var currency =
      H.getGlobalValue("Shopify.currency.active") ||
      H.getGlobalValue("ShopifyAnalytics.meta.currency") || "";

    // Theme info — cache getGlobalValue calls
    var themeObj = H.getGlobalValue("Shopify.theme") || {};
    var themeName = themeObj.name || "Unknown Theme";
    var themeId = themeObj.id ? String(themeObj.id) : "Unknown";
    var themeRole = themeObj.role || "Unknown";
    var themeStoreId = themeObj.theme_store_id ? String(themeObj.theme_store_id) : "Custom/Unknown";

    // CDN host for diagnostics
    var cdnHost = H.getGlobalValue("Shopify.cdnHost") || "";

    // Page type — triple-layer detection
    var pageType = this.detectPageType(Types, H);

    return {
      isShopify: true,
      data: {
        hostname: hostname,
        shopName: shopName,
        shopifyDomain: shopifyDomain,
        locale: locale,
        country: country,
        currency: currency,
        cdnHost: cdnHost,
        themeName: themeName,
        themeId: themeId,
        themeRole: themeRole,
        themeStoreId: themeStoreId,
        pageType: pageType
      }
    };
  },

  detectPageType: function(Types, H) {
    // Layer 1: Shopify Analytics meta (most reliable)
    var rawPageType = H.getGlobalValue("ShopifyAnalytics.meta.page.pageType");
    if (rawPageType) {
      var mapping = {
        "index": Types.HOME, "product": Types.PRODUCT, "collection": Types.COLLECTION,
        "cart": Types.CART, "search": Types.SEARCH, "blog": Types.BLOG,
        "article": Types.ARTICLE, "checkout": Types.CHECKOUT, "404": Types.NOT_FOUND,
        "page": Types.PAGE, "list-collections": Types.COLLECTION_LIST
      };
      if (mapping[rawPageType]) return mapping[rawPageType];
    }

    // Layer 1b: Shopify routes object
    var resourceType = H.getGlobalValue("ShopifyAnalytics.meta.page.resourceType");
    if (resourceType) {
      var resMapping = {
        "product": Types.PRODUCT, "collection": Types.COLLECTION,
        "article": Types.ARTICLE, "blog": Types.BLOG, "page": Types.PAGE
      };
      if (resMapping[resourceType]) return resMapping[resourceType];
    }

    // Layer 2: pathname + body classes + data attributes
    var pathname = window.location.pathname;
    var body = H.safeQuerySelector("body");
    var bodyClasses = body ? Array.from(body.classList) : [];
    var bodyTemplate = body ? (body.getAttribute("data-template") || "") : "";

    // Customer pages
    if (pathname.startsWith("/account/login") || bodyClasses.includes("template-customers-login")) return Types.CUSTOMER_LOGIN;
    if (pathname.startsWith("/account/register") || bodyClasses.includes("template-customers-register")) return Types.CUSTOMER_REGISTER;
    if (pathname.startsWith("/account") || bodyClasses.includes("template-customers-account")) return Types.CUSTOMER_ACCOUNT;
    if (pathname.startsWith("/checkout")) return Types.CHECKOUT;

    // Standard pages
    if (pathname === "/" || pathname === "/index" || bodyTemplate === "index" || bodyClasses.some(function(c) { return c.includes("template-index") || c === "index"; })) return Types.HOME;
    if (pathname.startsWith("/products/") || bodyTemplate === "product" || bodyClasses.some(function(c) { return c.includes("template-product"); })) return Types.PRODUCT;
    if (pathname.startsWith("/collections/") || bodyTemplate === "collection" || bodyClasses.some(function(c) { return c.includes("template-collection"); })) return Types.COLLECTION;
    if (pathname === "/cart" || pathname.startsWith("/cart/") || bodyTemplate === "cart" || bodyClasses.some(function(c) { return c.includes("template-cart"); })) return Types.CART;
    if (pathname === "/search" || pathname.startsWith("/search/") || bodyClasses.some(function(c) { return c.includes("template-search"); })) return Types.SEARCH;

    // Blog articles: /blogs/{handle}/{article-handle} — must have exactly 4 segments (not counting trailing slash)
    var cleanPath = pathname.replace(/\/$/, ""); // strip trailing slash
    var segments = cleanPath.split("/").filter(Boolean);
    if (pathname.startsWith("/blogs/") && segments.length >= 3) return Types.ARTICLE;
    if (pathname.startsWith("/blogs/") || bodyClasses.some(function(c) { return c.includes("template-blog"); })) return Types.BLOG;

    // Static pages
    if (pathname.startsWith("/pages/") || bodyTemplate === "page" || bodyClasses.some(function(c) { return c.includes("template-page"); })) return Types.PAGE;

    // 404
    if (bodyClasses.some(function(c) { return c.includes("template-404") || c === "404"; })) return Types.NOT_FOUND;

    // Layer 3: title fallback
    var title = (document.title || "").toLowerCase();
    if (title.includes("page not found") || title.includes("404")) return Types.NOT_FOUND;

    return Types.UNKNOWN;
  }
};
