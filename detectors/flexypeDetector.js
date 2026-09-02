// Backward-compatible redirect stub for StackDetector in Shopify Store Inspector Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FlexyPeDetector = {
  detect: function() {
    if (window.__shopifyDiagnostics.StackDetector) {
      return window.__shopifyDiagnostics.StackDetector.detect();
    }
    return { checkout: { status: "Unavailable", confidence: 0, evidence: [] } };
  }
};
