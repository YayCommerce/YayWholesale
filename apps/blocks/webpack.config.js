const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const customizeConfig = ( config ) => ( {
  ...config,
  optimization: {
    ...config.optimization,
    minimize: false,
  },
} );

module.exports = Array.isArray( defaultConfig )
  ? defaultConfig.map( customizeConfig )
  : customizeConfig( defaultConfig );