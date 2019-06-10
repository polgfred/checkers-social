import Rules from '../core/rules';
import { newBoard, newBoardFromData } from '../core/utils';

export default {
	name: 'checkers/game',

	uri: 'http://sustainablecode.com/uri/types/checkers/game',

	create(initial) {
		if (initial) {
			const { board, side } = initial;
			return new Rules(newBoardFromData(board), side);
		} else {
			return new Rules(newBoard(), 1);
		}
	},

	deserialize(data) {
		const { board, side } = data;
		return new Rules(newBoardFromData(board), side);
	},

	serialize(snapshot) {
		const { board, side } = snapshot;
		const boardData = new Array(8);
		for (let y = 0; y < 8; ++y) {
			const by = board[y];
			const dy = (boardData[y] = new Array(8));
			for (let x = 0; x < 8; ++x) {
				dy[x] = by[x];
			}
		}
		return {
			board: boardData,
			side,
		};
	},

	apply(snapshot, op) {
		if (op.j) {
			snapshot.doJump(op.j);
			snapshot.side = -snapshot.side;
		} else if (op.m) {
			snapshot.doMove(op.m);
			snapshot.side = -snapshot.side;
		}
	},
};
