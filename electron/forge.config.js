const path = require('path')

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(process.cwd(), 'images'),
    asarUnpack: [
      '**/node_modules/sharp/**/*',
      '**/node_modules/@img/**/*'
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: path.join(process.cwd(), 'images', 'icon.ico'),
        iconUrl: "file://" + __dirname + "/images/icon.ico"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: '/images/icon.png'
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
