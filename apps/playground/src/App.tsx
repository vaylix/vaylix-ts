import { Box, Container, Stack } from "@mui/material";

import { ConnectionCard } from "./components/ConnectionCard";
import { HeroCard } from "./components/HeroCard";
import { OperationPanel } from "./components/OperationPanel";
import { OperationsSidebar } from "./components/OperationsSidebar";
import { RequestPreviewCard } from "./components/RequestPreviewCard";
import { ResultsSidebar } from "./components/ResultsSidebar";
import { usePlayground } from "./hooks/usePlayground";

export default function App() {
  const playground = usePlayground();

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <HeroCard />
          <ConnectionCard
            connection={playground.connection}
            onConnectionChange={playground.setConnection}
            onApplyDefaults={playground.applyDefaults}
          />

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(260px, 320px) minmax(0, 1fr) minmax(280px, 360px)",
              },
              alignItems: "stretch",
            }}
          >
            <Box>
              <OperationsSidebar
                categories={playground.categories}
                selectedOperation={playground.selectedOperation}
                onSelectOperation={playground.setSelectedOperation}
              />
            </Box>

            <Box>
              <Stack spacing={3}>
                <OperationPanel
                  operation={playground.operation}
                  fieldValues={playground.fieldValues}
                  onFieldChange={playground.setFieldValue}
                  onExecute={playground.executeOperation}
                  loading={playground.loading}
                />
                <RequestPreviewCard
                  requestPreview={playground.requestPreview}
                  payloadPreview={playground.payloadPreview}
                />
              </Stack>
            </Box>

            <Box>
              <ResultsSidebar
                lastResult={playground.lastResult}
                history={playground.history}
              />
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
