"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AppBootstrap from "./AppBootstrap";
import DevBranchStateReset from "@/components/dev/DevBranchStateReset";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>
    <DevBranchStateReset />
    <AppBootstrap />
    {children}
  </Provider>;
}
