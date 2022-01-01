import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import ResolutionList from "../components/ResolutionList";
import { generateMore } from "../lib/api";
import { useResolutions } from "../lib/resolutionContext";
import GradientButton from "../components/GradientButton";
import withLogo from "../components/withLogo";

function GenerateMore() {
  const router = useRouter();
  const [{ resolutions, generated }, dispatch] = useResolutions();

  const [[loading, error], setLoading] = useState<[boolean, null | undefined]>([
    false,
    undefined,
  ]);

  const [noResults, setNoResults] = useState<boolean>(false);

  const generate = async () => {
    // Generate more resolutions
    setLoading([true, undefined]);
    setNoResults(false);
    const textResolutions = resolutions.map((r) => r.text);
    let newResolutions = await generateMore(textResolutions);
    if ("items" in newResolutions) {
      if (newResolutions.items.length > 0) {
        dispatch({
          type: "ADD_MANY",
          resolutions: newResolutions.items,
          aiGenerated: true,
        });
      } else {
        setNoResults(true);
      }
      dispatch({ type: "SET_GENERATED", generated: true });
    }
    setLoading([false, (newResolutions as any).error]);
  };

  return (
    <>
      <HStack width="100%">
        <Box flexGrow={1} width="100%">
          <ResolutionList>
            <Heading>Generate More</Heading>
            <Text>
              Now let{"'"}s use some AI magic to generate you some more
              resolutions.
            </Text>
          </ResolutionList>
        </Box>
        <Spacer flexGrow={0} flexBasis={[null, null, "0", "50vw"]} />
      </HStack>
      <HStack align="center" mt="4">
        <GradientButton
          onClick={generate}
          isDisabled={loading || resolutions.length === 0}
          isLoading={loading}
        >
          Generate More
        </GradientButton>
        {error ? (
          <Text color="red">{error}</Text>
        ) : noResults ? (
          <Text color="orange">
            No more results generated. Feel free to try again.
          </Text>
        ) : null}
      </HStack>
      <ButtonGroup>
        <Button
          flexGrow={0}
          leftIcon={<ArrowLeft />}
          onClick={() => router.replace("/")}
          size="md"
          mt="10"
          variant="outline"
        >
          Back
        </Button>
        <Button
          flexGrow={0}
          rightIcon={<ArrowRight />}
          onClick={() =>
            router.replace("/next-steps", undefined, { shallow: true })
          }
          size="md"
          mt="10"
          colorScheme={generated ? "green" : "gray"}
        >
          {generated ? "Next" : "Skip"}
        </Button>
      </ButtonGroup>
    </>
  );
}

export default withLogo(GenerateMore);
