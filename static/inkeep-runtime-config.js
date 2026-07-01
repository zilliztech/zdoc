(function () {
  var env = window.__ZDOC_ENV__ || {};
  var apiKey = env.INKEEP_API_KEY;
  if (!apiKey) return;

  var config = window.InkeepConfig || {};
  window.InkeepConfig = {
    ...config,
    SearchBar: {
      ...(config.SearchBar || {}),
      baseSettings: {
        ...((config.SearchBar || {}).baseSettings || {}),
        apiKey: apiKey,
      },
    },
    ChatButton: {
      ...(config.ChatButton || {}),
      baseSettings: {
        ...((config.ChatButton || {}).baseSettings || {}),
        apiKey: apiKey,
      },
    },
  };
})();
