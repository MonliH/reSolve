import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ResolutionProvider } from "../lib/resolutionContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ResolutionProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </ResolutionProvider>
  );
}

export default MyApp;
