import express from "express"
import users from "./users.js"
import messages from "./messages.js"
import families from "./families.js"
import { getCsrfToken } from "../csrf-token.mjs"

export default function createRouter(controllers) {
  const router = express.Router()

  const { userController, messageController, familyController } = controllers

	/*
	 * Middleware - Log all requests to console
	 */
  router.use((req, res, next) => {
    if (
      req.path.includes(".well-known") ||
      req.path.includes("/js") ||
      req.path.includes("/css")
    ) {
      return next()
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[TZ]/g, " ")
      .replace(/\..*/g, " ")
      .trim()

    console.log(`${timestamp} | ${req.method} ${req.path}`)
    next()
  })

  router.use(users(userController))
  router.use(messages(messageController))
  router.use(families(familyController))

  router.get("/api/csrf", async (req, res) => {
    res.json(await getCsrfToken())
  })
  
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
	})


  return router
}