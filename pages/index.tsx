import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Kbd,
  Select,
  Spacer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState } from "react";
import { ArrowRight } from "react-feather";
import { useRouter } from "next/router";
import { useResolutions } from "../lib/resolutionContext";
import ResolutionList from "../components/ResolutionList";
import withLogo from "../components/withLogo";

const Home: NextPage = () => {
  const [curr, setCurr] = useState("");
  const [{ resolutions }, dispatch] = useResolutions();

  const addResolution = (resolution: string) => {
    if (resolution) {
      dispatch({ type: "ADD", text: resolution });
    }
  };

  const canContinue = resolutions.length > 0;
  console.log(resolutions, canContinue, resolutions.length);
  const router = useRouter();

  const generateMore = () => {
    if (canContinue) {
      router.replace("/generate-more", undefined, { shallow: true });
    }
  };

  const resolutionsSet = new Set(resolutions.map((r) => r.text));

  return (
    <>
      <HStack width="100%">
        <Box flexGrow={1} width="100%">
          <ResolutionList editable>
            <Heading>Add Your Resolutions</Heading>
            <Text>
              Keep it short. Add one to two items, then we{"'"}ll generate the
              rest for you!
            </Text>
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
                <FormLabel fontWeight="bold">
                  Chose a preset resolution
                </FormLabel>
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
                    "Play fewer video games",
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
              <FormControl width="100%">
                <FormLabel fontWeight="bold">Or enter your own:</FormLabel>
                <InputGroup>
                  <Input
                    value={curr}
                    onChange={(e) => setCurr(e.target.value)}
                    placeholder="e.g., be more positive, ask for a promotion at my company, etc."
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
            </HStack>
          </form>
        </Box>
        <Spacer flexGrow={0} flexBasis={[null, null, "0", "50vw"]} />
      </HStack>
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
            isDisabled={!canContinue}
            onClick={generateMore}
          >
            Next
          </Button>
        </Box>
      </Tooltip>
      <Spacer />
    </>
  );
};

export default withLogo(Home);
