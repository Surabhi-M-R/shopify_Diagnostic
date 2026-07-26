// Disabled Integration Detector for Shopify Store Diagnostics Extension
// DRY refactored: uses parameterized _detectDisabledProduct helper
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.DisabledDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;
    var Status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS;
    var self = this;

    var products = [
      {
        key: "checkout",
        name: "FlexyPe Checkout",
        commentRegex: /flexype-checkout|flexy-checkout/i,
        scriptRegex: /flexype-sdk|checkout\.flexype\.com|flexy-checkout/i,
        domSelectors: "[id*='flexype-checkout'], [class*='flexype-checkout'], [data-flexype-checkout]",
        configGlobals: ["FlexyPeConfig", "FlexyPeCheckoutInstance.config"],
        reasonActive: "No signals of disabled checkout integration.",
        reasonInactive: "FlexyPe Checkout configuration files, DOM nodes, or scripts found but marked as inactive, commented, or styled display:none."
      },
      {
        key: "pass",
        name: "FlexyPass",
        commentRegex: /flexype-pass|flexypass/i,
        scriptRegex: /flexype-pass|pass\.flexype\.com|flexypass/i,
        domSelectors: "[id*='flexypass'], [class*='flexypass'], [data-flexypass], flexy-pass, flexype-pass",
        configGlobals: ["FlexyPassConfig"],
        reasonActive: "No signals of disabled authentication integration.",
        reasonInactive: "FlexyPass files, login triggers, or configuration parameters found in commented block/hidden DOM status."
      },
      {
        key: "cart",
        name: "FlexyCart",
        commentRegex: /flexype-cart|flexycart/i,
        scriptRegex: /flexype-cart|cart\.flexype\.com|flexycart/i,
        domSelectors: "[id*='flexy-cart'], [class*='flexy-cart'], [data-flexycart], #flexy-cart, .flexy-cart-drawer",
        configGlobals: ["FlexyCartConfig"],
        reasonActive: "No signals of disabled cart integration.",
        reasonInactive: "FlexyCart elements found in DOM with stylesheet display:none configuration or inactive config variables."
      }
    ];

    var results = {};
    products.forEach(function(product) {
      var evaluation = self._detectDisabledProduct(H, product);
      results[product.key] = {
        status: evaluation.status,
        confidence: evaluation.confidence,
        evidence: evaluation.evidence,
        reason: evaluation.status !== Status.NOT_DETECTED ? product.reasonInactive : product.reasonActive
      };
    });

    return results;
  },

  /**
   * Parameterized disabled product detection — eliminates code duplication
   * Uses cached helpers for comments, disabled scripts, and hidden elements
   */
  _detectDisabledProduct: function(H, config) {
    var signals = [];

    // 1. HTML comment references (uses cached comment nodes)
    var commentMatches = H.searchComments(config.commentRegex);
    signals.push({
      name: "Commented references to " + config.name + " in DOM",
      detected: commentMatches.length > 0,
      weight: 35
    });

    // 2. Disabled script tags (uses cached disabled scripts)
    var disabledScripts = H.getDisabledScripts(config.scriptRegex);
    signals.push({
      name: "Disabled script tags (type='text/plain' or disabled attribute) containing " + config.name,
      detected: disabledScripts.length > 0,
      weight: 40
    });

    // 3. Hidden DOM elements (computed style check)
    var hiddenElements = H.findHiddenElements(config.domSelectors);
    signals.push({
      name: config.name + " DOM containers found but hidden (display:none or visibility:hidden)",
      detected: hiddenElements.length > 0,
      weight: 35
    });

    // 4. Global configuration flags showing disabled
    var isConfigDisabled = false;
    config.configGlobals.forEach(function(globalPath) {
      var val = H.getGlobalValue(globalPath);
      if (val && (val.enabled === false || val.active === false || val.disabled === true)) {
        isConfigDisabled = true;
      }
    });
    signals.push({
      name: "Global config variable explicitly disables " + config.name,
      detected: isConfigDisabled,
      weight: 30
    });

    return H.evaluateDetection(signals);
  }
};
