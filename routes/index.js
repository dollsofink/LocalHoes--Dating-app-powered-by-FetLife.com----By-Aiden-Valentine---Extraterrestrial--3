import express from "express"
import users from "./users.js"
import messages from "./messages.js"
import families from "./families.js"
import { getCsrfToken } from "../csrf-token.mjs";

const router = express.Router()

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

router.use(users)
router.use(messages)
router.use(families)

/*
 * UTILITIES 
 */
router.get("/api/csrf", async (req, res) => {
  res.json(await getCsrfToken())
});

router.post("/api/thumbnails/refresh", async (req, res) => {
  // try {
	// const users = await getUsers(req.query.q, limit ?? 9999, req.query.offset || 0)
	const users = await getUsers(req.query.q)
	console.log(users)
	res.json({
	  "message": "Updating all thumbnails in the db."
	})
	// for await (var user of users) {
		// console.log(`${user.user}`)
		var response = await saveAllThumbnails(users)
	// }
  // } catch (e) {
    // res.status(500).json({ error: e.message });
  // }
});

export default router