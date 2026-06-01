import type { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    monospaceBody: CSSProperties;
  }

  interface TypographyVariantsOptions {
    monospaceBody?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    monospaceBody: true;
  }
}
