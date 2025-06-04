const loginRoutes = require("./loginRoutes");


module.exports = (app) => {

    app.use('/',loginRoutes)
}