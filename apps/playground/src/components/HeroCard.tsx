import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export function HeroCard() {
  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip icon={<HubRoundedIcon />} label="SDK Playground" color="primary" />
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Vite 8 + Fastify + MUI"
              variant="outlined"
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h3">Interactive Vaylix client debugger</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900 }}>
              The playground is split into explicit UI modules and a small API
              surface so request construction, payload inspection, and result
              rendering are independently debuggable.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
