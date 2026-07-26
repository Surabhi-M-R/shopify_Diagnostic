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
