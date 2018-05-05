const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const app = express();
const router = express.Router();
const errorMiddlewares = require('./middlewares/errors');

// Load DB (Connection)
const components = require('./components/db');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * if need to serve static files, make public folder on root folder and uncomment next line
 */
// app.use(express.static(path.join(__dirname, 'public')));

/**
 * Base URI of Router (http://locahost:port/api)
 */
app.use('/api', index(router));

/**
 * catch 404 and forward to error handler
 */
app.use(errorMiddlewares.notFoundError);

/**
 * Main error handler
 */
app.use(errorMiddlewares.mainErrorHandler);

module.exports = app;
