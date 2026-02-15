import express from "express"
import { getUserInfo, saveThumbnail, saveAllThumbnails, followUser, addAsFriend } from "../fetlife-user.mjs"
import { getCsrfToken } from "../csrf-token.mjs"

export default function usersRouter(userController) {
	const router = express.Router()

	/*
	 * USERS - VIEWS
	 */

	router.get('/user', (req, res) => {
	  res.render('users') // This will use the 'admin' layout
	})

	// router.get("/", (_, res) => res.sendFile("index.html", { root: "public" }));
	router.get("/", (_, res) => {
		res.render("users", {
			title: "BB's db - It's a SEX CLUB!",
			motto: "LocalHoes | Dating app powered by FetLife",
			subtitle: "Dating app powered by FetLife",
			greeting: "",
		})
	})
	router.get("/grid", (_, res) => {
		res.render("users-grid", {
			title: "BB's db - It's a SEX CLUB!"
		})
	})

	/*
	 * USERS - API
	 */
	 router.get("/api/users", async (req, res) => {
	  try {
		// const limit = req.query.limit || 9999
		// const users = await getUsers(req.query.q, limit, req.query.offset || 0);
		const users = await getUsers(req.query.q)
		res.json(users)
	  } catch (e) {
		res.status(500).json({ error: e.message })
	  }
	})
	router.get("/api/users/:username", async (req, res) => {
	  var response = await getUserInfo(req.params.username)
	  res.json(response)
	})
	router.post("/api/users/:username", async (req, res) => {
	  var response = await saveUserInfo(req.body)
	  res.json(response)
	})
	router.post("/api/users/:id/friend", async (req, res) => {
	  const id = Number(req.params.id || 0)
	  const csrfToken = await getCsrfToken()
	  var response = await addAsFriend(req.params.id, csrfToken)
	  res.json(response)
	})

	router.post("/api/users/:id/unfriend", async (req, res) => {
	  const id = Number(req.params.id || 0)
	  // var response = await removeFriend(req.params.id)
	  res.json(response)
	})

	router.post("/api/users/:username/follow", async (req, res) => {
	  const username = req.params.username
	  const csrfToken = await getCsrfToken()
	  // var response = await new User(req.params.id).follow()
	  var response = followUser(req.params.username, csrfToken)
	  res.json(response)
	})

	router.post("/api/users/:username/unfollow", async (req, res) => {
	  const username = req.params.username
	  // var response = await new User(req.params.id).unfollow()
	  // var response = unfollowUser(req.params.username)
	  res.json(response)
	})

	router.get("/api/users/:user/thumbnail", async (req, res) => {
	  var response = await saveThumbnail(req.params.user)
	  res.json(response)
	})

	return router
}