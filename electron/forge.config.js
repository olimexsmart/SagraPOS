module.exports = {
  packagerConfig: {
    asar: true,
    icon: '/images',
    asarUnpack: [
      "**/node_modules/sharp/**/*",
      "**/node_modules/@img/**/*"
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // setupIcon: '/images/icon.ico'
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
