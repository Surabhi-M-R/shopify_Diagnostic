// Third-Party App Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.AppDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;
    const Constants = window.__shopifyDiagnostics.Constants;
    const detectedApps = [];

    Constants.THIRD_PARTY_APPS.forEach(app => {
      const signals = [];

      // Generate script URL signals
      app.scripts.forEach(scr => {
        signals.push({
          name: `Script file pattern '${scr}' loaded`,
          detected: H.hasScript(scr),
          weight: 40
        });
      });

      // Generate window global variable signals
      app.globals.forEach(glob => {
        signals.push({
          name: `Window global '${glob}' active`,
          detected: H.hasGlobal(glob),
          weight: 40
        });
      });

      // Generate DOM element signals
      app.dom.forEach(selector => {
        signals.push({
          name: `DOM selector '${selector}' exists`,
          detected: H.safeQuerySelector(selector) !== null,
          weight: 35
        });
      });

      const evaluation = H.evaluateDetection(signals);
      
      // If we got positive confidence signals, classify it
      if (evaluation.status !== Constants.DETECTION_STATUS.NOT_DETECTED) {
        detectedApps.push({
          name: app.name,
          ...evaluation
        });
      }
    });

    return detectedApps;
  }
};
