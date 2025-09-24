import React from 'react';

const StructuredData = ({ type, data }) => {
  const generateStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Zanwik API Directory",
          "alternateName": "Zanwik",
          "url": "https://www.zanwik.com",
          "description": "Comprehensive directory of 1000+ APIs across 18 categories. Test APIs instantly, find documentation, and integrate with confidence.",
          "publisher": {
            "@type": "Organization",
            "name": "Zanwik",
            "url": "https://www.zanwik.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.zanwik.com/zanwik-icon.svg"
            }
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.zanwik.com/apis?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Zanwik",
          "url": "https://www.zanwik.com",
          "logo": "https://www.zanwik.com/zanwik-icon.svg",
          "description": "The API directory for entrepreneurs and developers. Discover, test, and integrate APIs with confidence.",
          "foundingDate": "2024",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "info@zanwik.com"
          },
          "sameAs": [
            "https://github.com/zanwik",
            "https://twitter.com/zanwik"
          ]
        };

      case 'api':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.name || "API",
          "description": data.description || "API service",
          "url": `https://www.zanwik.com/apis/${data.slug}`,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": data.pricing || "Free",
            "priceCurrency": "USD"
          },
          "provider": {
            "@type": "Organization",
            "name": data.provider || "API Provider"
          },
          "category": data.category || "Development"
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image || "https://www.zanwik.com/zanwik-icon.svg",
          "author": {
            "@type": "Organization",
            "name": "Zanwik"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Zanwik",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.zanwik.com/zanwik-icon.svg"
            }
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished
        };

      default:
        return null;
    }
  };

  const structuredData = generateStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
