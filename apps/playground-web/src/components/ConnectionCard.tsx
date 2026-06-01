import CableRoundedIcon from "@mui/icons-material/CableRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { Button, Card, CardContent, Chip, Stack, TextField, Typography } from "@mui/material";

type ConnectionState = {
  url: string;
  hasDatabaseUrl: boolean;
};

type ConnectionCardProps = {
  connection: ConnectionState;
  onConnectionChange: (next: ConnectionState) => void;
  onApplyDefaults: () => void;
};

export function ConnectionCard({
  connection,
  onConnectionChange,
  onApplyDefaults,
}: ConnectionCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5">Connection target</Typography>
              <Typography variant="body2" color="text.secondary">
                The frontend posts request envelopes to the local playground API.
                The API then opens the Vaylix SDK connection using this URL.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip
                icon={<CableRoundedIcon />}
                label={connection.hasDatabaseUrl ? "Loaded from env" : "Manual URL"}
                color={connection.hasDatabaseUrl ? "success" : "default"}
              />
              <Button
                variant="outlined"
                startIcon={<ReplayRoundedIcon />}
                onClick={onApplyDefaults}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
          <TextField
            label="DATABASE_URL"
            fullWidth
            value={connection.url}
            onChange={(event) =>
              onConnectionChange({
                ...connection,
                url: event.target.value,
              })
            }
            placeholder="vaylix://user:password@127.0.0.1:9173"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
