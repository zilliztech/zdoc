(function () {
  var env = window.__ZDOC_ENV__ || {};
  var apiKey = env.INKEEP_API_KEY;
  var integrationId = env.INKEEP_INTEGRATION_ID;
  var organizationId = env.INKEEP_ORGANIZATION_ID;
  if (!apiKey) return;

  var baseSettings = {
    apiKey: apiKey,
    ...(integrationId ? { integrationId: integrationId } : {}),
    ...(organizationId ? { organizationId: organizationId } : {}),
  };

  var config = window.InkeepConfig || {};
  window.InkeepConfig = {
    ...config,
    SearchBar: {
      ...(config.SearchBar || {}),
      baseSettings: {
        ...((config.SearchBar || {}).baseSettings || {}),
        ...baseSettings,
      },
    },
    ChatButton: {
      ...(config.ChatButton || {}),
      baseSettings: {
        ...((config.ChatButton || {}).baseSettings || {}),
        ...baseSettings,
      },
    },
  };
})();
