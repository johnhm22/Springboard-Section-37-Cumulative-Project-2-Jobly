"use strict";

const request = require("supertest");
const { sqlForPartialUpdate } = require("./sql");


    test("values and setCols returned", async function () {
      let dataToUpdate = {
        firstName: 'Boris',
        lastName: 'Biden'
    }
    let jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql)
     expect(values).toEqual(['Boris', 'Biden']);
     expect(setCols).toContain('"first_name"=$1, "last_name"=$2');
    });
