// get global privacy control
const GPC = navigator.globalPrivacyControl;
const supportGPC = typeof GPC !== 'undefined';

// onchange
const onChange = () => {
  window.dataLayer.push({
    event: 'consent_update',
  });
};

// settings
const ccSettings = {
  current_lang: 'en',
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
  cookie_name: 'zilliz_cookie_consent', // default: 'cc_cookie'
  // cookie_expiration: 182,                 // default: 182 (days)
  // cookie_necessary_only_expiration: 182   // default: disabled
  cookie_domain: '.zilliz.com', // default: current domain
  // cookie_path: '/',                       // default: root
  // cookie_same_site: 'Lax',                // default: 'Lax'
  // use_rfc_cookie: false,                  // default: false
  // revision: 0,                            // default: 0

  onFirstAction: function (user_preferences, cookie) {
    onChange();
  },

  onAccept: function (cookie) {
    onChange();
  },

  onChange: function (cookie, changed_preferences) {
    onChange();
  },

  languages: {
    en: {
      consent_modal: {
        title: 'We use cookies!',
        description:
          'This website uses cookies to improve your browsing experience, provide personalized content and ensure the website functions optimally. By continuing to use our site, you agree to our use of cookies. We value your privacy and are committed to protecting your personal information. For more details, please refer to our <a href="https://zilliz.com/cookie-policy" class="cc-link">Cookie Policy</a>. ',
        primary_btn: {
          text: 'Accept all',
          role: 'accept_all', // 'accept_selected' or 'accept_all'
        },
        secondary_btn: {
          text: 'Reject all',
          role: 'accept_necessary', // 'settings' or 'accept_necessary'
        },
      },
      settings_modal: {
        title: 'Cookie Settings',
        save_settings_btn: 'Save settings',
        accept_all_btn: 'Accept all',
        reject_all_btn: 'Reject all',
        close_btn_label: 'Close',
        cookie_table_headers: [
          { col1: 'Name' },
          { col2: 'Owner' },
          { col3: 'Time period' },
          { col4: 'Purpose and use' },
        ],
        blocks: [
          {
            description:
              'This website uses cookies to improve your browsing experience, provide personalized content and ensure the website functions optimally. By continuing to use our site, you agree to our use of cookies. We value your privacy and are committed to protecting your personal information. <br /><br />For more details, please refer to our <a href="https://zilliz.com/cookie-policy" class="cc-link">Cookie Policy</a>.',
          },
          {
            title: 'Strictly necessary cookies',
            description:
              'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.',
            toggle: {
              value: 'necessary',
              enabled: true,
              readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
            },
            cookie_table: [
              // list of all expected cookies
              {
                col1: 'zilliz_cookie_consent',
                col2: 'zilliz.com',
                col3: '6 months',
                col4: 'User cookie concent settings',
                is_regex: false,
              },
            ],
          },
          {
            title: 'Analytics & Performance',
            description:
              'Help the website operator understand how its website performs, how visitors interact with the site, and whether there may be technical issues.',
            toggle: {
              value: 'analytics', // your cookie category
              enabled: false,
              readonly: false,
            },
            cookie_table: [
              {
                col1: '_zilliz_guid',
                col2: 'zilliz.com',
                col3: '1 years',
                col4: 'Used by Zilliz.com',
                is_regex: true,
              },
              {
                col1: '_ga_*',
                col2: 'google',
                col3: '1 years',
                col4: 'Used by Google Analytics',
                is_regex: true,
              },
              {
                col1: '__hs*',
                col2: 'hubspot',
                col3: '1 day',
                col4: 'Used by HubSpot',
                is_regex: true,
              },
              {
                col1: 'hubspotutk',
                col2: 'hubspot',
                col3: '13 months',
                col4: 'Used by HubSpot',
                is_regex: false,
              },
              {
                col1: 'cb_*',
                col2: 'clearbit',
                col3: '13 months',
                col4: 'Used by Clearbit',
                is_regex: true,
              },
            ],
          },
          {
            title: 'Targeted Advertising',
            description:
              'These cookies Used to deliver advertising that is more relevant to you and your interests.',
            toggle: {
              value: 'adv', // your cookie category
              enabled: false,
              readonly: false,
            },
            cookie_table: [
              {
                col1: '_gcl_au',
                col2: 'google',
                col3: '3 months',
                col4: 'Used by Google AdSense for experimenting with advertisement efficiency',
                is_regex: false,
              },
            ],
          },
          {
            title: 'Personalization',
            description:
              'Allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.',
            toggle: {
              value: 'personalization', // your cookie category
              enabled: false,
              readonly: false,
            },
            cookie_table: [],
          },
          {
            title: 'Security',
            description:
              'Allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personal features.',
            toggle: {
              value: 'security', // your cookie category
              enabled: false,
              readonly: false,
            },
            cookie_table: [],
          },
          {
            title: 'More information',
            description: `For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="mailto:support@zilliz.com">contact us</a>.`,
          },
        ],
      },
    },
  },
};

window.addEventListener('load', () => {
  // init gtag and its dataLayer
  window.cc = window.initCookieConsent();
  // dialog content for GPC
  if (supportGPC) {
    (ccSettings.languages.en.settings_modal.blocks[0].description = `We've detected your <strong>Global Privacy Control (GPC)</strong> settings and will prioritize them. These settings cannot be changed. Your privacy is our priority. <br /><br />For more details relative to cookies and other sensitive data, please read the full <a href="https://zilliz.com/cookie-policy" class="cc-link">privacy policy</a>.`),
      (ccSettings.languages.en.settings_modal.blocks[2].toggle.readonly = false);
  }

  // run settings
  cc.run(ccSettings);

  // support global privacy control, setup cookie consent for user
  if (supportGPC) {
    cc.accept(GPC ? ['necessary', 'analytics'] : []);
    // update dialog
    const checkboxs = document.querySelectorAll(
      '#cc--main input[type="checkbox"]'
    );

    // disable analytics
    if (checkboxs[1]) {
      checkboxs[1].setAttribute('disabled', '');
      checkboxs[1].nextElementSibling.classList.add('c-ro');
    }

    // remove button, adjust button text
    const saveSettingBtn = document.querySelector('#cc--main #s-sv-bn');
    if (saveSettingBtn) {
      saveSettingBtn.innerHTML = 'OK';
    }
  }
  const settingBtn = document.querySelector('.setting-cookie-btn');
  settingBtn.addEventListener('click', e => {
    e.preventDefault();
    cc.showSettings(0);
  });
});
