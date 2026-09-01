// Disabled & Inactive Code Detector for Shopify Store Inspector Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.DisabledDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;
    var Status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS;
    var self = this;

    var categories = [
      {
        key: "checkout",
        name: "Checkout & Payment Widgets",
        commentRegex: /checkout|payment-button|flexy-checkout|express-checkout/i,
        scriptRegex: /checkout|payment|flexype-sdk|bold-checkout/i,
        domSelectors: ".shopify-payment-button, [data-shopify-button], [id*='checkout'], [class*='checkout-button']",
        reasonActive: "No signals of disabled checkout or hidden payment buttons.",
        reasonInactive: "Checkout elements, scripts, or payment buttons found but marked as inactive, disabled, or styled display:none."
      },
      {
        key: "auth",
        name: "Customer Account & Auth Widgets",
        commentRegex: /customer-account|login-widget|flexypass|auth/i,
        scriptRegex: /customer|login|flexype-pass|auth/i,
        domSelectors: "#customer_login, .customer-account-link, [id*='flexypass'], .login-form-container",
        reasonActive: "No signals of disabled authentication or hidden login widgets.",
        reasonInactive: "Customer login forms or authentication widgets found in commented blocks or hidden DOM states."
      },
      {
        key: "cart",
        name: "Cart Drawer & Overlay Engine",
        commentRegex: /cart-drawer|slide-cart|flexycart|ajax-cart/i,
        scriptRegex: /cart-drawer|slide-cart|flexype-cart|upcart/i,
        domSelectors: "#CartDrawer, .cart-drawer, .slide-cart, [id*='flexy-cart'], .cart-drawer-toggle",
        reasonActive: "No signals of disabled cart drawer modules.",
        reasonInactive: "Cart drawer components found in DOM with stylesheet display:none configuration or disabled script wrappers."
      }
    ];

    var results = {};
    categories.forEach(function(cat) {
      var evaluation = self._detectDisabledCategory(H, cat);
      results[cat.key] = {
        status: evaluation.status,
        confidence: evaluation.confidence,
        evidence: evaluation.evidence,
        reason: evaluation.status !== Status.NOT_DETECTED ? cat.reasonInactive : cat.reasonActive
      };
    });

    return results;
  },

  _detectDisabledCategory: function(H, config) {
    var signals = [];

    // 1. HTML comment references
    var commentMatches = H.searchComments(config.commentRegex);
    signals.push({
      name: "Commented references to " + config.name + " in DOM",
      detected: commentMatches.length > 0,
      weight: 35
    });

    // 2. Disabled script tags
    var disabledScripts = H.getDisabledScripts(config.scriptRegex);
    signals.push({
      name: "Disabled script tags (type='text/plain' or [disabled]) matching " + config.name,
      detected: disabledScripts.length > 0,
      weight: 40
    });

    // 3. Hidden DOM elements
    var hiddenElements = H.findHiddenElements(config.domSelectors);
    signals.push({
      name: config.name + " containers found but hidden (display:none or visibility:hidden)",
      detected: hiddenElements.length > 0,
      weight: 35
    });

    return H.evaluateDetection(signals);
  }
};
