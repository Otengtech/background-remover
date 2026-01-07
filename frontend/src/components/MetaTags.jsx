import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = "Remove Backgrounds Instantly | Free AI Background Remover - Removerio",
  description = "Remove image backgrounds instantly with AI. 100% FREE, no signup required. Process JPG, PNG in seconds. Perfect for ecommerce, social media & creative projects.",
  keywords = "Free background remover online, remove background from image free no signup, AI background removal tool, transparent background maker, remove background for ecommerce product photos, social media profile picture background remover, batch background removal, online photo editor remove background, delete background from photo, extract subject from image, isolate object from background, create transparent PNG online",
  ogImage = "https://removerio.bond/og-image.png",
  canonicalUrl = "https://removerio.bond"
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Removerio - Free AI Background Remover",
          "description": description,
          "url": canonicalUrl,
          "applicationCategory": "DesignApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": "Free, Fast, No Watermark, No Signup, Batch Processing"
        })}
      </script>
    </Helmet>
  );
};

export default MetaTags;