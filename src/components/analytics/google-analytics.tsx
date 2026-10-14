"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getConsentStatus } from "@/lib/analytics/ga4";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (measurementId && typeof window !== "undefined" && window.gtag) {
      const hasConsent = getConsentStatus();
      window.gtag("consent", "default", {
        analytics_storage: hasConsent ? "granted" : "denied",
      });
    }
  }, [measurementId]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              restricted_data_processing: true
            });
          `,
        }}
      />
    </>
  );
}
