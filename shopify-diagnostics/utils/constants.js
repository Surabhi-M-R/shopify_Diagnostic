// Constants for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Constants = {
  PAGE_TYPES: {
    HOME: "Home",
    PRODUCT: "Product",
    COLLECTION: "Collection",
    COLLECTION_LIST: "Collection List",
    CART: "Cart",
    SEARCH: "Search",
    BLOG: "Blog",
    ARTICLE: "Article",
    PAGE: "Page",
    CUSTOMER_LOGIN: "Customer Login",
    CUSTOMER_REGISTER: "Customer Register",
    CUSTOMER_ACCOUNT: "Customer Account",
    CUSTOMER_ORDERS: "Customer Orders",
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

  // Each entry: { name, scripts (substring patterns), globals, dom (CSS selectors) }
  // scripts are plain substrings — escapeRegex handles literal matching automatically
  THIRD_PARTY_APPS: [
    // Email & Marketing
    {
      name: "Klaviyo",
      scripts: ["klaviyo.js", "static.klaviyo.com"],
      globals: ["klaviyo", "_learnq"],
      dom: [".klaviyo-form", "[data-klaviyo-form]"]
    },
    {
      name: "Omnisend",
      scripts: ["omnisrc.com", "omnisend"],
      globals: ["omnisend", "_omnisend"],
      dom: ["[data-omnisend-form]"]
    },
    {
      name: "Privy",
      scripts: ["privy.com", "widget.privy.com"],
      globals: ["Privy", "__privy_"],
      dom: ["#privy-overlay", ".privy-popup"]
    },
    {
      name: "Mailchimp",
      scripts: ["chimpstatic.com", "list-manage.com"],
      globals: ["mc4wp"],
      dom: [".mc4wp-form", "#mc_embed_signup"]
    },
    // Reviews
    {
      name: "Judge.me",
      scripts: ["judge.me", "judgeme"],
      globals: ["jdgm"],
      dom: [".jdgm-widget", ".jdgm-preview-badge", ".jdgm-rev-widg"]
    },
    {
      name: "Loox",
      scripts: ["loox.io"],
      globals: ["LOOX"],
      dom: ["#looxReviews", ".loox-rating"]
    },
    {
      name: "Yotpo",
      scripts: ["yotpo.com"],
      globals: ["yotpo", "Yotpo"],
      dom: [".yotpo-widget-instance", ".yotpo", ".yotpo-main-widget"]
    },
    {
      name: "Stamped.io",
      scripts: ["stamped.io"],
      globals: ["StampedFn"],
      dom: [".stamped-container", ".stamped-product-reviews-badge"]
    },
    // Shipping & Order
    {
      name: "AfterShip",
      scripts: ["aftership.com"],
      globals: ["AfterShip"],
      dom: [".aftership-widget", "#aftership-body"]
    },
    // Subscriptions
    {
      name: "Recharge",
      scripts: ["rechargeapps.com"],
      globals: ["recharge", "ReCharge"],
      dom: [".rc_container", ".recharge-subscription-widget"]
    },
    // Loyalty
    {
      name: "Smile.io",
      scripts: ["smile.io", "sweettooth"],
      globals: ["Smile", "SweetTooth"],
      dom: ["#smile-ui-container", ".smile-launcher"]
    },
    // Support & Chat
    {
      name: "Gorgias",
      scripts: ["gorgias.io", "gorgias-chat"],
      globals: ["GorgiasChat"],
      dom: ["#gorgias-chat-container"]
    },
    {
      name: "Tidio",
      scripts: ["tidio.co"],
      globals: ["tidioChatApi"],
      dom: ["#tidio-chat"]
    },
    {
      name: "Zendesk",
      scripts: ["assets.zendesk.com"],
      globals: ["zE", "zEmbed"],
      dom: ["#ze-container", "[data-product='web_widget']"]
    },
    {
      name: "Intercom",
      scripts: ["widget.intercom.io"],
      globals: ["Intercom", "intercomSettings"],
      dom: ["#intercom-container"]
    },
    {
      name: "Crisp",
      scripts: ["client.crisp.chat"],
      globals: ["$crisp", "CRISP_WEBSITE_ID"],
      dom: ["#crisp-chatbox"]
    },
    // Analytics & Tracking
    {
      name: "Google Analytics",
      scripts: ["google-analytics.com", "googletagmanager.com/gtag"],
      globals: ["ga", "gtag"],
      dom: []
    },
    {
      name: "Google Tag Manager",
      scripts: ["googletagmanager.com/gtm.js"],
      globals: ["google_tag_manager", "dataLayer"],
      dom: []
    },
    {
      name: "Hotjar",
      scripts: ["hotjar.com"],
      globals: ["hj", "hjSiteSettings"],
      dom: []
    },
    {
      name: "Lucky Orange",
      scripts: ["luckyorange.com"],
      globals: ["_loq", "LOQ"],
      dom: []
    },
    // Pixels
    {
      name: "Meta Pixel",
      scripts: ["fbevents.js", "connect.facebook.net"],
      globals: ["fbq", "_fbq"],
      dom: []
    },
    {
      name: "TikTok Pixel",
      scripts: ["analytics.tiktok.com"],
      globals: ["ttq"],
      dom: []
    },
    {
      name: "Pinterest Tag",
      scripts: ["pinimg.com/ct/core.js"],
      globals: ["pintrk"],
      dom: []
    },
    {
      name: "Snapchat Pixel",
      scripts: ["sc-static.net/scevent"],
      globals: ["snaptr"],
      dom: []
    },
    // Page Builders
    {
      name: "PageFly",
      scripts: ["pagefly"],
      globals: ["__pagefly"],
      dom: [".pagefly-page", "[data-pf-type]"]
    },
    {
      name: "GemPages",
      scripts: ["gempages"],
      globals: [],
      dom: [".gp-page", "[data-gempages]"]
    }
  ]
};
