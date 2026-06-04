import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import type { PlaygroundRequest } from "@vaylix/playground-shared";
import { stringifyPreview } from "../utils";

type RequestPreviewCardProps = {
  requestPreview: PlaygroundRequest;
  payloadPreview: string;
};

export function RequestPreviewCard({
  requestPreview,
  payloadPreview,
}: RequestPreviewCardProps) {
  return (
    <Card sx={{ flexShrink: 0 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Chip icon={<DataObjectRoundedIcon />} label="Request Preview" />
          </Stack>
          <Typography variant="monospaceBody" component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
            {stringifyPreview({
              url: requestPreview.url,
              operation: requestPreview.operation,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payload
          </Typography>
          <Typography variant="monospaceBody" component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
            {payloadPreview}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
