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
