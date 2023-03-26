
const express = require('express');

const routes = ({ viewsController }) => {
    const router = express.Router();
    router.get('/create', viewsController.create);
    router.get('/update', viewsController.update);
    router.get('/list', viewsController.list);
    router.get('/query', viewsController.query);
    router.get('/delete', viewsController.delete);
    router.get('/main', viewsController.main);
    return router;
}

module.exports = routes;