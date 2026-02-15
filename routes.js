import express from "express";
import path from "node:path"
import expressLayouts from "express-ejs-layouts"
import { getUsers } from "./db.js";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  archiveMessage
} from "./db.js";
import { enqueueMessage } from "./db.js";
import { listQueue, removeQueueItem } from "./db.js";
import { getCsrfToken } from "./csrf-token.mjs";
import { saveThumbnail } from "./fetlife-user.mjs"

const router = express.Router();

// Set EJS as the view engine
// app.set("view engine", "ejs")
// Use express-ejs-layouts middleware
router.use(expressLayouts)
// app.set('layout', './partials/layout')
// Set the directory for your views
// app.set('views', path.join("./", 'views'))

/*
 * Middleware - Log all requests to console
 */
router.use((req, res, next) => {
	// Skip common requests
	if (req.path.includes(".well-known") || req.path.includes("/js") | req.path.includes("/css")) {
		return
	}
	const timestamp = new Date(Date.now()).toISOString().replace(/[TZ]/g, " ").replace(/\..*/g, " ").trim()
	console.log(`${timestamp} | ${req.method} ${req.path}`)
	next()
})

// Optional: Set a specific layout for the admin panel
// router.use((req, res, next) => {
	// req.app.set('layout', 'layout/full-width'); // Assuming 'admin' is in your views folder
	// next();
// });

router.get("/api/users", async (req, res) => {
  try {
	const limit = req.query.limit || 25
	const users = await getUsers(req.query.q, limit, req.query.offset || 0);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/user', (req, res) => {
  res.render('users'); // This will use the 'admin' layout
});

// router.get("/", (_, res) => res.sendFile("index.html", { root: "public" }));
router.get("/", (_, res) => {
    res.render("users", {
		title: "BB's db - It's a SEX CLUB!",
        motto: "LocalHoes | Dating app powered by FetLife",
        subtitle: "Dating app powered by FetLife",
        greeting: "",
    });
});
router.get("/grid", (_, res) => {
    res.render("users-grid", {
		title: "BB's db - It's a SEX CLUB!"
	})
});

/*
 * UTILITIES 
 */
router.get("/api/csrf", async (req, res) => {
  res.json(await getCsrfToken())
});

/*
 * MESSAGES
 */
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
router.get("/queue", (_, res) =>
  res.sendFile("queue.html", { root: "public" })
);

router.get("/api/queue", async (_, res) =>
  res.json(await listQueue())
);

router.delete("/api/queue/:id", async (req, res) => {
  await removeQueueItem(req.params.id);
  res.json({ deleted: true });
});

/*
 * USERS 
 */
router.post("/api/users/:id/friend", async (req, res) => {
  const id = Number(req.params.id || 0)
  // var response = await addFriend(req.params.id)
  res.json(response)
});

router.post("/api/users/:id/friend", async (req, res) => {
  const id = Number(req.params.id || 0)
  // var response = await removeFriend(req.params.id)
  res.json(response)
});

router.post("/api/users/:id/follow", async (req, res) => {
  const id = Number(req.params.id || 0)
  // var response = await new User(req.params.id).follow()
  res.json(response)
});

router.post("/api/users/:id/unfollow", async (req, res) => {
  const id = Number(req.params.id || 0)
  // var response = await new User(req.params.id).unfollow()
  res.json(response)
});

router.get("/api/users/:user/thumbnail", async (req, res) => {
  var response = await saveThumbnail(req.params.user)
  res.json(response)
});

export default router;