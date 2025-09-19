/** @type {import('./plugins/i18n-translator').PluginOptions} */
export default {
  glossaries: {
    'ja-JP': [
      { source: 'Organization Owner', target: '組織オーナー' },
      { source: 'API keys', target: 'APIキー' }
    ]
  },
  untranslatables: [
    'Zilliz Cloud',
    'RESTful API',
    'V2',
    ' | Cloud'
  ],

  // Example configurations for different providers:

  // OpenRouter (default)
  // modelConfig: {
  //   baseUrl: 'https://openrouter.ai/api/v1',
  //   apiKey: process.env.MODEL_API_KEY,
  //   modelId: 'google/gemma-3-27b-it:free'
  // },

  // Ollama (local)
  // modelConfig: {
  //   baseUrl: 'http://localhost:11434/v1/',
  //   apiKey: 'ollama', // ignored but required
  //   modelId: 'llama3.2:latest',
  //   provider: 'ollama'
  // },
  // throttleConfig: {
  //   minTime: 1000, // Faster for local models
  //   maxConcurrent: 2
  // },

  // OpenAI
  // modelConfig: {
  //   baseUrl: 'https://api.openai.com/v1',
  //   apiKey: process.env.OPENAI_API_KEY,
  //   modelId: 'gpt-4'
  // },

  // Model configuration (will fallback to environment variables if not specified)
  modelConfig: {
    baseUrl: process.env.MODEL_API_BASE_URL,
    apiKey: process.env.MODEL_API_KEY,
    modelId: process.env.MODEL_ID,
    provider: process.env.MODEL_PROVIDER
  },

  // Throttle configuration (will fallback to environment variables if not specified)
  throttleConfig: {
    minTime: parseInt(process.env.THROTTLE_MIN_TIME) || 1000,
    maxConcurrent: parseInt(process.env.THROTTLE_MAX_CONCURRENT) || 1
  }
};