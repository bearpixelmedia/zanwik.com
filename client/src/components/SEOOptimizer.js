import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOOptimizer = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage, 
  structuredData,
  noindex = false 
}) => {
  const defaultTitle = "Zanwik API Directory - Discover & Test 1000+ APIs for Entrepreneurs";
  const defaultDescription = "Explore our comprehensive directory of 1000+ APIs across 18 categories. Test APIs instantly, find documentation, and integrate with confidence. The API directory for entrepreneurs and developers.";
  const defaultKeywords = "API directory, APIs, developer tools, API testing, API documentation, web APIs, REST APIs, GraphQL, API integration, developer resources, business APIs, startup APIs";
  const defaultImage = "https://www.zanwik.com/zanwik-icon.svg";
  const siteUrl = "https://www.zanwik.com";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Zanwik" />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || `${siteUrl}${window.location.pathname}`} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || `${siteUrl}${window.location.pathname}`} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="Zanwik" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical || `${siteUrl}${window.location.pathname}`} />
      <meta property="twitter:title" content={title || defaultTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={ogImage || defaultImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="application-name" content="Zanwik API Directory" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Zanwik API Directory" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#667eea" />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOOptimizer;
