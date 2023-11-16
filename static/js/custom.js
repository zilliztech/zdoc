function loadGTM() {
  const gtmScript = document.querySelector('script[src*="googletagmanager"]');
  if (!gtmScript) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", "GTM-MBBF2KR");
  }
}

function loadHotjar() {
  const hotjarScript = document.querySelector('script[src*="hotjar"]');
  if (!hotjarScript) {
    (function (h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: 3711906, hjsv: 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script");
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
  }
}

window.onload = function () {
  // setup gtag
  window.gtag = window.gtag || ((...args) => undefined);

  const allow = () => {
    // load scripts
    loadGTM(true);
    loadHotjar();
    // setup gtm
    window.gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    window.gtag("consent", "default", {
      ad_storage: "granted",
      analytics_storage: "granted",
      personalization_storage: "granted",
      security_storage: "granted",
      functionality_storage: "granted",
    });
  };

  const disallow = () => {
    // deny google
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      personalization_storage: "denied",
      security_storage: "denied",
      functionality_storage: "denied",
    });
    // remove GTM script
    const gtmScript = document.querySelector('script[src*="googletagmanager"]');
    if (gtmScript) {
      gtmScript.remove();
    }
    // remove Hotjar script
    const hotjarScript = document.querySelector('script[src*="hotjar"]');
    if (hotjarScript) {
      hotjarScript.remove();
    }
  };

  const onChange = (cc) => {
    const allowed = cc.allowedCategory("analytics");
    allowed ? allow() : disallow();
  };

  // get global privacy control
  const GPC = navigator.globalPrivacyControl;
  const supportGPC = typeof GPC !== "undefined";
  const cc = window.initCookieConsent();

  const ccSettings = {
    current_lang: "en",
    autoclear_cookies: true, // default: false
    page_scripts: true, // default: false
    autorun: !supportGPC,

    // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
    // delay: 0,                               // default: 0
    // auto_language: null                     // default: null; could also be 'browser' or 'document'
    // autorun: true,                          // default: true
    // force_consent: false,                   // default: false
    // hide_from_bots: false,                  // default: false
    // remove_cookie_tables: false             // default: false
    cookie_name: "zilliz_cookie_consent", // default: 'cc_cookie'
    // cookie_expiration: 182,                 // default: 182 (days)
    // cookie_necessary_only_expiration: 182   // default: disabled
    // cookie_domain: ".zilliz.com", // default: current domain
    // cookie_path: '/',                       // default: root
    // cookie_same_site: 'Lax',                // default: 'Lax'
    // use_rfc_cookie: false,                  // default: false
    // revision: 0,                            // default: 0

    onFirstAction: function (user_preferences, cookie) {
      onChange(cc);
    },

    onAccept: function (cookie) {
      onChange(cc);
    },

    onChange: function (cookie, changed_preferences) {
      onChange(cc);
    },

    languages: {
      en: {
        consent_modal: {
          title: "We use cookies!",
          description:
            'This website uses cookies to improve your browsing experience, provide personalized content and ensure the website functions optimally. By continuing to use our site, you agree to our use of cookies. We value your privacy and are committed to protecting your personal information. For more details, please refer to our <a href="https://zilliz.com/cookie-policy" class="cc-link">Cookie Policy</a>. ',
          primary_btn: {
            text: "Accept all",
            role: "accept_all", // 'accept_selected' or 'accept_all'
          },
          secondary_btn: {
            text: "Reject all",
            role: "accept_necessary", // 'settings' or 'accept_necessary'
          },
        },
        settings_modal: {
          title: "Cookie Settings",
          save_settings_btn: "Save settings",
          accept_all_btn: "Accept all",
          reject_all_btn: "Reject all",
          close_btn_label: "Close",
          cookie_table_headers: [
            { col1: "Name" },
            { col2: "Owner" },
            { col3: "Time period" },
            { col4: "Purpose and use" },
          ],
          blocks: [
            {
              description:
                'This website uses cookies to improve your browsing experience, provide personalized content and ensure the website functions optimally. By continuing to use our site, you agree to our use of cookies. We value your privacy and are committed to protecting your personal information. <br /><br />For more details, please refer to our <a href="https://zilliz.com/cookie-policy" class="cc-link">Cookie Policy</a>.',
            },
            {
              title: "Strictly necessary cookies",
              description:
                "These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.",
              toggle: {
                value: "necessary",
                enabled: true,
                readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
              },
              cookie_table: [
                // list of all expected cookies
                {
                  col1: "zilliz_cookie_consent",
                  col2: "zilliz.com",
                  col3: "6 months",
                  col4: "User cookie concent settings",
                  is_regex: false,
                },
              ],
            },
            {
              title: "Analytics & Performance cookies",
              description:
                "These cookies allow the website to remember the choices you have made in the past.",
              toggle: {
                value: "analytics", // your cookie category
                enabled: false,
                readonly: false,
              },
              cookie_table: [
                {
                  col1: "_zilliz_guid",
                  col2: "zilliz.com",
                  col3: "1 years",
                  col4: "Analytics & Performance cookies",
                  is_regex: true,
                },
                {
                  col1: "_ga_*",
                  col2: "google",
                  col3: "1 years",
                  col4: "Analytics & Performance cookies",
                  is_regex: true,
                },
                {
                  col1: "_gcl_au",
                  col2: "google",
                  col3: "3 months",
                  col4: "Analytics & Performance cookies",
                  is_regex: false,
                },
                {
                  col1: "__hs*",
                  col2: "hubspot",
                  col3: "1 day",
                  col4: "Analytics & Performance cookies",
                  is_regex: true,
                },
                {
                  col1: "hubspotutk",
                  col2: "hubspot",
                  col3: "13 months",
                  col4: "Analytics & Performance cookies",
                  is_regex: false,
                },
              ],
            },
            {
              title: "More information",
              description: `For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="mailto:support@zilliz.com">contact us</a>.`,
            },
          ],
        },
      },
    },
  };

  // dialog content for GPC
  if (supportGPC) {
    (ccSettings.languages.en.settings_modal.blocks[0].description = `We've detected your <strong>Global Privacy Control (GPC)</strong> settings and will prioritize them. These settings cannot be changed. Your privacy is our priority. <br /><br />For more details relative to cookies and other sensitive data, please read the full <a href="https://zilliz.com/cookie-policy" class="cc-link">privacy policy</a>.`),
      (ccSettings.languages.en.settings_modal.blocks[2].toggle.readonly = false);
  }

  // run settings
  cc.run(ccSettings);

  // support global privacy control, setup cookie consent for user
  if (supportGPC) {
    cc.accept(GPC ? ["necessary", "analytics"] : []);
    // update dialog
    const checkboxs = document.querySelectorAll(
      '#cc--main input[type="checkbox"]'
    );

    // disable analytics
    if (checkboxs[1]) {
      checkboxs[1].setAttribute("disabled", "");
      checkboxs[1].nextElementSibling.classList.add("c-ro");
    }

    // remove button, adjust button text
    const saveSettingBtn = document.querySelector("#cc--main #s-sv-bn");
    if (saveSettingBtn) {
      saveSettingBtn.innerHTML = "OK";
    }
  }

  // setting button
  const settingBtn = document.querySelector(".setting-cookie-btn");
  settingBtn.addEventListener("click", (e) => {
    e.preventDefault();
    cc.showSettings(0);
  });
};
