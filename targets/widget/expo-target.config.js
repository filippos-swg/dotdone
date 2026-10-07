/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'DotItWidget',
  displayName: 'Dot It',
  bundleIdentifier: '.widget',
  deploymentTarget: '15.1',
  entitlements: {
    'com.apple.security.application-groups': ['group.se.southnorth.dotdone'],
  },
};
