// wmf-config.js
const { shareAll } = require('@angular-architects/module-federation/webpack');
const { container } = require('webpack');
const ModuleFederationPlugin = container.ModuleFederationPlugin;

module.exports = (config) => {
  const mf = new ModuleFederationPlugin({
    name: 'Host',
    filename: 'remoteEntry.js',
    remotes: {
      mct: 'mct@http://localhost:3002/remoteEntry.js',
    },
    shared: {
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
    library: { type: 'var', name: 'Host' },
  });

  return {
    ...config,
    output: {
      ...(config.output || {}),
      publicPath: '/',
      library: { type: 'var', name: 'Host' },
    },
    experiments: {
      ...(config.experiments || {}),
      outputModule: false,
    },
    plugins: [...(config.plugins || []), mf],
  };
};
