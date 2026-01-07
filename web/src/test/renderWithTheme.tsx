import type { PropsWithChildren, ReactElement } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import { appTheme } from "@/theme/theme";

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: Wrapper });
}


