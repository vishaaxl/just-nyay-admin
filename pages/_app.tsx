import "styles/reset.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import { ConfirmProvider } from "material-ui-confirm";

import Layout from "components/Layout";
import { defaultTheme } from "data/theme";
import { AuthProvider } from "context/User";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>
        <ConfirmProvider>
          <Layout>
            <NextNProgress
              color="#4B49AC"
              height={2}
              showOnShallow={true}
              options={{ showSpinner: false }}
            />
            <Component {...pageProps} />
          </Layout>
          <ToastContainer />
        </ConfirmProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
