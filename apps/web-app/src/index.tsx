/** biome-ignore-all lint:suspicious/noExplicitAny */

import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import ReactDOM from "react-dom/client";
import { APP_BASE_PATH } from "@/config";
import App from "./App";
import "virtual-react-local-iconify";
import "@rap/styles/globals.css";
import "./styles/global.css";

import "overlayscrollbars/overlayscrollbars.css";

OverlayScrollbars.plugin(ClickScrollPlugin);

const mockMode = import.meta.env.RAP_WEB_APP_ENABLE_MOCK || "";

const getHandelers = async () => {
  const modules = (() => {
    if (typeof __webpack_require__ !== "undefined") {
      const context = (require as any).context("./mock", false, /\.(ts|js)$/);
      return context.keys().map((key: string) => context(key).default);
    } else {
      const globModules = (import.meta as any).glob("./mock/*.{js,ts}");
      return Promise.all(Object.values(globModules).map((loader: any) => loader())).then((mods) =>
        mods.map((mod: any) => mod.default)
      );
    }
  })();

  const resolvedModules = await modules;
  const handlers = resolvedModules.flat().filter(Boolean);

  return handlers ?? [];
};

const prepareMock = async () => {
  if (import.meta.env.MODE !== "development" || mockMode) return;

  const [{ initMock }, handlers] = await Promise.all([import("@rap/mock-config"), getHandelers()]);

  await initMock(handlers, {
    startOptions: {
      serviceWorker: {
        url: `${APP_BASE_PATH}/mockServiceWorker.js`,
      },
    },
    enableMock: mockMode,
    currentEnvironment: import.meta.env.MODE || "development",
  });
};

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  prepareMock().then(() => {
    root.render(<App />);
  });
}
