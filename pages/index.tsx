import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Input,
  Spacer,
  Tooltip,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { FormEvent, useState } from "react";
import { ArrowRight, Plus } from "react-feather";
import { useRouter } from "next/router";
import { useResolutions } from "../lib/resolutionContext";
import ResolutionList from "../components/ResolutionList";

const Home: NextPage = () => {
  const [curr, setCurr] = useState("");
  const [{ resolutions }, dispatch] = useResolutions();

  const addResolution = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (curr) {
      dispatch({ type: "ADD", text: curr });
      setCurr("");
    }
  };

  const canContinue = resolutions.length > 0;
  const router = useRouter();

  const generateMore = () => {
    if (canContinue) {
      router.replace("/generate-more", undefined, { shallow: true });
    }
  };

  return (
    <Box p="20">
      <ResolutionList editable>
        <Heading>Your Resolutions</Heading>
      </ResolutionList>
      <form onSubmit={addResolution}>
        <HStack align="center" mt="3">
          <Tooltip label={!curr && "Enter a resolution"} hasArrow>
            <Box>
              <IconButton
                aria-label="Add Resolution"
                icon={<Plus />}
                colorScheme="green"
                disabled={!curr}
                type="submit"
                size="md"
                variant="outline"
              />
            </Box>
          </Tooltip>
          <Input
            value={curr}
            onChange={(e) => setCurr(e.target.value)}
            placeholder="e.g., eat healthier, ask for a promotion at my company, etc."
            mb="3"
            size="md"
          />
        </HStack>
      </form>
      <Tooltip
        label={canContinue ? "" : "Enter some resolutions before continuing"}
        hasArrow
        flexGrow={0}
      >
        <Box mt="10" width="fit-content">
          <Button
            size="lg"
            rightIcon={<ArrowRight />}
            variant="solid"
            colorScheme="green"
            disabled={!canContinue}
            onClick={generateMore}
          >
            Next
          </Button>
        </Box>
      </Tooltip>
      <Spacer />
    </Box>
  );
};

export default Home;
