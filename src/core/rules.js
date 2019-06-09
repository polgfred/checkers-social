export default class Rules {
	constructor(board, side) {
		this.board = board;
		this.side = side;
	}

	findJumps() {
		const { board, side } = this;
		const top = side == 1 ? 7 : 0;
		const out = top + side;
		const bottom = top ^ 7;
		const jumps = [];

		// loop through playable squares
		for (let y = bottom; y != out; y += side) {
			for (let x = bottom; x != out; x += side) {
				// see if it's our piece
				let p = board[y][x];

				if (side * p > 0) {
					// checking for jumps is inherently recursive - as long as you find them,
					// you have to keep looking, and only termimal positions are valid
					this.nextJump([[x, y]], jumps);
				}
			}
		}

		return jumps;
	}

	nextJump(cur, jumps) {
		const { board, side } = this;
		const [x, y] = cur[cur.length - 1];
		const p = board[y][x];
		const top = side == 1 ? 7 : 0;
		const king = p == side * 2;
		let found = false;

		// loop over directions (dx, dy) from the current square
		for (let dy = king ? -1 : 1; dy != 3; dy += 2) {
			for (let dx = -1; dx != 3; dx += 2) {
				// calculate middle and landing coordinates
				const mx = x + (side == 1 ? dx : -dx);
				const my = y + (side == 1 ? dy : -dy);
				const nx = mx + (side == 1 ? dx : -dx);
				const ny = my + (side == 1 ? dy : -dy);

				// see if jump is on the board
				if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
					const m = board[my][mx];
					const n = board[ny][nx];

					// see if the middle piece is an opponent and the landing is open
					if (n == 0 && side * m < 0) {
						const crowned = !king && ny == top;
						found = true;

						// keep track of the coordinates, and move the piece
						board[y][x] = 0;
						board[my][mx] = 0;
						board[ny][nx] = crowned ? p * 2 : p;

						// if we're crowned, or there are no further jumps from here,
						// we've reached a terminal position
						cur.push([nx, ny, mx, my]);
						if (crowned || !this.nextJump(cur, jumps)) {
							jumps.push(cur.slice());
						}

						// put things back where we found them
						cur.pop();
						board[y][x] = p;
						board[my][mx] = m;
						board[ny][nx] = 0;
					}
				}
			}
		}

		// return whether more jumps were found from this position
		return found;
	}

	doJump(jump) {
		const { board, side } = this;
		const len = jump.length;
		const [x, y] = jump[0];
		const [fx, fy] = jump[len - 1];
		const p = board[y][x];
		const top = side == 1 ? 7 : 0;
		const crowned = p == side && fy == top;

		// remove the initial piece
		board[y][x] = 0;

		// loop over the passed in coords
		for (let i = 1; i < len; ++i) {
			const [, , mx, my] = jump[i];

			// perform the jump
			board[my][mx] = 0;
		}

		// final piece
		board[fy][fx] = crowned ? p * 2 : p;
	}

	withJump(jump, action) {
		const { board, side } = this;
		const len = jump.length;
		const [x, y] = jump[0];
		const [fx, fy] = jump[len - 1];
		const p = board[y][x];
		const top = side == 1 ? 7 : 0;
		const crowned = p == side && fy == top;
		const cap = new Array(len);

		// remove the initial piece
		cap[0] = p;
		board[y][x] = 0;

		// loop over the passed in coords
		for (let i = 1; i < len; ++i) {
			const [, , mx, my] = jump[i];

			// perform the jump
			cap[i] = board[my][mx];
			board[my][mx] = 0;
		}

		// final piece
		board[fy][fx] = crowned ? p * 2 : p;

		// do the action
		action();

		// remove the final piece
		board[fy][fx] = 0;

		// loop over the passed in coords in reverse
		for (let i = len - 1; i > 0; --i) {
			const [, , mx, my] = jump[i];

			// put back the captured piece
			board[my][mx] = cap[i];
		}

		// put back initial piece
		board[y][x] = p;
	}

	findMoves() {
		const { board, side } = this;
		const top = side == 1 ? 7 : 0;
		const out = top + side;
		const bottom = top ^ 7;
		const moves = [];

		// loop through playable squares
		for (let y = bottom; y != out; y += side) {
			for (let x = bottom; x != out; x += side) {
				const p = board[y][x];
				const king = p == side * 2;

				// see if it's our piece
				if (side * p > 0) {
					// loop over directions (dx, dy) from the current square
					for (let dy = king ? -1 : 1; dy != 3; dy += 2) {
						for (let dx = -1; dx != 3; dx += 2) {
							// calculate landing coordinates
							const nx = x + (side == 1 ? dx : -dx);
							const ny = y + (side == 1 ? dy : -dy);

							// see if move is on the board
							if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
								const crowned = !king && ny == top;

								// see if the landing is open
								if (board[ny][nx] == 0) {
									// keep track of the coordinates, and move the piece
									board[y][x] = 0;
									board[ny][nx] = crowned ? p * 2 : p;

									moves.push([[x, y], [nx, ny]]);

									// put things back where we found them
									board[y][x] = p;
									board[ny][nx] = 0;
								}
							}
						}
					}
				}
			}
		}

		return moves;
	}

	doMove(move) {
		const { board, side } = this;
		const [[x, y], [nx, ny]] = move;
		const p = board[y][x];
		const top = side == 1 ? 7 : 0;
		const crowned = p == side && ny == top;

		// perform the move
		board[y][x] = 0;
		board[ny][nx] = crowned ? p * 2 : p;
	}

	withMove(move, action) {
		const { board, side } = this;
		const [[x, y], [nx, ny]] = move;
		const p = board[y][x];
		const top = side == 1 ? 7 : 0;
		const crowned = p == side && ny == top;

		// perform the move
		board[y][x] = 0;
		board[ny][nx] = crowned ? p * 2 : p;

		// do the action
		action();

		// put things back where we found them
		board[ny][nx] = 0;
		board[y][x] = p;
	}

	findPlays() {
		const jumps = this.findJumps();

		// you have to jump if you can
		if (jumps.length) {
			return jumps;
		} else {
			return this.findMoves();
		}
	}

	buildTree() {
		const plays = this.findPlays();
		const tree = {};

		for (let i = 0; i < plays.length; ++i) {
			const play = plays[i];
			let root = tree;

			for (let j = 0; j < play.length; ++j) {
				let [x, y] = play[j],
					k = `${x},${y}`;

				root[k] = root[k] || {};
				root = root[k];
			}
		}

		return tree;
	}
}
