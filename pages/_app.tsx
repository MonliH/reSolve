import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ResolutionProvider } from "../lib/resolutionContext";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ResolutionProvider>
      <ChakraProvider>
        <Head>
          <link rel="icon" type="image/png" href="/resolveSquare64.png" />
          <title>reSolve</title>
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </ResolutionProvider>
  );
}

export default MyApp;
