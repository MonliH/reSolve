import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Select,
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

  const addResolution = (resolution: string) => {
    if (resolution) {
      dispatch({ type: "ADD", text: resolution });
    }
  };

  const canContinue = resolutions.length > 0;
  const router = useRouter();

  const generateMore = () => {
    if (canContinue) {
      router.replace("/generate-more", undefined, { shallow: true });
    }
  };

  const resolutionsSet = new Set(resolutions.map((r) => r.text));

  return (
    <Box p="20" pr="50">
      <ResolutionList editable>
        <Heading>Add Your Resolutions</Heading>
      </ResolutionList>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addResolution(curr);
          setCurr("");
        }}
      >
        <HStack align="center" mt="7">
          <FormControl flexBasis={300} flexShrink={0}>
            <FormLabel>Chose a preset resolution</FormLabel>
            <Select
              placeholder="Resolution"
              value=""
              onChange={(e) => {
                e.preventDefault();
                addResolution(e.target.value);
              }}
            >
              {[
                "Improve my mental health",
                "Eat healthier food",
                "Stop playing video games",
                "Save more money",
              ].map((v, idx) =>
                resolutionsSet.has(v) ? null : (
                  <option key={idx} value={v}>
                    {v}
                  </option>
                )
              )}
            </Select>
          </FormControl>
          <FormControl flexGrow={3} width="100%">
            <FormLabel>Or enter your own:</FormLabel>
            <InputGroup>
              <Input
                value={curr}
                onChange={(e) => setCurr(e.target.value)}
                placeholder="e.g., eat healthier, ask for a promotion at my company, etc."
                size="md"
              />
              <InputRightElement mr="15px">
                <Tooltip label="Press enter to add" hasArrow>
                  <Box>
                    <Kbd>Enter</Kbd>
                  </Box>
                </Tooltip>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Spacer flexGrow={2} flexBasis={1000} />
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
