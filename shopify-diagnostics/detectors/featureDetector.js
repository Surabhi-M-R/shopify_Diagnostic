// Store Feature Detector for Shopify Store Diagnostics Extension
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FeatureDetector = {
  detect: function() {
    const H = window.__shopifyDiagnostics.Helpers;

    const translateStatus = (evaluatedResult) => {
      let status = "Not Present";
      if (evaluatedResult.status === "Detected") {
        status = "Present";
      } else if (evaluatedResult.status === "Possible") {
        status = "Possible";
      }
      return {
        status: status,
        confidence: evaluatedResult.confidence,
        evidence: evaluatedResult.evidence
      };
    };

    // 1. Search
    const searchSignals = [
      {
        name: "Standard search form (action='/search') found",
        detected: H.safeQuerySelector("form[action*='/search']") !== null,
        weight: 60
      },
      {
        name: "Search query input (name='q') found",
        detected: H.safeQuerySelector("input[name='q']") !== null,
        weight: 40
      }
    ];

    // 2. Predictive Search
    const predictiveSignals = [
      {
        name: "Predictive search custom element found",
        detected: H.safeQuerySelector("predictive-search, .predictive-search") !== null,
        weight: 45
      },
      {
        name: "Input element with predictive search actions or aria-autocomplete found",
        detected: H.safeQuerySelector("input[aria-autocomplete='list'], input[data-predictive-search-input]") !== null,
        weight: 35
      },
      {
        name: "Predictive search core script references found",
        detected: H.hasScript(/predictive-search/i),
        weight: 20
      }
    ];

    // 3. Wishlist
    const wishlistSignals = [
      {
        name: "Wishlist buttons or links found in DOM",
        detected: H.safeQuerySelector("[class*='wishlist'], [id*='wishlist'], [data-wishlist]") !== null,
        weight: 50
      },
      {
        name: "Third-party wishlist app script (like Swym / Smart Wishlist) detected",
        detected: H.hasScript(/swym/i) || H.hasScript(/wishlist/i) || H.hasGlobal("Swym"),
        weight: 50
      }
    ];

    // 4. Customer Login
    const loginSignals = [
      {
        name: "Login link or action path (/account/login) found",
        detected: H.safeQuerySelector("a[href*='/account/login']") !== null,
        weight: 60
      },
      {
        name: "Login input form action (/account/login) found",
        detected: H.safeQuerySelector("form[action*='/account/login']") !== null,
        weight: 40
      }
    ];

    // 5. Customer Accounts
    const accountSignals = [
      {
        name: "Account settings path (/account) or logout path found",
        detected: H.safeQuerySelector("a[href='/account'], a[href*='/account/logout']") !== null,
        weight: 60
      },
      {
        name: "Shopify customer accounts global variable registered",
        detected: H.hasGlobal("Shopify.checkout.customer_id") || H.safeQuerySelector("meta[name='shopify-customer-id']") !== null,
        weight: 40
      }
    ];

    // 6. Currency Selector
    const currencySignals = [
      {
        name: "Form action targeting /localization found with currency_code",
        detected: H.safeQuerySelector("form[action*='/localization'] select[name='currency_code'], form[action*='/localization'] input[name='currency_code']") !== null,
        weight: 50
      },
      {
        name: "Currency switcher selector / custom buttons found",
        detected: H.safeQuerySelector("[data-currency-selector], .currency-selector, select.currency-picker") !== null,
        weight: 50
      }
    ];

    // 7. Language Selector
    const languageSignals = [
      {
        name: "Form action targeting /localization found with locale_code",
        detected: H.safeQuerySelector("form[action*='/localization'] select[name='locale_code'], form[action*='/localization'] input[name='locale_code']") !== null,
        weight: 50
      },
      {
        name: "Language selector elements found in header or footer",
        detected: H.safeQuerySelector("[data-language-selector], .language-selector, .locale-selector") !== null,
        weight: 50
      }
    ];

    // 8. Cart Drawer
    const cartDrawerSignals = [
      {
        name: "Cart drawer DOM container classes found",
        detected: H.safeQuerySelector("[class*='cart-drawer'], [id*='CartDrawer'], [class*='mini-cart'], [class*='ajax-cart']") !== null,
        weight: 60
      },
      {
        name: "Cart drawer HTML features or triggers found",
        detected: H.safeQuerySelector("[data-cart-drawer-toggle], [aria-controls*='CartDrawer']") !== null,
        weight: 40
      }
    ];

    // 9. Quick View
    const quickViewSignals = [
      {
        name: "Quick view classes, buttons or details in DOM",
        detected: H.safeQuerySelector("[class*='quick-view'], [class*='quickview'], [data-quickview], .js-quick-view") !== null,
        weight: 60
      },
      {
        name: "Quick view attributes or template handles loaded",
        detected: H.safeQuerySelector("[id*='quick-view'], [data-action='quick-view']") !== null,
        weight: 40
      }
    ];

    // 10. Recently Viewed
    const recentlyViewedSignals = [
      {
        name: "Recently viewed wrapper or container class encountered",
        detected: H.safeQuerySelector("[class*='recently-viewed'], [id*='recently-viewed']") !== null,
        weight: 60
      },
      {
        name: "Recently viewed cookies or localStorage cache verified",
        detected: (() => {
          try {
            return localStorage.getItem("shopify_recently_viewed") !== null || 
                   localStorage.getItem("recently-viewed-products") !== null ||
                   document.cookie.includes("recently_viewed");
          } catch(e) { return false; }
        })(),
        weight: 40
      }
    ];

    // 11. Newsletter
    const newsletterSignals = [
      {
        name: "Newsletter tag input tag (contact[tags] = newsletter) found",
        detected: H.safeQuerySelector("form input[name='contact[tags]'][value*='newsletter']") !== null,
        weight: 60
      },
      {
        name: "Newsletter form layout, classes, or IDs present",
        detected: H.safeQuerySelector("form[class*='newsletter'], .newsletter-form, #newsletter-form") !== null,
        weight: 40
      }
    ];

    // 12. Chat Widget
    const chatSignals = [
      {
        name: "Known support/chat widget markup or triggers found (Shopify Chat, Gorgias, Crisp, HelpScout)",
        detected: H.safeQuerySelector("#shopify-chat, #gorgias-chat-container, #crisp-chatbox, #ze-container, #intercom-container") !== null,
        weight: 60
      },
      {
        name: "Active global chat constructors on window",
        detected: H.hasGlobal("GorgiasChat") || H.hasGlobal("$crisp") || H.hasGlobal("zE") || H.hasGlobal("Intercom") || H.hasGlobal("Tawk_API"),
        weight: 40
      }
    ];

    // 13. Reviews
    const reviewsSignals = [
      {
        name: "Reviews wrappers (Shopify Reviews, Judge.me, Loox, Yotpo) found",
        detected: H.safeQuerySelector("#shopify-product-reviews, .spr-reviews, .jdgm-widget, #looxReviews, .yotpo-main-widget, .yotpo-review") !== null,
        weight: 60
      },
      {
        name: "Reviews global properties active",
        detected: H.hasGlobal("jdgm") || H.hasGlobal("LOOX") || H.hasGlobal("yotpo"),
        weight: 40
      }
    ];

    // 14. Product Recommendations
    const recsSignals = [
      {
        name: "Product recommendation tags or section classes present",
        detected: H.safeQuerySelector(".product-recommendations, #product-recommendations, [data-recommendations-url]") !== null,
        weight: 60
      },
      {
        name: "Targeting recommend scripts or Shopify Recommendations API loaded",
        detected: H.safeQuerySelector("[data-url*='/recommendations/products']") !== null || H.hasScript(/recommendations/i),
        weight: 40
      }
    ];

    // 15. Infinite Scroll
    const scrollSignals = [
      {
        name: "AJAX load more/infinite scroll tags or classes found",
        detected: H.safeQuerySelector(".infinite-scroll, .ajax-load-more, [data-infinite-scroll]") !== null,
        weight: 60
      },
      {
        name: "Infinite scrolling library paths in DOM scripts",
        detected: H.hasScript(/infinite-scroll/i) || H.hasScript(/ajax-scroll/i) || H.hasScript(/ias\.min\.js/i),
        weight: 40
      }
    ];

    return {
      search: translateStatus(H.evaluateDetection(searchSignals)),
      predictiveSearch: translateStatus(H.evaluateDetection(predictiveSignals)),
      wishlist: translateStatus(H.evaluateDetection(wishlistSignals)),
      customerLogin: translateStatus(H.evaluateDetection(loginSignals)),
      customerAccounts: translateStatus(H.evaluateDetection(accountSignals)),
      currencySelector: translateStatus(H.evaluateDetection(currencySignals)),
      languageSelector: translateStatus(H.evaluateDetection(languageSignals)),
      cartDrawer: translateStatus(H.evaluateDetection(cartDrawerSignals)),
      quickView: translateStatus(H.evaluateDetection(quickViewSignals)),
      recentlyViewed: translateStatus(H.evaluateDetection(recentlyViewedSignals)),
      newsletter: translateStatus(H.evaluateDetection(newsletterSignals)),
      chatWidget: translateStatus(H.evaluateDetection(chatSignals)),
      reviews: translateStatus(H.evaluateDetection(reviewsSignals)),
      productRecommendations: translateStatus(H.evaluateDetection(recsSignals)),
      infiniteScroll: translateStatus(H.evaluateDetection(scrollSignals))
    };
  }
};
