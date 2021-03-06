import { Box, Button, ButtonGroupProps, ButtonProps } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { Star } from "react-feather";
import { animated, config, useSpring } from "react-spring";

export default function GradientButton({
  children,
  bgGradient = "linear(to-l, #7928CA, #FF0080)",
  ...buttonProps
}: { children: ReactNode } & ButtonProps) {
  const [hover, setHover] = useState<boolean>(false);
  const props = useSpring({
    opacity: hover || buttonProps.isLoading || buttonProps.isDisabled ? 0.7 : 1,
    config: config.stiff,
  });

  return (
    <animated.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={props}
    >
      <Button
        display="flex"
        variant="unstyled"
        p="4"
        boxShadow="lg"
        alignItems="center"
        bgGradient={bgGradient}
        leftIcon={<Star size={20} />}
        _hover={{
          bgGradient: bgGradient,
        }}
        loadingText="Generating"
        color="white"
        size="lg"
        {...buttonProps}
      >
        <Box as="span" mt="1">
          {children}
        </Box>
      </Button>
    </animated.div>
  );
}
