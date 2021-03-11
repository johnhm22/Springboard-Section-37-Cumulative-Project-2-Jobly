"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");

const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: "0",
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        // id: 31, // what should this be?
        title: "new",
        salary: 50000,
        equity: "0",
        company_handle: "c1"
      },
    ]);
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "jobTitle1",
        salary: 10,
        equity: "0",
        company_handle: "c1"
      },
      {
        title: "jobTitle2",
        salary: 20,
        equity: "0",
        company_handle: "c2"
      },
      {
        title: "jobTitle3",
        salary: 30,
        equity: "0",
        company_handle: "c3"
      }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(110); //NEED TO PREDICT WHICH ID TO SELECT BY
    expect(job).toEqual({
      title: "jobTitle1",
      salary: 10,
      equity: "0",
      company_handle: "c1"
    });
  });

//   test("not found if no such job", async function () {
//     try {
//       await Job.get(4);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 40,
    equity: "0.5"
  };

  test("works", async function () {
    let job = await Job.update(id, updateData); //NEED TO ADD CORRECT ID
    expect(job).toEqual({
      title: "jobTitle1",
      company_handle: "c1",
      ...updateData,
    });

    // const result = await db.query(
    //       `SELECT title, salary, equity, company_handle
    //        FROM jobs
    //        WHERE id = 11`);
    // expect(result.rows).toEqual([{
    //   title: "jobTitle1",
    //   salary: 40,
    //   equity: "0.5",
    //   company_handle: "c1"
    // }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: null,
      equity: null,
    };

    let job = await Job.update(id, updateDataSetNulls); //NEED TO ADD CORRECT ID
    expect(job).toEqual({
        title: "jobTitle1",
        company_handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title='jobTitle1'`);
    expect(result.rows).toEqual([{
      title: "jobTitle1",
      salary: null,
      equity: null,
      company_handle: "c1"
    }]);
  });

  test("not found if no such job id", async function () {
    try {
      await Job.update(4, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(11, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(id);
    const res = await db.query(
        `SELECT * FROM jobs WHERE id=id`); //NEED TO ADD CORRECT ID
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job title", async function () {
    try {
      await Job.remove('Does not exist');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});