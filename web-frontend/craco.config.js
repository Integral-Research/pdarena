module.exports = {
  webpack: {
    configure: {
      resolve: { fallback: { constants: require.resolve("constants-browserify") } },
    }
  }
}
