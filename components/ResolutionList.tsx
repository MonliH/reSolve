import update from "immutability-helper";
import {
  Box,
  ButtonGroup,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Fade,
  HStack,
  IconButton,
  useEditableControls,
} from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { Check, Edit2, Trash, X } from "react-feather";
import { Resolution, useResolutions } from "../lib/resolutionContext";

function EditableControls({ onDelete }: { onDelete: () => void }) {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="md">
      <IconButton
        aria-label="Apply"
        icon={<Check />}
        {...getSubmitButtonProps()}
      />
      <IconButton
        aria-label="Cancel"
        icon={<X />}
        {...getCancelButtonProps()}
      />
    </ButtonGroup>
  ) : (
    <ButtonGroup justifyContent="center" size="md">
      <IconButton
        aria-label="Edit"
        size="md"
        icon={<Edit2 />}
        {...getEditButtonProps()}
      />
      <IconButton
        icon={<Trash />}
        aria-label="Delete"
        onClick={onDelete}
        colorScheme="red"
      />
    </ButtonGroup>
  );
}

function Edit({
  r,
  idx,
  editable,
}: {
  r: Resolution;
  idx: number;
  editable: boolean;
}) {
  const [_, dispatch] = useResolutions();
  const rText = r.text;
  const [value, setValue] = useState(rText);

  useEffect(() => {
    setValue(rText);
  }, [rText]);

  const onSubmit = (e: string) => {
    dispatch({ type: "UPDATE", idx, text: value });
  };
  return (
    <Editable
      value={value}
      onChange={setValue}
      isPreviewFocusable={false}
      display="flex"
      alignItems="center"
      pt="2"
      fontSize="2xl"
      onSubmit={onSubmit}
      flexGrow={1}
    >
      <EditableInput flexGrow={1} />
      <Box flexGrow={1}>
        <EditablePreview />
        {r.aiGenerated && (
          <Box
            as="span"
            ml="2"
            color="blue.300"
            userSelect="none"
            cursor="default"
          >
            <sup>AI</sup>
          </Box>
        )}
      </Box>
      {(editable || r.aiGenerated) && (
        <Box ml="3">
          <EditableControls
            onDelete={() => dispatch({ type: "REMOVE", idx })}
          />
        </Box>
      )}
    </Editable>
  );
}

export default function ResolutionList({
  editable = false,
  children,
}: {
  editable?: boolean;
  children?: ReactNode;
}) {
  const [{ resolutions }, dispatch] = useResolutions();
  const [hover, setHover] = useState<boolean[]>([]);

  useEffect(() => {
    if (hover.length !== resolutions.length) {
      // Match the length of `hover` with the length of `resolutions`
      setHover(new Array(resolutions.length).fill(false));
    }
  }, [resolutions]);

  return (
    <Box>
      <Box mb="4">{children}</Box>
      {resolutions.map((r, idx) => (
        <Box
          key={idx + r.text}
          onMouseLeave={() =>
            setHover((old) =>
              update(old, {
                [idx]: { $set: false },
              })
            )
          }
          onMouseEnter={() =>
            setHover((old) =>
              update(old, {
                [idx]: { $set: true },
              })
            )
          }
        >
          <Edit r={r} idx={idx} editable={editable} />
          <Divider />
        </Box>
      ))}
    </Box>
  );
}
