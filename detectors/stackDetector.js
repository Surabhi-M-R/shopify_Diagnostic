// Core Stack Detector for Shopify Store Inspector Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.StackDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;

    // 1. Checkout & Payment Engine — 7 weighted signals
    var checkoutSignals = [
      {
        name: "Shop Pay or Shopify Digital Wallet API active",
        detected: H.hasGlobal("ShopifyPay") || H.hasGlobal("Shopify.PayWithShop") || H.getMetaContent("shopify-digital-wallet") !== null,
        weight: 35
      },
      {
        name: "Dynamic Payment Buttons present (.shopify-payment-button)",
        detected: H.safeQuerySelector(".shopify-payment-button, [data-shopify-button]") !== null,
        weight: 25
      },
      {
        name: "Express Checkout Payment Gateways (Apple Pay, PayPal, Google Pay, Klarna) present",
        detected: H.safeQuerySelector("[data-shopify-express-checkout], .additional-checkout-buttons, [class*='paypal'], [class*='apple-pay']") !== null,
        weight: 20
      },
      {
        name: "Custom One-Click Checkout SDKs (FlexyPe, Fast, Bold, Skipify) loaded",
        detected: H.hasScriptSrc(/flexype-sdk|checkout\.flexype|fast-checkout|bold.*checkout|skipify/i) || H.hasGlobal("FlexyPe") || H.hasGlobal("BoldCheckout"),
        weight: 20
      }
    ];

    // 2. Customer Authentication & Accounts — 5 weighted signals
    var authSignals = [
      {
        name: "Shopify Customer Account meta or API token active",
        detected: H.getMetaContent("shopify-customer-accounts") !== null || H.hasGlobal("Shopify.customer_accounts_version"),
        weight: 35
      },
      {
        name: "Native Account Login / Register routes or forms present",
        detected: H.safeQuerySelector("form[action*='/account/login'], form[action*='/account'], a[href*='/account/login']") !== null,
        weight: 30
      },
      {
        name: "Passwordless Auth or Third-Party SSO Login Widgets present",
        detected: H.hasScriptSrc(/flexype-pass|pass\.flexype|okta|auth0|social-login/i) || H.hasGlobal("FlexyPass"),
        weight: 20
      },
      {
        name: "Customer Account Profile Containers found in DOM",
        detected: H.safeQuerySelector("#customer_login, .customer-account-link, [data-customer-account]") !== null,
        weight: 15
      }
    ];

    // 3. Cart & Slide Drawer Engine — 6 weighted signals
    var cartSignals = [
      {
        name: "AJAX Slide Drawer Cart elements present in DOM",
        detected: H.safeQuerySelector("#CartDrawer, .cart-drawer, .slide-cart, [data-cart-drawer], #flexy-cart, .upcart-container") !== null,
        weight: 40
      },
      {
        name: "Theme Cart Drawer JS / API configuration detected",
        detected: H.hasGlobal("Shopify.theme.cart") || H.hasInlineScript(/cart.*drawer|slide.*cart|ajax.*cart/i),
        weight: 25
      },
      {
        name: "Third-Party Cart Drawer Scripts (FlexyCart, Upcart, Monster Cart, Slide Cart) loaded",
        detected: H.hasScriptSrc(/flexype-cart|upcart|monstercart|slidecart|cart-drawer/i) || H.hasGlobal("FlexyCart"),
        weight: 20
      },
      {
        name: "Cart Counter / Drawer Trigger buttons active",
        detected: H.safeQuerySelector("[aria-controls='CartDrawer'], [data-cart-trigger], .cart-drawer-toggle") !== null,
        weight: 15
      }
    ];

    return {
      checkout: H.evaluateDetection(checkoutSignals),
      auth: H.evaluateDetection(authSignals),
      cart: H.evaluateDetection(cartSignals)
    };
  }
};
