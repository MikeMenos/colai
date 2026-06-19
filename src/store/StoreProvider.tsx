"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AppBootstrap from "./AppBootstrap";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>
    <AppBootstrap />
    {children}
  </Provider>;
}
