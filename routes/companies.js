"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

// router.post("/", ensureLoggedIn, async function (req, res, next) {
router.post("/", ensureAdmin, async function (req, res, next) {
  try { //my code; adding ensureAdmin middleware
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const companies = await Company.findAll();
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});


/*
Part Two: Adding filtering
http://localhost:3001/companies/filter?name=bauer&minEmployees=5&maxEmployees=20  this works
*/

router.get("/filter", async function (req, res, next) {
  try {
    console.log("This is req.query: ", req.query);
    // return res.json(req.query);
    // let queryResult = {
    //   name: "bauer",
    //   minEmployees: "5",
    //   maxEmployees: "20"
    // }
    let queryResult = req.query
    // can I change name to %name% ?

    if(parseInt(queryResult.minEmployees) > parseInt(queryResult.maxEmployees)){
      throw new BadRequestError('Min employees cannot exceed max', 400);
    }
    const companies = await Company.filter(queryResult);
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});




/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

// router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try { //my code; added ensureAdmin middleware
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

// router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try { //my code; added ensureAdmin middleware
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;