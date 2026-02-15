/*
 * MESSAGES
 */
 
import express from "express";
import expressLayouts from "express-ejs-layouts"
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  archiveMessage
} from "../db.js";
import { enqueueMessage } from "../db.js";
import { listQueue, removeQueueItem } from "../db.js";
import { getCsrfToken } from "../csrf-token.mjs";

const router = express.Router();

// Set EJS as the view engine
// app.set("view engine", "ejs")
// Use express-ejs-layouts middleware
router.use(expressLayouts)

// Messages pages
router.get("/messages", (_, res) =>
  res.sendFile("messages.html", { root: "public" })
);
router.get("/messages/new", (_, res) =>
  res.sendFile("new-message.html", { root: "public" })
);

// Messages API
router.get("/api/messages", async (_, res) =>
  res.json(await getMessages())
);

router.post("/api/messages", async (req, res) => {
  const id = await createMessage(req.body);
  res.json({ success: true, id });
});

router.put("/api/messages/:id", async (req, res) => {
  await updateMessage(req.params.id, req.body);
  res.json({ success: true });
});

router.delete("/api/messages/:id", async (req, res) => {
  await deleteMessage(req.params.id);
  res.json({ success: true });
});

router.post("/api/messages/:id/archive", async (req, res) => {
  await archiveMessage(req.params.id);
  res.json({ success: true });
});

// 🚨 Puppeteer placeholder
/*
router.post("/api/messages/:id/send", async (req, res) => {
  // TODO: trigger external Puppeteer script
  console.log("SEND MESSAGE VIA PUPPETEER:", req.params.id);
  res.json({ queued: true });
});
*/

router.post("/api/messages/:id/send", async (req, res) => {
  const priority = Number(req.body.priority || 0);
  await enqueueMessage(req.params.id, priority);
  // try {
    // // const intel = await api.get("intel"); // uses endpoint defaults
    // // res.json({ intel });
	// res.json({ queued: true });
  // } catch (e) {
    // res.status(502).json({ error: e?.message ?? "Message failed to send." });
  // }
});

/*
 * MESSAGES QUEUE 
 */
router.get("/messages/queue", (_, res) =>
  res.sendFile("queue.html", { root: "public" })
);

router.get("/api/messages/queue", async (_, res) =>
  res.json(await listQueue())
);

router.delete("/api/messages/queue/:id", async (req, res) => {
  await deleteQueueItem(req.params.id);
  res.json({ deleted: true });
});

export default router