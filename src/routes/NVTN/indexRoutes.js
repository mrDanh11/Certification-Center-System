const viewsRoutes = require("./viewsRoutes");


module.exports = (app) => {

    app.use('/NVTN',viewsRoutes)
}