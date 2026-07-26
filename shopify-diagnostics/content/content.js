// Content Aggregator — runs last in MAIN world injection sequence.
// Initializes scan context, runs all detectors, cleans up, and returns payload.
(function() {
  try {
    var NS = window.__shopifyDiagnostics;
    var H = NS.Helpers;

    // Initialize cached DOM context (single DOM walk for all detectors)
    H.initContext();

    // 1. Store Detection (is this Shopify + metadata)
    var storeResult = NS.StoreDetector.detect();

    if (!storeResult.isShopify) {
      H.resetContext();
      return { isShopify: false, data: null };
    }

    // 2. FlexyPe Product Detection
    var flexypeResult = NS.FlexyPeDetector.detect();

    // 3. Disabled Integration Detection
    var disabledResult = NS.DisabledDetector.detect();

    // 4. Third-Party App Detection
    var appResult = NS.AppDetector.detect();

    // 5. Store Feature Detection
    var featureResult = NS.FeatureDetector.detect();

    // Cleanup cached context to free memory
    H.resetContext();

    return {
      isShopify: true,
      data: {
        storeInfo: storeResult.data,
        flexypeProducts: flexypeResult,
        disabledIntegrations: disabledResult,
        thirdPartyApps: appResult,
        storeFeatures: featureResult
      }
    };
  } catch (e) {
    if (window.__shopifyDiagnostics && window.__shopifyDiagnostics.Helpers) {
      window.__shopifyDiagnostics.Helpers.resetContext();
    }
    return { isShopify: false, error: e.message || String(e) };
  }
})();
