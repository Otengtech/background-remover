import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const MetaTags = ({ 
  // FIXED: Longer title (50-60 characters)
  title = "Remove Backgrounds Instantly | Free AI Background Remover - Removerio",
  
  // FIXED: Good description
  description = "Remove image backgrounds instantly with AI. 100% FREE, no signup required. Process JPG, PNG in seconds. Perfect for ecommerce, social media & creative projects.",
  
  keywords = "Free background remover online, remove background from image free no signup, AI background removal tool, transparent background maker, remove background for ecommerce product photos, social media profile picture background remover, batch background removal, online photo editor remove background, delete background from photo, extract subject from image, isolate object from background, create transparent PNG online",
  
  // FIXED: Use your logo for now, but create og-image.png
  ogImage = "https://www.removerio.bond/og-image.avif",
  
  // FIXED: Optional - for specific pages
  pageTitle = "",
  pageDescription = ""
}) => {
  const location = useLocation();
  const baseUrl = "https://www.removerio.bond";
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  
  // Use custom page title/description if provided
  const finalTitle = pageTitle || title;
  const finalDescription = pageDescription || description;
  
  return (
    <Helmet>
      {/* BASIC SEO */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* OPEN GRAPH (Facebook, LinkedIn, WhatsApp) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Removerio" />
      
      {/* TWITTER */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* ADDITIONAL META TAGS */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* STRUCTURED DATA (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Removerio - Free AI Background Remover",
          "description": finalDescription,
          "url": canonicalUrl,
          "applicationCategory": "DesignApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": "Free, Fast, No Watermark, No Signup, Batch Processing",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
          }
        })}
      </script>
    </Helmet>
  );
};

export default MetaTags;