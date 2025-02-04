import React from "react"
import PropTypes from "prop-types"
import { useLocation } from "@reach/router"
import { useStaticQuery, graphql } from "gatsby"

const SEOHeader = ({ title = null, description = null, image = null, article = false }: { title?: null | string, description?: null | string, image?: null | string, article?: boolean }) => {
  const { pathname } = useLocation();
  const { site } = useStaticQuery(query);

  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    defaultImage,
    twitterUsername,
  } = site.siteMetadata;

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${pathname}`,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta charSet="utf-8" />
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {seo.url && <meta property="og:url" content={seo.url} />}
      {(article ? true : null) && <meta property="og:type" content="article" />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && (<meta property="og:description" content={seo.description} />)}
      {seo.image && <meta property="og:image" content={seo.image} />}

      <meta name="twitter:card" content="summary_large_image" />
      {twitterUsername && (<meta name="twitter:creator" content={twitterUsername} />)}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && (<meta name="twitter:description" content={seo.description} />)}
      {seo.image && <meta name="twitter:image" content={seo.image} />}
    </>
  );
}

export default SEOHeader;

SEOHeader.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  article: PropTypes.bool,
};

const query = graphql`
  query SEOHeader {
    site {
      siteMetadata {
        defaultTitle: title
        defaultDescription: description
        siteUrl
        defaultImage: image
        twitterUsername
      }
    }
  }
`;
