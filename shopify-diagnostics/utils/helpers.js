// Helper Functions for Shopify Store Diagnostics Extension
// Provides cached DOM scanning and confidence evaluation utilities
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Helpers = {
  _cache: null,

  /**
   * Pre-collects all DOM elements needed by detectors into an internal cache.
   * Eliminates repeated querySelectorAll calls across multiple detectors.
   */
  initContext: function() {
    try {
      var allScripts = Array.from(document.querySelectorAll("script"));
      var scriptEntries = allScripts.map(function(s) {
        return {
          element: s,
          src: (s.src || "").toLowerCase(),
          content: s.textContent || "",
          type: (s.getAttribute("type") || "").toLowerCase(),
          isDisabled: s.hasAttribute("disabled") ||
                      s.getAttribute("type") === "text/plain" ||
                      s.getAttribute("type") === "text/x-template"
        };
      });

      var allLinks = Array.from(document.querySelectorAll("link[rel='stylesheet']"));
      var stylesheetHrefs = allLinks
        .filter(function(l) { return !!l.href; })
        .map(function(l) { return l.href.toLowerCase(); });

      var comments = [];
      try {
        var iterator = document.createNodeIterator(
          document.documentElement, NodeFilter.SHOW_COMMENT, null
        );
        var node, count = 0;
        while ((node = iterator.nextNode()) && count < 500) {
          count++;
          comments.push(node.nodeValue || "");
        }
      } catch (e) { /* silent */ }

      this._cache = {
        scriptEntries: scriptEntries,
        stylesheetHrefs: stylesheetHrefs,
        comments: comments,
        disabledScripts: scriptEntries.filter(function(s) { return s.isDisabled; })
      };
    } catch (e) {
      this._cache = null;
    }
  },

  resetContext: function() { this._cache = null; },

  escapeRegex: function(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  safeQuerySelector: function(selector) {
    try { return document.querySelector(selector); }
    catch (e) { return null; }
  },

  safeQuerySelectorAll: function(selector) {
    try { return Array.from(document.querySelectorAll(selector)); }
    catch (e) { return []; }
  },

  hasGlobal: function(name) {
    try {
      var parts = name.split(".");
      var current = window;
      for (var i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) return false;
        current = current[parts[i]];
      }
      return current !== undefined && current !== null;
    } catch (e) { return false; }
  },

  getGlobalValue: function(name) {
    try {
      var parts = name.split(".");
      var current = window;
      for (var i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) return null;
        current = current[parts[i]];
      }
      return current;
    } catch (e) { return null; }
  },

  /**
   * Checks if any script element has src or textContent matching pattern.
   * Strings are auto-escaped for literal matching; pass RegExp for pattern matching.
   */
  hasScript: function(pattern) {
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        return this._cache.scriptEntries.some(function(e) {
          return (e.src && regex.test(e.src)) || regex.test(e.content);
        });
      }
      var scripts = this.safeQuerySelectorAll("script");
      return scripts.some(function(s) {
        return (s.src && regex.test(s.src)) || (s.textContent && regex.test(s.textContent));
      });
    } catch (e) { return false; }
  },

  /** Checks only external script src attributes */
  hasScriptSrc: function(pattern) {
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        return this._cache.scriptEntries.some(function(e) { return e.src && regex.test(e.src); });
      }
      return this.safeQuerySelectorAll("script[src]").some(function(s) { return regex.test(s.src); });
    } catch (e) { return false; }
  },

  /** Checks only inline script textContent */
  hasInlineScript: function(pattern) {
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        return this._cache.scriptEntries.some(function(e) {
          return !e.src && e.content && regex.test(e.content);
        });
      }
      return this.safeQuerySelectorAll("script:not([src])").some(function(s) {
        return s.textContent && regex.test(s.textContent);
      });
    } catch (e) { return false; }
  },

  hasStylesheet: function(pattern) {
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        return this._cache.stylesheetHrefs.some(function(h) { return regex.test(h); });
      }
      return this.safeQuerySelectorAll("link[rel='stylesheet']").some(function(l) {
        return l.href && regex.test(l.href);
      });
    } catch (e) { return false; }
  },

  getMetaContent: function(name) {
    try {
      var meta = this.safeQuerySelector("meta[name='" + name + "'], meta[property='" + name + "']");
      return meta ? meta.getAttribute("content") : null;
    } catch (e) { return null; }
  },

  /** Searches HTML comment nodes using pre-cached collection */
  searchComments: function(pattern) {
    var matches = [];
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        this._cache.comments.forEach(function(text) {
          if (regex.test(text)) matches.push(text.trim());
        });
        return matches;
      }
      var iterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_COMMENT, null);
      var currentNode, count = 0;
      while ((currentNode = iterator.nextNode()) && count < 500) {
        count++;
        if (regex.test(currentNode.nodeValue)) matches.push(currentNode.nodeValue.trim());
      }
    } catch (e) { /* silent */ }
    return matches;
  },

  /** Returns disabled script entries matching a pattern (cached) */
  getDisabledScripts: function(pattern) {
    try {
      var regex = (typeof pattern === "string") ? new RegExp(this.escapeRegex(pattern), "i") : pattern;
      if (this._cache) {
        return this._cache.disabledScripts.filter(function(e) {
          return regex.test(e.content) || regex.test(e.src);
        });
      }
      return this.safeQuerySelectorAll("script[type='text/plain'], script[type='text/x-template'], script[disabled]")
        .filter(function(s) {
          return regex.test(s.textContent || "") || regex.test(s.getAttribute("src") || "");
        });
    } catch (e) { return []; }
  },

  /** Finds elements matching selectors that are hidden via CSS */
  findHiddenElements: function(selectors) {
    try {
      return this.safeQuerySelectorAll(selectors).filter(function(el) {
        try {
          var style = window.getComputedStyle(el);
          return style.display === "none" || style.visibility === "hidden" ||
                 el.hasAttribute("hidden") || el.style.display === "none";
        } catch (e) { return false; }
      });
    } catch (e) { return []; }
  },

  /**
   * Calculates confidence score based on weighted signals.
   * @param {Array} signals - [{detected, weight, name}]
   * @param {number} [threshold=80] - Confidence % to classify as "Detected"
   */
  evaluateDetection: function(signals, threshold) {
    var detectedThreshold = threshold || 80;
    var score = 0, totalWeight = 0, evidence = [];

    signals.forEach(function(sig) {
      totalWeight += sig.weight;
      if (sig.detected) {
        score += sig.weight;
        evidence.push(sig.name);
      }
    });

    var confidence = totalWeight > 0 ? Math.min(100, Math.round((score / totalWeight) * 100)) : 0;
    var S = window.__shopifyDiagnostics.Constants.DETECTION_STATUS;
    var status = S.NOT_DETECTED;
    if (confidence >= detectedThreshold) status = S.DETECTED;
    else if (confidence > 0) status = S.POSSIBLE;

    return { status: status, confidence: confidence, evidence: evidence };
  }
};
