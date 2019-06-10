/* eslint-disable no-console */

import ShareDb from 'sharedb';
import WebSocket from 'ws';
import WebSocketJSONStream from '@teamwork/websocket-json-stream';

import { game } from '../ot';

ShareDb.types.register(game);

export default function share(server) {
	const backend = new ShareDb();

	// listen for incoming websocket connections
	const wss = new WebSocket.Server({ server });
	wss.on('connection', ws => {
		backend.listen(new WebSocketJSONStream(ws));
	});
}
