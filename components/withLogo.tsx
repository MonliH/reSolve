import { Box } from "@chakra-ui/react";
import Logo from "../public/resolutionLogo.svg";

export default function withLogo(
  Component: React.ComponentType<{}>
): React.ComponentType<{}> {
  const WithLogo = () => {
    return (
      <Box p="20">
        <Box cursor="default" userSelect="none" mt="-10" mb="10">
          <Logo width="200px" height="auto" />
        </Box>
        <Component />
      </Box>
    );
  };
  return WithLogo;
}
