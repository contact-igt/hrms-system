import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 10,
  enableKeepAlive: true,
  timezone: "Z",
});

export const db = drizzle(pool, { schema, mode: "default" });

interface DatabaseConnectionRow extends RowDataPacket {
  databaseName: string;
  mysqlVersion: string;
  serverPort: number;
}

export async function checkDatabaseConnection() {
  const [rows] = await pool.query<DatabaseConnectionRow[]>(
    `SELECT
      DATABASE() AS databaseName,
      VERSION() AS mysqlVersion,
      @@port AS serverPort`,
  );
  const connection = rows[0];

  if (!connection) {
    throw new Error("MySQL returned no connection information.");
  }

  return connection;
}
