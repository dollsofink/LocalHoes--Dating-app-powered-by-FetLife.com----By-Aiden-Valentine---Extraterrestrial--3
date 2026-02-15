/* FAMILIES */
 
import express from "express";
import expressLayouts from "express-ejs-layouts"
import AppDAO from '../db/database.js'
import FamilyController from '../controllers/familyController.js'
import { listFamilies, getFamily, createFamily, updateFamily, addUserToFamily } from "../db.js"
import { getCsrfToken } from "../csrf-token.mjs";

const router = express.Router();

const dao = new AppDAO('../database.sqlite');
console.log(dao)
const familyController = new FamilyController(dao);
console.log(familyController)

router.get("/api/family/:name", async (req, res) => {
  var response = await familyController.getFamily(req.params.name)
  res.json(response)
});

router.post("/api/family", async (req, res) => {
  var response = await familyController.createFamily(req.body)
  res.json(response)
});

router.post("/api/family/:name/:user", async (req, res) => {
  var response = await familyController.addUserToFamily(req.params.name, req.params.user)
  res.json(response)
});

export default router