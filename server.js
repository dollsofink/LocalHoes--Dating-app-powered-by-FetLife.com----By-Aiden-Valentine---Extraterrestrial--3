import express from "express";
import fs from "fs-extra";
import path from "path";
import router from "./routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(router);

if (process.argv[2] === "export") {
  await fs.remove("./export");
  await fs.copy("./public", "./export");
  console.log("🔥 Static site exported to /export");
  process.exit(0);
}

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

export const QUEUE_COOLDOWN_MINUTES = Number(
  process.env.QUEUE_COOLDOWN_MINUTES || 5
);
