"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newTitle",
    salary: 10,
    equity: "0",
    company_handle: "newHandle"
  };

  test("ok for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      id: expect.any(Number),
      title: "newTitle",
      salary: 10,
      equity: "0",
      company_handle: "newHandle"
    });
  });

  test("Only isAdmin is authorized", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          salary: 50,
          equity: "0.1",
          company_handle: "newHandle",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          equity: 0,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});


// CONTINUE CODING FOR JOB TESTS FROM HERE
/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
      jobs:
          [
            {
            title: "J1",
            salary: 1,
            equity: "0.1",
            company_handle: "c1"
          },
          {
            title: "J2",
            salary: 2,
            equity: "0.2",
            company_handle: "c1"
          },
          {
            title: "J3",
            salary: 3,
            equity: null,
            company_handle: "c1"
          }
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await db.query(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      company: {
        title: "J1",
        salary: 1,
        equity: "0.1",
        company_handle: "c1"
      },
    });
  });

  // test("works for anon: company w/o jobs", async function () {
  //   const resp = await request(app).get(`/jobs/id`);
  //   expect(resp.body).toEqual({
  //     company: {
  //       handle: "c2",
  //       name: "C2",
  //       description: "Desc2",
  //       numEmployees: 2,
  //       logoUrl: "http://c2.img",
  //     },
  //   });
  // });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/1000000`);
    expect(resp.statusCode).toEqual(404);
  });
});


/************************************** FILTER /jobs/filter/ */
describe("GET /jobs/filter", function() {
  //filter route should successfully produce result based on query
    test("filter works", async function () {
      const query = {
        title: "J1",
        // minSalary: 1,
        // hasEquity: "1"
      }
      const resp = await request(app).get(`/jobs/filter/${query}`);
      expect(resp.body).toEqual({
        jobs: [{
          title: "J1",
          salary: 1,
          equity: "0.1",
          company_handle: "c1"
        }
      ]
      })
    })
  // string introduced instead of integer to test jsonschema which requires integer
    test("does not work schema not correct", async function () {
      const query = {
        name: "C1",
        minEmployees: 1,
        maxEmployees: 'string'
      }
      const resp = await request(app).get(`/jobs/filter/${query}`);
      expect(resp.statusCode).toEqual(400);
    })
  
  
  })






/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "newTitle",
          salary: 1,
          equity: "0.1",
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        title: "newTitle",
        salary: 1,
        equity: "0.1",
        company_handle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "newTitle"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("job not found", async function () {
    const resp = await request(app)
        .patch(`/jobs/1000`)
        .send({
          title: "newTitle",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);  //this should produce a 404 error code
  });

  test("bad request on title change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "newTitle"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[1]}`)
        .send({
          title: "J2",
          salary: 2,
          equity: 50,
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[2]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${testJobIds[2]}` });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/1000000`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
