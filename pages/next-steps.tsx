import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ArrowLeft } from "react-feather";
import GradientButton from "../components/GradientButton";
import withLogo from "../components/withLogo";
import { generateNextSteps } from "../lib/api";
import { Resolution, useResolutions } from "../lib/resolutionContext";

function NextSteps({
  resolution,
  onChange,
}: {
  resolution: Resolution;
  onChange: (checked: boolean, index: number) => void;
}) {
  const r = resolution;
  return (
    <>
      {r.nextStepError && <Text color="red">{r.nextStepError}</Text>}
      <Collapse in={r.nextSteps !== null}>
        <Box mt="2">
          {r.nextSteps?.length === null && (
            <Text>No next steps generated.</Text>
          )}
          <VStack align="left">
            {r.nextSteps?.map((next, idx) => {
              return (
                <HStack key={next.text + idx}>
                  <Checkbox
                    flexGrow={0}
                    isChecked={next.done}
                    onChange={(e) => onChange(e.target.checked, idx)}
                  >
                    {next.text}
                  </Checkbox>
                  <Spacer />
                </HStack>
              );
            })}
          </VStack>
        </Box>
      </Collapse>
    </>
  );
}

function Tips() {
  const router = useRouter();
  const [{ resolutions }, dispatch] = useResolutions();
  const [loading, setLoading] = useState(false);

  const startGeneration = async () => {
    setLoading(true);
    for (let i = 0; i < resolutions.length; i++) {
      if (
        resolutions[i].nextSteps !== null &&
        resolutions[i].nextSteps?.length !== 0
      ) {
        continue;
      }

      dispatch({ type: "SET_LOADING", loading: true, idx: i });
      dispatch({ type: "RESET_ERROR", idx: i });
      const [value, _] = await generateNextSteps(resolutions[i].text);
      if ("nextSteps" in value) {
        dispatch({ type: "SET_NEXT", idx: i, nextSteps: value.nextSteps });
      } else {
        dispatch({ type: "SET_ERROR", error: value.error, idx: i });
      }
      dispatch({ type: "SET_LOADING", loading: false, idx: i });
    }
    setLoading(false);
  };

  const done = resolutions.every((r) => r.nextSteps && r.nextSteps.length > 0);

  return (
    <>
      <Heading>Your Next Steps</Heading>
      <Text mb="4">
        Now we{"'"}ll use some more AI magic to give you <b>specific</b> next
        steps to take, so can can accomplish your goals!
      </Text>
      <Box>
        {resolutions.map((r, rIdx) => {
          return (
            <React.Fragment key={rIdx + r.text}>
              <Box my="4">
                <HStack align="center">
                  <Text mr="2" fontSize="2xl">
                    {r.text}
                  </Text>
                  {r.loading ? <Spinner color="green.300" size="sm" /> : null}
                </HStack>
                <NextSteps
                  resolution={r}
                  onChange={(checked: boolean, idx: number) =>
                    dispatch({
                      type: "SET_NEXT_STEP_DONE",
                      resolutionIdx: rIdx,
                      setIdx: idx,
                      value: checked,
                    })
                  }
                />
              </Box>
              <Divider />
            </React.Fragment>
          );
        })}
      </Box>
      <GradientButton
        mt="4"
        onClick={startGeneration}
        isDisabled={loading || done}
        isLoading={loading}
        bgGradient="linear(to-l, #3a3aff, #3ac4ff)"
      >
        {done ? "Done Generating" : "Generate Next Steps"}
      </GradientButton>
      <Button
        mt="10"
        size="md"
        leftIcon={<ArrowLeft />}
        variant="outline"
        colorScheme="gray"
        onClick={() =>
          router.replace("/generate-more", undefined, { shallow: true })
        }
      >
        Back
      </Button>
    </>
  );
}

export default withLogo(Tips);
