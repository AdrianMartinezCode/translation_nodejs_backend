const express = require('express');
const asyncHandler = require('express-async-handler');

const routes = ({ sentenceController }) => {
    const router = express.Router();

    router.post('/single', asyncHandler(sentenceController.create));
    router.put('/single/:id', asyncHandler(sentenceController.update));
    router.delete('/single/:id', asyncHandler(sentenceController.delete));
    router.get('/single/:id', asyncHandler(sentenceController.get));
    router.get('/list', asyncHandler(sentenceController.list));
    router.get('/translate/:id', asyncHandler(sentenceController.translate));

    return router;
};

module.exports = routes;