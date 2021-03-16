const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/*
Used in models/users.js and models/companies.js in class methods that update database
The update routes define the specific data that can be updated

As arguments, it receives, firstly, req.body as dataToUpdate and, secondly, an object defining the data that will be updated; the keys represent a variable name and the values the column name in the db table

An array is then created of keys from the req.body object and assigns to a variable called keys
This array is then mapped to another array variable called cols
The mapping method uses the keys from the second argument and assigns each to a value of $ + (index+1)
The end result is a return value that can used in the update db.query in the route that assigns the columns to be updated to values of $1 etc.

*/


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //CHANGE key name to %name%
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


function sqlForFilter(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) throw new BadRequestError("No data");

const values = [];

let cols = [];

for(let data in dataToFilter){
  if(data === 'name'){
    values.push(`%${dataToFilter[data]}%`)
    cols.push(`name ILIKE $${values.length}`)
  }
 else if(data === 'minEmployees'){
    values.push(dataToFilter[data]);
    cols.push(`num_employees >= $${values.length}`)
  }
  else if (data === 'maxEmployees'){
    values.push(dataToFilter[data])
    cols.push(`num_employees <= $${values.length}`)
  }
}


  return {
    setCols: cols.join(" AND "),
    values};
}




module.exports = { sqlForPartialUpdate, sqlForFilter };
