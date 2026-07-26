// FlexyPe Products Detection Engine for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FlexyPeDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;

    // FlexyPe Checkout — 7 weighted signals
    var checkoutSignals = [
      {
        name: "Global object 'FlexyPe', 'FlexyPeCheckoutInstance', or 'FlexyCheckout' found",
        detected: H.hasGlobal("FlexyPe") || H.hasGlobal("FlexyPeCheckoutInstance") || H.hasGlobal("FlexyCheckout"),
        weight: 40
      },
      {
        name: "FlexyPe Checkout external JavaScript file loaded",
        detected: H.hasScriptSrc(/flexype-sdk|checkout\.flexype\.com|cdn\.flexype\.com\/checkout|flexy-checkout/i),
        weight: 35
      },
      {
        name: "FlexyPe Checkout inline configuration found in page scripts",
        detected: H.hasInlineScript(/flexype.*checkout|FlexyPeCheckout|flexy-checkout-config/i),
        weight: 15
      },
      {
        name: "FlexyPe Checkout DOM containers or buttons present",
        detected:
          H.safeQuerySelector("#flexype-checkout-container") !== null ||
          H.safeQuerySelector(".flexype-checkout-button") !== null ||
          H.safeQuerySelector("[data-flexype-checkout]") !== null,
        weight: 20
      },
      {
        name: "FlexyPe Custom Elements (<flexype-checkout> or <flexype-button>) present",
        detected: H.safeQuerySelector("flexype-checkout, flexype-button") !== null,
        weight: 15
      },
      {
        name: "FlexyPe Checkout stylesheets linked",
        detected: H.hasStylesheet(/flexype/i) || H.hasStylesheet(/flexy-checkout/i),
        weight: 10
      },
      {
        name: "Data attributes matching FlexyPe Checkout pattern found",
        detected: H.safeQuerySelector("[data-flexype], [data-flexy-checkout]") !== null,
        weight: 10
      }
    ];

    // FlexyPass — 6 weighted signals
    var passSignals = [
      {
        name: "Global object 'FlexyPass' or 'FlexyPassInstance' found",
        detected: H.hasGlobal("FlexyPass") || H.hasGlobal("FlexyPassInstance"),
        weight: 40
      },
      {
        name: "FlexyPass external JavaScript file loaded",
        detected: H.hasScriptSrc(/flexype-pass|pass\.flexype\.com|flexypass/i),
        weight: 35
      },
      {
        name: "FlexyPass inline configuration found in page scripts",
        detected: H.hasInlineScript(/flexype.*pass|FlexyPassConfig|flexypass-config/i),
        weight: 15
      },
      {
        name: "FlexyPass login button, selector, or profile container present",
        detected:
          H.safeQuerySelector(".flexypass-login-btn") !== null ||
          H.safeQuerySelector("[data-flexypass]") !== null ||
          H.safeQuerySelector("#flexypass-profile") !== null,
        weight: 25
      },
      {
        name: "FlexyPass Custom Elements (<flexy-pass> or <flexype-pass>) present",
        detected: H.safeQuerySelector("flexy-pass, flexype-pass") !== null,
        weight: 15
      },
      {
        name: "FlexyPass stylesheets linked",
        detected: H.hasStylesheet(/flexypass/i) || H.hasStylesheet(/flexype-pass/i),
        weight: 10
      }
    ];

    // FlexyCart — 6 weighted signals
    var cartSignals = [
      {
        name: "Global object 'FlexyCart' or 'FlexyCartInstance' found",
        detected: H.hasGlobal("FlexyCart") || H.hasGlobal("FlexyCartInstance"),
        weight: 40
      },
      {
        name: "FlexyCart external JavaScript file loaded",
        detected: H.hasScriptSrc(/flexype-cart|cart\.flexype\.com|flexycart/i),
        weight: 35
      },
      {
        name: "FlexyCart inline configuration found in page scripts",
        detected: H.hasInlineScript(/flexype.*cart|FlexyCartConfig|flexycart-config/i),
        weight: 15
      },
      {
        name: "FlexyCart drawer, trigger, or container elements found in DOM",
        detected:
          H.safeQuerySelector("#flexy-cart") !== null ||
          H.safeQuerySelector(".flexy-cart-drawer") !== null ||
          H.safeQuerySelector(".flexy-cart-trigger") !== null ||
          H.safeQuerySelector("[data-flexycart]") !== null,
        weight: 25
      },
      {
        name: "FlexyCart CSS class or ID patterns found in DOM",
        detected: H.safeQuerySelector("[class*='flexy-cart-'], [id*='flexy-cart-']") !== null,
        weight: 15
      },
      {
        name: "FlexyCart stylesheets linked",
        detected: H.hasStylesheet(/flexycart/i) || H.hasStylesheet(/flexy-cart/i),
        weight: 10
      }
    ];

    return {
      checkout: H.evaluateDetection(checkoutSignals),
      pass: H.evaluateDetection(passSignals),
      cart: H.evaluateDetection(cartSignals)
    };
  }
};
