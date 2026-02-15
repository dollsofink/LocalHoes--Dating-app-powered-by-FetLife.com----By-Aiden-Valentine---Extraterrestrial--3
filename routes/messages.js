/*
 * MESSAGES
 */
 
import express from "express";
import expressLayouts from "express-ejs-layouts"
import { getCsrfToken } from "../csrf-token.mjs"

export default function messagesRouter(messageController) {
	const router = express.Router()

	// Set EJS as the view engine
	// app.set("view engine", "ejs")
	// Use express-ejs-layouts middleware
	router.use(expressLayouts)

	// Messages pages
	router.get("/messages", (_, res) =>
	  res.sendFile("messages.html", { root: "public" })
	)
	router.get("/messages/new", (_, res) =>
	  res.sendFile("new-message.html", { root: "public" })
	)

	// Messages API
	router.get("/api/messages", async (_, res) =>
	  res.json(await messageController.getMessages())
	)

	router.post("/api/messages", async (req, res) => {
	  const id = await messageController.createMessage(req.body)
	  res.json({ success: true, id })
	})

	router.put("/api/messages/:id", async (req, res) => {
	  await messageController.updateMessage(req.params.id, req.body)
	  res.json({ success: true })
	})

	router.delete("/api/messages/:id", async (req, res) => {
	  await messageController.deleteMessage(req.params.id)
	  res.json({ success: true })
	})

	router.post("/api/messages/:id/archive", async (req, res) => {
	  await messageController.archiveMessage(req.params.id)
	  res.json({ success: true })
	})

	// 🚨 Puppeteer placeholder
	/*
	router.post("/api/messages/:id/send", async (req, res) => {
	  // TODO: trigger external Puppeteer script
	  console.log("SEND MESSAGE VIA PUPPETEER:", req.params.id)
	  res.json({ queued: true })
	})
	*/

	router.post("/api/messages/:id/send", async (req, res) => {
	  const priority = Number(req.body.priority || 0)
	  await messageController.enqueueMessage(req.params.id, priority)
	  // try {
		// // const intel = await api.get("intel"); // uses endpoint defaults
		// // res.json({ intel });
		// res.json({ queued: true });
	  // } catch (e) {
		// res.status(502).json({ error: e?.message ?? "Message failed to send." });
	  // }
	})

	/*
	 * MESSAGES QUEUE 
	 */
	router.get("/messages/queue", (_, res) =>
	  res.sendFile("queue.html", { root: "public" })
	)

	router.get("/api/messages/queue", async (_, res) =>
	  res.json(await messageController.listQueue())
	)

	router.delete("/api/messages/queue/:id", async (req, res) => {
	  await messageController.deleteQueueItem(req.params.id)
	  res.json({ deleted: true })
	})
	
	return router
}