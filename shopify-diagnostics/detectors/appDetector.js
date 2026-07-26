// Third-Party App Detector for Shopify Store Diagnostics Extension
// Collapsed signal categories: one signal per category (scripts, globals, dom)
// for accurate confidence scoring with the evaluateDetection threshold system
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.AppDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;
    var Constants = window.__shopifyDiagnostics.Constants;
    var detectedApps = [];

    Constants.THIRD_PARTY_APPS.forEach(function(app) {
      var signals = [];

      // Collapsed script signal — ANY matching script pattern counts as one signal
      if (app.scripts.length > 0) {
        var scriptDetected = app.scripts.some(function(scr) { return H.hasScript(scr); });
        signals.push({
          name: "Script file loaded (" + app.scripts.join(" | ") + ")",
          detected: scriptDetected,
          weight: 50
        });
      }

      // Collapsed global signal — ANY matching global counts as one signal
      if (app.globals.length > 0) {
        var globalDetected = app.globals.some(function(glob) { return H.hasGlobal(glob); });
        signals.push({
          name: "Window global active (" + app.globals.join(" | ") + ")",
          detected: globalDetected,
          weight: 50
        });
      }

      // Collapsed DOM signal — ANY matching selector counts as one signal
      if (app.dom.length > 0) {
        var domDetected = app.dom.some(function(selector) {
          return H.safeQuerySelector(selector) !== null;
        });
        signals.push({
          name: "DOM element present (" + app.dom.join(" | ") + ")",
          detected: domDetected,
          weight: 30
        });
      }

      // Use 60% threshold for apps (script+global = 100/130 = 77% → Possible, need DOM too for Detected)
      // For apps without DOM selectors (analytics/pixels), script+global = 100/100 = 100% → Detected
      var evaluation = H.evaluateDetection(signals, 60);

      if (evaluation.status !== Constants.DETECTION_STATUS.NOT_DETECTED) {
        detectedApps.push({
          name: app.name,
          status: evaluation.status,
          confidence: evaluation.confidence,
          evidence: evaluation.evidence
        });
      }
    });

    return detectedApps;
  }
};
