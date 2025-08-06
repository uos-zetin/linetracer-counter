import React from "react";

export const composeProviders = (...providers: React.ComponentType<{ children: React.ReactNode }>[]) =>
  providers.reduce((AccumulatedProviders, CurrentProvider) => ({ children }) => (
    <AccumulatedProviders>
      <CurrentProvider>{children}</CurrentProvider>
    </AccumulatedProviders>
  ));
