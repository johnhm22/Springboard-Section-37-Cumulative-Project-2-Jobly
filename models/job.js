"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilter } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   No duplicate check is deemed necessary
   * */

  static async create({ title, salary, equity, company_handle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
        [
        title,
        salary,
        equity,
        company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs`);
    return jobsRes.rows;
  }


  /*
Part Two: Adding Filtering


  */

  static async filter(queryResult) {

  const { values, setCols } = sqlForFilter(
    queryResult,
    {
      title: "title",
      minSalary: "salary",
      hasEquity: "equity"
    });
  

  let mainQuery =  `SELECT title, salary, equity, company_handle FROM jobs WHERE ${setCols}`;
    
    const res = await db.query(mainQuery, [...values]);
    
    const job = res.rows;

      if (!job) throw new NotFoundError(`No job: ${filter}`);

      return job;
  }







  /** Given a job title, return data about the job.
   *
   * Returns { title, salary, equity, company_handle }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          salary: "salary",
          equity: "equity",
        });
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idIdx} 
                      RETURNING title, 
                                salary, 
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with reference: ${id}`);

    return job;
  }



  /** Delete given job id from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with reference: ${id}`);
  }
}


module.exports = Job;