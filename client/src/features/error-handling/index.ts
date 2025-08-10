// Context and Service
export { ErrorHandlingContext, useErrorHandlingService } from "./model/context";
export { ErrorModalProvider, useErrorModal } from "./model/modal-context";
export { createErrorHandlingService } from "./model/service";
export type { ErrorHandlingService, ErrorHandlingConfig } from "./model/types";

// UI Components
export { ErrorModal } from "./ui/error-modal";

// Utilities
export { classifyError } from "./lib/error-classifier";