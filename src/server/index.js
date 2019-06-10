/* eslint-disable no-console */

import http from 'http';
import express from 'express';
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';

import webpack_config from '../../webpack.config';

import share from './share';

// set up the express server
const app = express();
app.use(express.static('static'));

// wire up webpack hot module replacement
const compiler = webpack(webpack_config);
app.use(
	WebpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath: webpack_config.output.publicPath,
	})
);
app.use(WebpackHotMiddleware(compiler));

// create the server
const server = http.createServer(app);

// set up the sharedb backend
share(server);

// listen to incoming requests
server.listen(8080, () => {
	console.log('listening on http://localhost:8080/');
});
