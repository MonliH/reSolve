import {
  Box,
  ButtonGroup,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  HStack,
  IconButton,
  useEditableControls,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Check, Edit2, Trash, X } from "react-feather";
import { useResolutions } from "../lib/resolutionContext";

export default function ResolutionList({
  editable = false,
  skeleton = false,
  children,
}: {
  editable?: boolean;
  skeleton?: boolean;
  children?: ReactNode;
}) {
  const [{ resolutions }, dispatch] = useResolutions();

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
        <IconButton icon={<Trash />} aria-label="Delete" onClick={onDelete} />
      </ButtonGroup>
    );
  }

  return (
    <Box>
      <Box mb="4">{children}</Box>
      {resolutions.map((r, idx) => (
        <Box key={idx}>
          <HStack flexGrow={1} fontSize="2xl" mb="3">
            <Editable
              value={r.text}
              onChange={(s) => dispatch({ type: "UPDATE", idx, text: s })}
              flexGrow={1}
              isPreviewFocusable={false}
              display="flex"
              alignItems="center"
              pt="2"
            >
              <EditableInput flexGrow={1} />
              <EditablePreview flexGrow={1} />
              {editable && (
                <EditableControls
                  onDelete={() => dispatch({ type: "REMOVE", idx })}
                />
              )}
            </Editable>
          </HStack>
          <Divider />
        </Box>
      ))}
    </Box>
  );
}
