/* FAMILIES */
 
import express from "express"
import expressLayouts from "express-ejs-layouts"

const router = express.Router()

export default function familiesRouter(familyController) {
  const router = express.Router()

  router.get("/api/family/:name", async (req, res) => {
    const response = await familyController.getFamilyByName(req.params.name);
    res.json(response)
  })

  router.get("/api/family", async (req, res) => {
    const response = await familyController.getFamilies()
    res.json(response)
  })

  router.post("/api/family", async (req, res) => {
    const response = await familyController.createFamily(req.body)
    res.json(response)
  })

  router.post("/api/family/:familyId/:userId", async (req, res) => {
    const response = await familyController.addUserToFamily({
      familyId: req.params.familyId,
      userId: req.params.userId,
    })

    res.json(response)
  })

  return router
}