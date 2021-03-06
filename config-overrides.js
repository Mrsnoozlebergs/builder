const {
  override, addLessLoader, addWebpackModuleRule
} = require('customize-cra');

module.exports = override(
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true
    }
  }),
  (config) => {
    config.module.rules.unshift({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      use: [
        {
          loader: require.resolve('@midwayjs/hooks-loader'),
        },
      ],
    })

    return config;
  }
)