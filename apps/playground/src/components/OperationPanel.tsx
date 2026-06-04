import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

import type { PlaygroundOperation } from "../types";
import { OperationField } from "./OperationField";

type OperationPanelProps = {
  operation: PlaygroundOperation;
  fieldValues: Record<string, string | number | boolean>;
  onFieldChange: (key: string, value: string | number | boolean) => void;
  onExecute: () => Promise<void>;
  loading: boolean;
};

export function OperationPanel({
  operation,
  fieldValues,
  onFieldChange,
  onExecute,
  loading,
}: OperationPanelProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography variant="h4">{operation.title}</Typography>
            <Typography variant="body1" color="text.secondary">
              {operation.summary}
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={2}>
            {operation.fields.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                This operation does not require an explicit payload.
              </Typography>
            ) : (
              operation.fields.map((field) => (
                <OperationField
                  key={field.key}
                  field={field}
                  value={fieldValues[field.key]}
                  onChange={(value) => onFieldChange(field.key, value)}
                />
              ))
            )}
          </Stack>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={() => void onExecute()}
            disabled={loading}
          >
            {loading ? "Executing..." : "Execute Operation"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
