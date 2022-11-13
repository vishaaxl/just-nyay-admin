import "styles/reset.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";

import Layout from "components/Layout";
import { defaultTheme } from "data/theme";
import { AuthProvider } from "context/User";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer />
      </ThemeProvider>
    </AuthProvider>
  );
}
