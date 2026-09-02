# Installation, Usage, and User Guide

This guide provides step-by-step instructions for installing, running, updating, and using the **Shopify Store Inspector & Diagnostics** Chrome Extension.

---

## 1. Prerequisites & Browser Requirements

- **Supported Browsers**: Google Chrome, Microsoft Edge, Brave, Opera, or any Chromium-based browser supporting Manifest V3.
- **Permissions Required**: Developer Mode enabled in `chrome://extensions/`.

---

## 2. Installation Guide (Load Unpacked Extension)

### Step 1: Locate the Project Directory
Ensure the extension files are saved locally on your computer at:
`c:\Users\Surabhi M R\Downloads\shopify_extension\`

Verify that `manifest.json` is located in the root of this folder.

### Step 2: Open Extensions Settings in Chrome
1. Launch Google Chrome.
2. Type `chrome://extensions/` into the address bar and press **Enter**.

### Step 3: Enable Developer Mode
In the top-right corner of the Extensions page, click the toggle switch to enable **Developer mode** (`ON`).

### Step 4: Load the Unpacked Extension
1. Click the **Load unpacked** button located in the top-left toolbar.
2. In the file picker dialog, navigate to and select the folder:
   `c:\Users\Surabhi M R\Downloads\shopify_extension`
3. Click **Select Folder**.

The extension card titled **Shopify Store Inspector & Diagnostics** will now appear in your list of active extensions.

---

## 3. How to Pin the Extension for Quick Access

1. In Google Chrome, click the **Extensions puzzle piece icon** 🧩 located next to your profile picture in the top-right toolbar.
2. Scroll down to find **Shopify Store Inspector & Diagnostics**.
3. Click the **Pin icon** 📌 next to it. The extension icon will now remain visible on your toolbar for instant access.

---

## 4. How to Use the Extension (Step-by-Step)

### Step 1: Open a Shopify Storefront
Open any public Shopify storefront in your browser. Examples:
- [Allbirds Store](https://www.allbirds.com)
- [Gymshark Store](https://www.gymshark.com)
- Or any merchant store hosted on Shopify.

> ⚠️ **Note**: The extension cannot run on browser settings pages (`chrome://`), blank tabs (`about:blank`), or Chrome Web Store pages due to browser security restrictions.

### Step 2: Run Diagnostics Scan
1. Click the **Shopify Inspector** extension icon in your Chrome toolbar.
2. The popup UI will display a scanning state (`Scanning Shopify storefront metadata & stack...`).
3. Within 1–2 seconds, the dashboard will populate with real-time diagnostic results:
   - **Store Information**: Shop name, domain, myshopify URL, locale, currency, and active theme details (Name, ID, Role: `main` vs `preview`).
   - **Core E-Commerce Architecture**: Status & confidence score for Checkout & Payment Engine, Customer Auth Stack, and Cart Drawer Engine.
   - **Inactive Code & Disabled Traces**: Identifies disabled script tags (`type="text/plain"`), hidden elements (`display:none`), and HTML comment traces.
   - **Third-Party App Stack**: Displays active third-party apps detected on the page (e.g., Klaviyo, Yotpo, Gorgias, Recharge, PageFly, etc.).
   - **Storefront Capabilities**: Checklist of 15 features (Search, Wishlist, Currency Selector, Chat Widget, Reviews, Infinite Scroll).

---

## 5. Exporting Diagnostic Reports

1. Click the **Export Report** button at the bottom of the popup dashboard.
2. The extension automatically:
   - Copies the full report HTML source code to your clipboard.
   - Opens a printable report dashboard in a new tab.
3. In the opened report tab:
   - Click **Export as PDF / Print** to save a PDF or print a hard copy.
   - Click **Copy HTML Code** to copy the HTML source code for sharing via email or support tickets.

---

## 6. How to Update the Extension When Code Changes

Whenever you modify any code in `c:\Users\Surabhi M R\Downloads\shopify_extension`:

1. Open `chrome://extensions/` in your browser.
2. Locate the **Shopify Store Inspector & Diagnostics** card.
3. Click the **Reload icon** 🔄 (the circular arrow in the bottom-right of the card).
4. Return to your Shopify tab and click the extension icon again to run the updated code.
