import { ENV } from "./src/config/env.js";

export default {
  schema: "./src/db/schema.js",
  out: "./src/db/migrations",
  dialect: "postgreqsql",
  dbCredentials: { url: ENV.DATABASE_URL}
};
