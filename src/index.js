require('module-alias/register');

const path = require('path');


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const logger = require('@utils/logger');
const config = require('@config/config');
const {handleApiError, handleUnexpectedError} =
    require('@middleware/error.handler');


const db = require('@database/database')({config, logger});
const repository =
    require('@repository/sentence.repository')({db, config, logger});
const translator = require('@thirdparty/yandex.service')({config, logger});

const sentencesService =
    require('@services/sentences.service')({repository, translator, logger});
const sentenceController =
    require('@controllers/sentences.controller')({sentencesService, logger});
const sentenceRoutes =
    require('@routes/sentences.routes')({sentenceController});

const viewsController = require('@controllers/views.controller')({logger});
const viewsRoutes = require('@routes/views.routes')({viewsController});

app.use('/sentence', sentenceRoutes);
app.use('/views', viewsRoutes);

app.use(handleApiError({logger}));
app.use(handleUnexpectedError({logger}));

const port = config.appPort;

const createServer = () => {
  const server = app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });
  return server;
};

module.exports = {app, createServer};

if (process.env.NODE_ENV !== 'test') {
  createServer();
}
