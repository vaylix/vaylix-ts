import { Switch, Stack, TextField, Typography } from "@mui/material";

import type { PlaygroundField } from "@vaylix/playground-shared";

type OperationFieldProps = {
  field: PlaygroundField;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
};

export function OperationField({ field, value, onChange }: OperationFieldProps) {
  if (field.kind === "switch") {
    return (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack spacing={0.25}>
          <Typography variant="body1">{field.label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {field.description}
          </Typography>
        </Stack>
        <Switch
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
      </Stack>
    );
  }

  const multiline = field.kind === "textarea" || field.kind === "json";
  const type = field.kind === "number" ? "number" : "text";

  return (
    <TextField
      fullWidth
      label={field.label}
      helperText={field.description}
      placeholder={field.placeholder}
      type={type}
      multiline={multiline}
      minRows={multiline ? (field.kind === "json" ? 7 : 4) : undefined}
      value={typeof value === "boolean" ? "" : String(value ?? "")}
      onChange={(event) => {
        if (field.kind === "number") {
          onChange(event.target.value === "" ? "" : Number(event.target.value));
          return;
        }
        onChange(event.target.value);
      }}
    />
  );
}
