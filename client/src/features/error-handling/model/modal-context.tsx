import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { ErrorHandlingConfig } from "./types";

interface ErrorModalState {
  isOpen: boolean;
  config: ErrorHandlingConfig | null;
  onAction?: () => void;
}

interface ErrorModalContextType {
  state: ErrorModalState;
  showModal: (config: ErrorHandlingConfig, onAction?: () => void) => void;
  hideModal: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextType | null>(null);

export function ErrorModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ErrorModalState>({
    isOpen: false,
    config: null,
    onAction: undefined,
  });

  const showModal = (config: ErrorHandlingConfig, onAction?: () => void) => {
    setState({
      isOpen: true,
      config,
      onAction,
    });
  };

  const hideModal = () => {
    setState({
      isOpen: false,
      config: null,
      onAction: undefined,
    });
  };

  return (
    <ErrorModalContext.Provider value={{ state, showModal, hideModal }}>
      {children}
    </ErrorModalContext.Provider>
  );
}

export function useErrorModal() {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error("useErrorModal must be used within ErrorModalProvider");
  }
  return context;
}