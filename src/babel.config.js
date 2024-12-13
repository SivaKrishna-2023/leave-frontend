module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-transform-private-methods',  // If needed for private methods
      '@babel/plugin-transform-private-property-in-object' // Optional for private properties
    ]
  };