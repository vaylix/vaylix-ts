import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import {
  Card,
  CardContent,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import type { PlaygroundOperation, PlaygroundOperationId } from "@vaylix/playground-shared";

type CategoryGroup = {
  category: PlaygroundOperation["category"];
  operations: PlaygroundOperation[];
};

type OperationsSidebarProps = {
  categories: CategoryGroup[];
  selectedOperation: PlaygroundOperationId;
  onSelectOperation: (operationId: PlaygroundOperationId) => void;
};

export function OperationsSidebar({
  categories,
  selectedOperation,
  onSelectOperation,
}: OperationsSidebarProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip icon={<TerminalRoundedIcon />} label="Operations" color="secondary" />
          </Stack>
          <Stack
            spacing={2}
            sx={{
              minHeight: 0,
              overflowY: "auto",
              pr: 0.5,
            }}
          >
            {categories.map((group) => (
              <Stack key={group.category} spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  {group.category}
                </Typography>
                <List dense disablePadding>
                  {group.operations.map((operation) => (
                    <ListItemButton
                      key={operation.id}
                      selected={selectedOperation === operation.id}
                      onClick={() => onSelectOperation(operation.id)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.75,
                        border: "1px solid transparent",
                      }}
                    >
                      <ListItemText
                        primary={operation.title}
                        secondary={operation.summary}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
