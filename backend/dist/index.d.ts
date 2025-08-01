import winston from 'winston';
import { DeFiExecutionEngine } from '@/engine/execution-engine';
declare const logger: winston.Logger;
declare const app: import("express-serve-static-core").Express;
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const executionEngine: DeFiExecutionEngine;
export { app, server, executionEngine, logger };
//# sourceMappingURL=index.d.ts.map