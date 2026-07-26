// Store Feature Detector for Shopify Store Diagnostics Extension
// Uses unified DETECTION_STATUS vocabulary (Detected/Possible/Not Detected)
window.__shopifyDiagnostics = window.__shopifyDiagnostics || {};

window.__shopifyDiagnostics.FeatureDetector = {
  detect: function() {
    var H = window.__shopifyDiagnostics.Helpers;

    // 1. Search
    var searchSignals = [
      { name: "Search form (action='/search') found", detected: H.safeQuerySelector("form[action*='/search']") !== null, weight: 50 },
      { name: "Search query input (name='q') found", detected: H.safeQuerySelector("input[name='q']") !== null, weight: 30 },
      { name: "Search icon or toggle button found", detected: H.safeQuerySelector("[data-search-toggle], .search-icon, .search-modal-opener, [aria-label*='Search']") !== null, weight: 20 }
    ];

    // 2. Predictive Search
    var predictiveSignals = [
      { name: "Predictive search custom element or class found", detected: H.safeQuerySelector("predictive-search, .predictive-search, [data-predictive-search]") !== null, weight: 40 },
      { name: "Autocomplete input found", detected: H.safeQuerySelector("input[aria-autocomplete='list'], input[data-predictive-search-input]") !== null, weight: 30 },
      { name: "Predictive search script references found", detected: H.hasScript(/predictive-search/i), weight: 20 },
      { name: "Shopify routes predictive_search_url configured", detected: H.hasGlobal("routes.predictive_search_url") || H.safeQuerySelector("[data-url*='predictive_search']") !== null, weight: 10 }
    ];

    // 3. Wishlist
    var wishlistSignals = [
      { name: "Wishlist buttons, links, or containers found", detected: H.safeQuerySelector("[class*='wishlist'], [id*='wishlist'], [data-wishlist], .wishlist-btn") !== null, weight: 45 },
      { name: "Third-party wishlist app detected (Swym, Smart Wishlist)", detected: H.hasScript(/swym/i) || H.hasScript("wishlist") || H.hasGlobal("Swym") || H.hasGlobal("WishlistKing"), weight: 45 },
      { name: "Wishlist heart icon or SVG found", detected: H.safeQuerySelector("[class*='wishlist-icon'], [class*='wish-list']") !== null, weight: 10 }
    ];

    // 4. Customer Login
    var loginSignals = [
      { name: "Login link (href='/account/login') found", detected: H.safeQuerySelector("a[href*='/account/login']") !== null, weight: 50 },
      { name: "Login form (action='/account/login') found", detected: H.safeQuerySelector("form[action*='/account/login']") !== null, weight: 35 },
      { name: "Login icon or account button found", detected: H.safeQuerySelector("[aria-label*='Account'], [aria-label*='Log in'], .account-icon") !== null, weight: 15 }
    ];

    // 5. Customer Accounts
    var accountSignals = [
      { name: "Account or logout links found", detected: H.safeQuerySelector("a[href='/account'], a[href*='/account/logout']") !== null, weight: 50 },
      { name: "Shopify customer accounts global registered", detected: H.hasGlobal("Shopify.checkout.customer_id") || H.safeQuerySelector("meta[name='shopify-customer-id']") !== null, weight: 35 },
      { name: "Customer account page elements found", detected: H.safeQuerySelector(".customer-account, [data-customer-addresses]") !== null, weight: 15 }
    ];

    // 6. Currency Selector
    var currencySignals = [
      { name: "Localization form with currency_code input found", detected: H.safeQuerySelector("form[action*='/localization'] select[name='currency_code'], form[action*='/localization'] input[name='currency_code']") !== null, weight: 50 },
      { name: "Currency switcher or picker elements found", detected: H.safeQuerySelector("[data-currency-selector], .currency-selector, select.currency-picker, [data-disclosure-currency]") !== null, weight: 35 },
      { name: "Multiple currencies configured in Shopify globals", detected: H.hasGlobal("Shopify.currency.rate") || H.hasGlobal("Currency"), weight: 15 }
    ];

    // 7. Language Selector
    var languageSignals = [
      { name: "Localization form with locale_code input found", detected: H.safeQuerySelector("form[action*='/localization'] select[name='locale_code'], form[action*='/localization'] input[name='locale_code']") !== null, weight: 50 },
      { name: "Language selector elements found", detected: H.safeQuerySelector("[data-language-selector], .language-selector, .locale-selector, [data-disclosure-locale]") !== null, weight: 35 },
      { name: "Multiple locale links found", detected: H.safeQuerySelectorAll("link[rel='alternate'][hreflang]").length > 1, weight: 15 }
    ];

    // 8. Cart Drawer
    var cartDrawerSignals = [
      { name: "Cart drawer DOM container found", detected: H.safeQuerySelector("[class*='cart-drawer'], [id*='CartDrawer'], [class*='mini-cart'], [class*='ajax-cart'], cart-drawer") !== null, weight: 50 },
      { name: "Cart drawer toggle triggers found", detected: H.safeQuerySelector("[data-cart-drawer-toggle], [aria-controls*='CartDrawer'], [data-action='toggle-cart']") !== null, weight: 35 },
      { name: "AJAX cart or fetch cart script patterns found", detected: H.hasScript(/cart-drawer/i) || H.hasScript(/ajax-cart/i), weight: 15 }
    ];

    // 9. Quick View
    var quickViewSignals = [
      { name: "Quick view classes, buttons, or modals found", detected: H.safeQuerySelector("[class*='quick-view'], [class*='quickview'], [data-quickview], .js-quick-view, quick-view-modal") !== null, weight: 55 },
      { name: "Quick view triggers or template handles found", detected: H.safeQuerySelector("[id*='quick-view'], [data-action='quick-view'], [data-quick-view-trigger]") !== null, weight: 45 }
    ];

    // 10. Recently Viewed
    var recentlyViewedSignals = [
      { name: "Recently viewed wrapper or section found", detected: H.safeQuerySelector("[class*='recently-viewed'], [id*='recently-viewed'], .recently-viewed-products") !== null, weight: 50 },
      { name: "Recently viewed localStorage or cookie cache found", detected: (function() {
        try {
          return localStorage.getItem("shopify_recently_viewed") !== null ||
                 localStorage.getItem("recently-viewed-products") !== null ||
                 localStorage.getItem("recentlyViewedProducts") !== null ||
                 document.cookie.includes("recently_viewed");
        } catch(e) { return false; }
      })(), weight: 35 },
      { name: "Recently viewed section script or data-url found", detected: H.safeQuerySelector("[data-url*='recently-viewed']") !== null || H.hasScript(/recently-viewed/i), weight: 15 }
    ];

    // 11. Newsletter
    var newsletterSignals = [
      { name: "Newsletter tag input (contact[tags] = newsletter) found", detected: H.safeQuerySelector("form input[name='contact[tags]'][value*='newsletter']") !== null, weight: 50 },
      { name: "Newsletter form layout or classes present", detected: H.safeQuerySelector("form[class*='newsletter'], .newsletter-form, #newsletter-form, .newsletter-signup") !== null, weight: 35 },
      { name: "Email subscribe form action found", detected: H.safeQuerySelector("form[action*='/contact#contact_form'], form[action*='/subscribe']") !== null, weight: 15 }
    ];

    // 12. Chat Widget
    var chatSignals = [
      { name: "Known support/chat widget markup found", detected: H.safeQuerySelector("#shopify-chat, #gorgias-chat-container, #crisp-chatbox, #ze-container, #intercom-container, #tidio-chat") !== null, weight: 50 },
      { name: "Active global chat constructors on window", detected: H.hasGlobal("GorgiasChat") || H.hasGlobal("$crisp") || H.hasGlobal("zE") || H.hasGlobal("Intercom") || H.hasGlobal("Tawk_API") || H.hasGlobal("tidioChatApi"), weight: 35 },
      { name: "Chat widget iframe or launcher button found", detected: H.safeQuerySelector("[class*='chat-launcher'], [class*='chat-widget'], iframe[title*='chat']") !== null, weight: 15 }
    ];

    // 13. Reviews
    var reviewsSignals = [
      { name: "Reviews wrappers (SPR, Judge.me, Loox, Yotpo, Stamped) found", detected: H.safeQuerySelector("#shopify-product-reviews, .spr-reviews, .jdgm-widget, #looxReviews, .yotpo-main-widget, .yotpo-review, .stamped-container") !== null, weight: 50 },
      { name: "Reviews global properties active", detected: H.hasGlobal("jdgm") || H.hasGlobal("LOOX") || H.hasGlobal("yotpo") || H.hasGlobal("StampedFn"), weight: 35 },
      { name: "Star rating or review count elements found", detected: H.safeQuerySelector("[class*='review-star'], [class*='star-rating'], [class*='rating-count']") !== null, weight: 15 }
    ];

    // 14. Product Recommendations
    var recsSignals = [
      { name: "Shopify product recommendation section present", detected: H.safeQuerySelector(".product-recommendations, #product-recommendations, [data-recommendations-url], product-recommendations") !== null, weight: 50 },
      { name: "Recommendations API or scripts loaded", detected: H.safeQuerySelector("[data-url*='/recommendations/products']") !== null || H.hasScript(/recommendations/i), weight: 35 },
      { name: "Related/cross-sell product sections found", detected: H.safeQuerySelector("[class*='related-products'], [class*='cross-sell'], [class*='also-like']") !== null, weight: 15 }
    ];

    // 15. Infinite Scroll
    var scrollSignals = [
      { name: "Infinite scroll/load more elements found", detected: H.safeQuerySelector(".infinite-scroll, .ajax-load-more, [data-infinite-scroll], .load-more-btn") !== null, weight: 50 },
      { name: "Infinite scroll library scripts detected", detected: H.hasScript(/infinite-scroll/i) || H.hasScript(/ajax-scroll/i) || H.hasScript(/ias\.min\.js/i), weight: 35 },
      { name: "Pagination with AJAX data attributes found", detected: H.safeQuerySelector("[data-infinite], [data-paginate-type='infinite']") !== null, weight: 15 }
    ];

    return {
      search: H.evaluateDetection(searchSignals),
      predictiveSearch: H.evaluateDetection(predictiveSignals),
      wishlist: H.evaluateDetection(wishlistSignals),
      customerLogin: H.evaluateDetection(loginSignals),
      customerAccounts: H.evaluateDetection(accountSignals),
      currencySelector: H.evaluateDetection(currencySignals),
      languageSelector: H.evaluateDetection(languageSignals),
      cartDrawer: H.evaluateDetection(cartDrawerSignals),
      quickView: H.evaluateDetection(quickViewSignals),
      recentlyViewed: H.evaluateDetection(recentlyViewedSignals),
      newsletter: H.evaluateDetection(newsletterSignals),
      chatWidget: H.evaluateDetection(chatSignals),
      reviews: H.evaluateDetection(reviewsSignals),
      productRecommendations: H.evaluateDetection(recsSignals),
      infiniteScroll: H.evaluateDetection(scrollSignals)
    };
  }
};
