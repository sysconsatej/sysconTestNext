import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Main from "./main";
import PropTypes from "prop-types";
import StoreProvider from "@/app/storeProvider";
import { fetchTenantData } from "@/utils/clientTenant";
import { headers } from "next/headers";

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
export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}  hideScrollbar thinScrollBar`}>
        <StoreProvider>
          <Main>{children}</Main>
        </StoreProvider>
      </body>
    </html>
  );
}
