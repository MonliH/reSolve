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
import { ArrowLeft, ArrowRight, Star } from "react-feather";
import ResolutionList from "../components/ResolutionList";
import { generateMore } from "../lib/api";
import { useResolutions } from "../lib/resolutionContext";

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

  // true = trying again
  // false = not trying again
  // null = tried again, but still no result
  const [tryingAgain, setTryingAgain] = useState<boolean | null>(false);

  const generate = async () => {
    // Generate more resolutions
    setLoading([true, undefined]);
    const textResolutions = resolutions.map((r) => r.text);
    let newResolutions = await generateMore(textResolutions);
    if ("items" in newResolutions) {
      if (newResolutions.items.length > 0) {
        dispatch({ type: "ADD_MANY", resolutions: newResolutions.items });
      } else {
        setTryingAgain(true);
        newResolutions = await generateMore(textResolutions, 0.8);
        if ("items" in newResolutions) {
          if (newResolutions.items.length > 0) {
            dispatch({ type: "ADD_MANY", resolutions: newResolutions.items });
          }
          setTryingAgain(false);
        } else {
          setTryingAgain(null);
        }
      }
    }
    setLoading([false, (newResolutions as any).error]);
  };

  return (
    <Box p="20">
      <ResolutionList>
        <Heading>Generate More</Heading>
        <Text>
          Now let{"'"}s use some AI magic to generate you some more resolutions.
        </Text>
      </ResolutionList>
      <HStack align="center" mt="4">
        <Button
          display="flex"
          alignItems="center"
          leftIcon={<Star size={20} />}
          onClick={generate}
          isDisabled={loading}
          loadingText="Generating"
          size="lg"
          isLoading={loading}
          variant={loading ? "outline" : "solid"}
        >
          <Box as="span" mt="1">
            {tryingAgain === true ? "Retrying" : "Generate More"}
          </Box>
        </Button>
        {tryingAgain === true ? (
          <Text color="blue">
            No suggestions generated. Trying again with more dynamic network
            parameters.
          </Text>
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : tryingAgain === null ? (
          <Text color="orange">
            No results generated. The API is likely being rate-limited; Try
            again in a few moments.
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
          onClick={() => router.replace("/suggestions")}
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
