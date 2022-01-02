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
import { MAX_RESOLUTIONS, useResolutions } from "../lib/resolutionContext";
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
  const router = useRouter();

  const generateMore = () => {
    if (canContinue) {
      router.replace("/generate-more", undefined, { shallow: true });
    }
  };

  const resolutionsSet = new Set(resolutions.map((r) => r.text));
  const overLimit = resolutions.length >= MAX_RESOLUTIONS;

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
            <Tooltip
              label={
                resolutions.length >= MAX_RESOLUTIONS
                  ? `You may not make over ${MAX_RESOLUTIONS} resolutions`
                  : ""
              }
              cursor="inherit"
              hasArrow
            >
              <HStack
                align="center"
                mt="7"
                userSelect={overLimit ? "none" : "auto"}
                cursor={overLimit ? "not-allowed" : "auto"}
              >
                <FormControl flexBasis={300} flexShrink={0} cursor="inherit">
                  <FormLabel
                    fontWeight="bold"
                    cursor="inherit"
                    opacity={overLimit ? 0.5 : 1}
                  >
                    Chose a preset resolution
                  </FormLabel>
                  <Select
                    placeholder="Resolution"
                    value=""
                    onChange={(e) => {
                      e.preventDefault();
                      addResolution(e.target.value);
                    }}
                    disabled={overLimit}
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
                  <FormLabel
                    opacity={overLimit ? 0.5 : 1}
                    fontWeight="bold"
                    cursor="inherit"
                  >
                    Or enter your own:
                  </FormLabel>
                  <InputGroup>
                    <Input
                      value={curr}
                      onChange={(e) => setCurr(e.target.value)}
                      placeholder="e.g., be more positive, ask for a promotion at my company, etc."
                      size="md"
                      isDisabled={overLimit}
                    />
                    <InputRightElement mr="15px" opacity={overLimit ? 0.5 : 1}>
                      <Tooltip
                        label="Press enter to add"
                        hasArrow
                        isDisabled={overLimit}
                        cursor="default"
                        userSelect="none"
                      >
                        <Box>
                          <Kbd>Enter</Kbd>
                        </Box>
                      </Tooltip>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </HStack>
            </Tooltip>
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
