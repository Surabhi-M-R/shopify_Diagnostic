// Helper Functions for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.Helpers = {
  /**
   * Safely selects a DOM element, returning null if it doesn't exist
   * @param {string} selector 
   * @returns {Element|null}
   */
  safeQuerySelector: function(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn("Invalid selector: " + selector, e);
      return null;
    }
  },

  /**
   * Safely selects all matching DOM elements, returning an empty array if invalid
   * @param {string} selector 
   * @returns {Element[]}
   */
  safeQuerySelectorAll: function(selector) {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      console.warn("Invalid selector helper: " + selector, e);
      return [];
    }
  },

  /**
   * Safely checks if a global variable exists on window
   * @param {string} name 
   * @returns {boolean}
   */
  hasGlobal: function(name) {
    try {
      const parts = name.split(".");
      let current = window;
      for (const part of parts) {
        if (current === undefined || current === null) return false;
        current = current[part];
      }
      return current !== undefined && current !== null;
    } catch (e) {
      return false;
    }
  },

  /**
   * Safely retrieves the value of a global variable or returns null
   * @param {string} name 
   * @returns {any}
   */
  getGlobalValue: function(name) {
    try {
      const parts = name.split(".");
      let current = window;
      for (const part of parts) {
        if (current === undefined || current === null) return null;
        current = current[part];
      }
      return current;
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if any script element has src containing pattern or content matching pattern
   * @param {string|RegExp} pattern 
   * @returns {boolean}
   */
  hasScript: function(pattern) {
    try {
      const scripts = this.safeQuerySelectorAll("script");
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      return scripts.some(script => {
        if (script.src && regex.test(script.src)) return true;
        if (script.textContent && regex.test(script.textContent)) return true;
        return false;
      });
    } catch (e) {
      return false;
    }
  },

  /**
   * Checks if any link or stylesheet contains pattern
   * @param {string|RegExp} pattern 
   * @returns {boolean}
   */
  hasStylesheet: function(pattern) {
    try {
      const links = this.safeQuerySelectorAll("link[rel='stylesheet']");
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      return links.some(link => link.href && regex.test(link.href));
    } catch (e) {
      return false;
    }
  },

  /**
   * Retrieves meta tag content
   * @param {string} name - name or property attribute
   * @returns {string|null}
   */
  getMetaContent: function(name) {
    try {
      const meta = this.safeQuerySelector(`meta[name='${name}'], meta[property='${name}']`);
      return meta ? meta.getAttribute("content") : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Search HTML comments for a string or regex
   * @param {string|RegExp} pattern 
   * @returns {string[]} - Array of matching comment texts
   */
  searchComments: function(pattern) {
    const matches = [];
    try {
      const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
      const iterator = document.createNodeIterator(
        document.documentElement,
        NodeFilter.SHOW_COMMENT,
        null
      );
      
      let currentNode;
      let count = 0;
      // Safeguard against infinite loops and excessive scanning
      while ((currentNode = iterator.nextNode()) && count < 200) {
        count++;
        if (regex.test(currentNode.nodeValue)) {
          matches.push(currentNode.nodeValue.trim());
        }
      }
    } catch (e) {
      console.warn("Error scanning comment nodes", e);
    }
    return matches;
  },

  /**
   * Calculates confidence score based on input signals
   * @param {Array<{detected: boolean, weight: number, name: string}>} signals 
   * @returns {{score: number, evidence: string[]}}
   */
  evaluateDetection: function(signals) {
    let score = 0;
    let totalWeight = 0;
    const evidence = [];

    signals.forEach(sig => {
      totalWeight += sig.weight;
      if (sig.detected) {
        score += sig.weight;
        evidence.push(sig.name);
      }
    });

    const confidence = totalWeight > 0 ? Math.min(100, Math.round((score / totalWeight) * 100)) : 0;
    
    let status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.NOT_DETECTED;
    if (confidence >= 80) {
      status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.DETECTED;
    } else if (confidence > 0) {
      status = window.__shopifyDiagnostics.Constants.DETECTION_STATUS.POSSIBLE;
    }

    return {
      status,
      confidence,
      evidence
    };
  }
};
