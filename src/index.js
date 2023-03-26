
const path = require('path');


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(express.static('public'));

const logger = require('./utils/logger');
const { handleApiError, handleUnexpectedError } = require('./middleware/error.handler');


const db = require("./database/database");
const translator = require('./thirdparty/yandex.service');

const sentencesService = require("./services/sentences.service")({ db, translator });
const sentenceController = require("./controllers/sentences.controller")({ sentencesService });
const sentenceRoutes = require("./routes/sentences.routes")({ sentenceController });

const viewsController = require("./controllers/views.controller")();
const viewsRoutes = require("./routes/views.routes")({ viewsController });

app.use('/sentence', sentenceRoutes);
app.use('/views', viewsRoutes);

app.use(handleApiError);
app.use(handleUnexpectedError({logger}));

const port = process.env.PORT || 3977;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})