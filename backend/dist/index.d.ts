import winston from 'winston';
import { GenericExecutionEngine } from '@/engine/generic-execution-engine';
import './preview-server';
declare const logger: winston.Logger;
declare const app: import("express-serve-static-core").Express;
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const executionEngine: GenericExecutionEngine;
export { app, server, executionEngine, logger };
//# sourceMappingURL=index.d.ts.map