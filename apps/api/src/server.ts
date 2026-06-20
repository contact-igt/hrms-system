import { app } from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection, pool } from "./database/client.js";

let server: ReturnType<typeof app.listen> | undefined;

async function start() {
  try {
    const connection = await checkDatabaseConnection();
    console.log(
      `Database connected: ${connection.databaseName} on port ${connection.serverPort} (MySQL ${connection.mysqlVersion})`,
    );

    server = app.listen(env.API_PORT, () => {
      console.log(`HRMS API listening on http://localhost:${env.API_PORT}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Database connection failed: ${message}`);
    await pool.end();
    process.exitCode = 1;
  }
}

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down HRMS API.`);

  if (!server) {
    await pool.end();
    return;
  }

  server.close(async () => {
    await pool.end();
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void start();
