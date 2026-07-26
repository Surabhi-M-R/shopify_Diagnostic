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
