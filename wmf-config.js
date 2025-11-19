// wmf-config.js
const { shareAll } = require('@angular-architects/module-federation/webpack');
const { container } = require('webpack');
const ModuleFederationPlugin = container.ModuleFederationPlugin;

module.exports = (config) => {
  // Плагин MF прописываем вручную, чтобы точно контролировать library.type
  const mf = new ModuleFederationPlugin({
    name: 'Host',
    filename: 'remoteEntry.js',
    // !!! скриптовая форма подключения remote:
    remotes: {
      mct: 'mct@http://localhost:3002/remoteEntry.js',
    },
    shared: {
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
    // НЕ задаём library.type: 'module'
    // (при необходимости можно явно указать скриптовый тип)
    library: { type: 'var', name: 'Host' },
  });

  return {
    ...config,
    // ЯВНЫЙ publicPath, чтобы не генерилось auto через import.meta.url
    output: {
      ...(config.output || {}),
      publicPath: '/',
      // На всякий случай убираем library.type из возможной базы
      library: { type: 'var', name: 'Host' },
    },
    // Явно запрещаем ESM-вывод
    experiments: {
      ...(config.experiments || {}),
      outputModule: false,
    },
    plugins: [...(config.plugins || []), mf],
  };
};
