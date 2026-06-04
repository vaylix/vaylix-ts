import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { PlaygroundResponse, ResultHistoryItem } from "../types";
import { stringifyPreview } from "../utils";

type ResultsSidebarProps = {
  lastResult: PlaygroundResponse | null;
  history: ResultHistoryItem[];
};

function ResultBlock({ title, content }: { title: string; content: string }) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="monospaceBody" component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
        {content}
      </Typography>
    </Stack>
  );
}

export function ResultsSidebar({ lastResult, history }: ResultsSidebarProps) {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Chip icon={<InsightsRoundedIcon />} label="Latest Result" color="primary" />
            {lastResult ? (
              <ResultBlock title="Response" content={stringifyPreview(lastResult)} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No execution has completed yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Chip icon={<HistoryRoundedIcon />} label="History" variant="outlined" />
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Executed requests are recorded here for side-by-side comparison.
              </Typography>
            ) : (
              history.map((item, index) => (
                <Stack key={item.id} spacing={1.25}>
                  {index > 0 ? <Divider /> : null}
                  <Typography variant="caption" color="text.secondary">
                    {item.at}
                  </Typography>
                  <ResultBlock
                    title={item.request.operation}
                    content={stringifyPreview(item.response)}
                  />
                </Stack>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
