
module.exports.db = {
  server : process.env.server || "localhost",
  dbport: process.env.dbport || 3306,
  user :  process.env.dbuser || "developer",
  password :  process.env.dbpassword || "nH62C6z[8T92Jn3pW698W",
  database :  process.env.dbname || "development"
};
