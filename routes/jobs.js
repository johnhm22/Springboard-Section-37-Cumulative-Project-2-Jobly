"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobFilterSchema = require("../schemas/jobFilter.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */

// router.post("/", ensureLoggedIn, async function (req, res, next) {
router.post("/", ensureAdmin, async function (req, res, next) {
  try { //my code; adding ensureAdmin middleware
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
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
    const jobs = await Job.findAll();
    return res.json({ jobs });
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
    const validator = jsonschema.validate(req.query, jobFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }


    console.log("This is req.query: ", req.query);
 
    let queryResult = req.query

    const jobs = await Job.filter(queryResult);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});




/** GET /[title]  =>  { title }
 *
 *  Job is { title, salary, equity, company_handle }
 *   where jobs is [{ id, title, salary, equity, company_handle }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches jobs data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */


router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[title]  =>  { deleted: title }
 *
 * Authorization: login
 */

// router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try { //my code; added ensureAdmin middleware
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
