import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SEOHead = ({ 
  title, 
  description, 
  canonicalPath = '', 
  type = 'website',
  breadcrumbs 
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && canonicalPath) {
      canonicalLink.setAttribute('href', `https://laloggia.shop${canonicalPath}`);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogUrl && canonicalPath) ogUrl.setAttribute('content', `https://laloggia.shop${canonicalPath}`);
    if (ogType) ogType.setAttribute('content', type);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    if (twitterUrl && canonicalPath) twitterUrl.setAttribute('content', `https://laloggia.shop${canonicalPath}`);

    // Handle breadcrumb structured data - only add when there's real hierarchy (more than just home)
    if (breadcrumbs && breadcrumbs.length > 1) {
      // Remove existing breadcrumb script if any
      const existingBreadcrumb = document.getElementById('breadcrumb-schema');
      if (existingBreadcrumb) {
        existingBreadcrumb.remove();
      }

      // Create new breadcrumb schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `https://laloggia.shop${crumb.url}`
        }))
      };

      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script);
    } else {
      // Remove breadcrumb schema if no real hierarchy
      const existingBreadcrumb = document.getElementById('breadcrumb-schema');
      if (existingBreadcrumb) {
        existingBreadcrumb.remove();
      }
    }

    // Cleanup breadcrumb schema on unmount
    return () => {
      const breadcrumbScript = document.getElementById('breadcrumb-schema');
      if (breadcrumbScript) {
        breadcrumbScript.remove();
      }
    };
  }, [title, description, canonicalPath, type, breadcrumbs]);

  return null;
};

export default SEOHead;
