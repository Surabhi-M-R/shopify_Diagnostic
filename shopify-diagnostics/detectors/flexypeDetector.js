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
