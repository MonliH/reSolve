import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import ResolutionList from "../components/ResolutionList";
import { generateMore } from "../lib/api";
import { useResolutions } from "../lib/resolutionContext";
import GradientButton from "../components/GradientButton";

function GenerateMore() {
  const router = useRouter();
  const [{ resolutions, generated }, dispatch] = useResolutions();

  useEffect(() => {
    if (resolutions.length == 0) {
      router.replace("/", undefined, { shallow: true });
    }
  }, [resolutions]);

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
        dispatch({ type: "ADD_MANY", resolutions: newResolutions.items });
      } else {
        setNoResults(true);
      }
      dispatch({ type: "SET_GENERATED", generated: true });
    }
    setLoading([false, (newResolutions as any).error]);
  };

  return (
    <Box p="20" pr="50">
      <ResolutionList>
        <Heading>Generate More</Heading>
        <Text>
          Now let{"'"}s use some AI magic to generate you some more resolutions.
        </Text>
      </ResolutionList>
      <HStack align="center" mt="4">
        <GradientButton
          onClick={generate}
          isDisabled={loading}
          disabled={loading}
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
    </Box>
  );
}

export default GenerateMore;
