// Content Script wrapper executing detectors and collecting results
(() => {
  try {
    if (!window.__shopifyDiagnostics) {
      return {
        error: "Diagnostics namespaces could not be initialized or files injected out of order.",
        isShopify: false
      };
    }

    const SD = window.__shopifyDiagnostics.StoreDetector;
    const FD = window.__shopifyDiagnostics.FlexyPeDetector;
    const DD = window.__shopifyDiagnostics.DisabledDetector;
    const AD = window.__shopifyDiagnostics.AppDetector;
    const FeatD = window.__shopifyDiagnostics.FeatureDetector;

    // Run Store Detection first
    const storeCheck = SD.detect();
    if (!storeCheck.isShopify) {
      return {
        isShopify: false
      };
    }

    // Run all other detectors
    const flexypeResult = FD.detect();
    const disabledResult = DD.detect();
    const appsResult = AD.detect();
    const featuresResult = FeatD.detect();

    // Pack the final response payload
    return {
      isShopify: true,
      data: {
        storeInfo: storeCheck.data,
        flexypeProducts: flexypeResult,
        disabledIntegrations: disabledResult,
        thirdPartyApps: appsResult,
        storeFeatures: featuresResult
      }
    };
  } catch (e) {
    return {
      error: e.message || "Failed running DOM inspections",
      isShopify: false
    };
  }
})();
