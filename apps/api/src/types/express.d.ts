import type { AuthContext } from "../common/middleware/authenticate.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: AuthContext;
    }
  }
}

export {};
