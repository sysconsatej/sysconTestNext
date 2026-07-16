import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Main from "./main";
import PropTypes from "prop-types";
import StoreProvider from "@/app/storeProvider";
import { fetchTenantData } from "@/utils/clientTenant";
import { headers } from "next/headers";
import Script from "next/script"; // ⬅️ add this
import { getUserDetails } from "@/helper/userDetails";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  const headersList = headers();
  const host = headersList.get("host");
  const subdomain = host.split(".")[0];
  const isSubdomain =
    subdomain && subdomain !== "www" && host !== "artinshipping.com";

  if (isSubdomain) {
    const tenant = await fetchTenantData(subdomain);
    return {
      title: tenant.name,
      description: `${tenant?.name?.toUpperCase()}`,
      openGraph: {
        title: tenant.name,
        description: `${tenant?.name?.toUpperCase()}`,
      },
    };
  }
  return {
    title: "Syscon",
    description: "SYSCON",
    openGraph: {
      title: "Syscon",
      description: "SYSCON",
    },
  };
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

const CIPHERTEXT = `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`;

export default async function RootLayout({ children }) {
  const { clientId } = getUserDetails();
  return (
    <html lang="en">
      <head>
        {clientId == 15 && (
          <Script
            id="force-userdata-before-hydrate"
            strategy="beforeInteractive"
          >
            {`
            (function () {
              try {
                var path = location.pathname || "";
                if (path.includes("/htmlReports/rptDoLetter") && !localStorage.getItem('userData')) {
                  localStorage.setItem('userData', ${JSON.stringify(
                    CIPHERTEXT
                  )});
                }
              } catch (e) {}
            })();
          `}
          </Script>
        )}
      </head>

      <body className={`${inter.className} hideScrollbar thinScrollBar`}>
        <StoreProvider>
          <Main>{children}</Main>
        </StoreProvider>
      </body>
    </html>
  );
}
