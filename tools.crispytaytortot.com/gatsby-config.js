module.exports = {
  siteMetadata: {
    siteUrl: "https://tools.crispytaytortot.com",
    title: "CrispyTaytortot's Tools",
    titleTemplate: "%s · CrispyTaytortot's Tools",
    description: "CrispyTaytortot is a variety Twitch streamer who streams 4 days a week.",
    image: "/mainMetaImage.jpg",
    twitterUsername: "@CrispyTaytortot"
  },
  plugins: [
    'gatsby-plugin-postcss'
  ],
  proxy: {
    prefix: "/api",
    url: "http://localhost:4243"
  }
};