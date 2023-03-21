module.exports = {
    siteMetadata: {
      siteUrl: "https://crispytaytortot.com",
      title: "CrispyTaytortot",
      titleTemplate: "%s · CrispyTaytortot",
      description: "CrispyTaytortot is a variety Twitch streamer who streams 4 days a week.",
      image: "/mainMetaImage.jpg",
      twitterUsername: "@CrispyTaytortot"
    },
    plugins: [
      "gatsby-plugin-image",
      "gatsby-plugin-react-helmet",
      "gatsby-plugin-postcss",
      "gatsby-plugin-sharp",
      "gatsby-transformer-sharp",
      `gatsby-transformer-json`,
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          "path": "./src/data/"
        }
      },
    //   {
    //     resolve: "gatsby-plugin-manifest",
    //     options: {
    //       name: `CrispyTaytortot`,
    //       short_name: `CrispyTaytortot`,
    //       start_url: `/`,
    //       background_color: `#f1ead1`,
    //       theme_color: `#ff9012`,
    //       display: `standalone`,
    //       icon: "src/images/icon-on-white.svg",
    //       icon_options: {
    //         purpose: `any maskable`,
    //       },
    //     },
    //   },
      {
        resolve: 'gatsby-plugin-robots-txt',
        options: {
          host: 'https://crispytaytortot.com',
          sitemap: 'https://crispytaytortot.com/sitemap.xml',
          policy: [{ userAgent: '*', allow: '/' }]
        }
      }
    ],
    proxy: {
      prefix: "/api",
      url: "http://localhost:4243"
    }
  };