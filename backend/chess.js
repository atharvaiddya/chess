let pieces = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']
];

let turn = "white";

// castling implementation
// king and rook never moved
// squares in between are empty
// kings path is not under direct check
let white_king_moved = false;
let black_king_moved = false;

let white_rook_a_moved = false;
let white_rook_h_moved = false;

let black_rook_a_moved = false;
let black_rook_h_moved = false;

let promotion_square = null;
let promotion_color = null;

const files = ['a','b','c','d','e','f','g','h'];

function pawn(from,to, color = turn) { 
    let direction;
    if (color === "white") {
        direction = 1
    }
    else {
        direction = -1
    }
    //one step forward
    if (from[0] === to[0] && !pieces[8 - to[1]][files.indexOf(to[0])] && to[1] - from[1] === direction) {
        return true;
    }
    //diagonal
    if (Math.abs(files.indexOf(from[0]) - files.indexOf(to[0])) === 1 && to[1] - from[1] === direction && pieces[8 - to[1]][files.indexOf(to[0])]) {
        return true;
    }
    //first move two squares jump
    if (Number(from[1]) === (color === "white" ? 2 : 7) && to[1] - from[1] === direction * 2 && from[0] === to[0]) {
        const middle_rank = Number(from[1]) + direction;
        if (!pieces[8 - middle_rank][files.indexOf(from[0])] &&  !pieces[8 - to[1]][files.indexOf(to[0])]) {
            return true;
        }
    }
    return false;
}

function make_move(from, to) {
    const from_row = 8 - from[1];
    const from_col = files.indexOf(from[0])
    const moving_piece = pieces[from_row][from_col];

    if (!moving_piece) {
        return {
            success: false,
            message: "No piece on starting square"
        };
    }

    const own_piece = turn === "white" ? white_pieces : black_pieces;

    if (!own_piece.includes(moving_piece)) {
        return {
            success: false,
            message: "It is not this piece's turn"
        };
    }

    const move_function = identify(moving_piece);
    const castling = can_castle(from, to);

    if (!move_function) {
        return {
            success: false,
            message: "No piece found"
        };
    }

    let valid_move;

    if (moving_piece === '♙' || moving_piece === '♟') {
        const color = moving_piece === '♙' ? "white" : "black";
        valid_move = move_function(from, to, color);
    } 
    else {
        valid_move = move_function(from, to);
    }

    if (!castling && !valid_move) {
        return {
            success: false,
            message: "Illegal move"
        };
    }

    if (!is_legal(from, to)) {
        return {
            success: false,
            message: "Move would leave king in check"
        }
    }

    const to_row = 8 - to[1];
    const to_col = files.indexOf(to[0]);

    const target_piece = pieces[to_row][to_col];

    if (own_piece.includes(target_piece)) {
        return {
            success: false,
            message: "Cannot capture your own piece"
        };
    }

    pieces[to_row][to_col] = pieces[from_row][from_col];
    pieces[from_row][from_col] = "";

    if (castling) {
        castle_rook(from, to);
    }
    update_castling_rights(from,to, moving_piece, target_piece);

    if (moving_piece === "♙" && to[1] === "8") {
        promotion_square = to;
        promotion_color = "white";
    }

    if (moving_piece === "♟" && to[1] === "1") {
        promotion_square = to;
        promotion_color = "black";
    }

    turn = turn === "white" ? "black" : "white";
    const in_check = attackers(turn).length > 0;
    const is_checkmate = checkmate(turn);
    const is_stalemate = stalemate(turn);

    return {
        success: true,
        message: "Move is legal",
        pieces: pieces,
        turn: turn,
        check: in_check,
        checkmate: is_checkmate,
        stalemate: is_stalemate,
        promotion: promotion_square !== null
    };
    
}

function get_game() {
    return {
        pieces: pieces,
        turn: turn
    }
}


function knight(from, to) {
    const col_diff = Math.abs(files.indexOf(from[0]) - files.indexOf(to[0]));
    const row_diff = Math.abs(from[1] - to[1]);

    return (
        (col_diff === 1 && row_diff === 2) || (col_diff === 2 && row_diff === 1)
    );
}

function rook(from, to) {
    if (from === to) {
        return false;
    }
    //files are same rank will vary
    if (from[0] === to[0]) {
        const start = Math.min(from[1], to[1]);
        const end = Math.max(from[1], to[1]);
        for (let i = start + 1; i < end; i++) {
            if (pieces[8 - i][files.indexOf(from[0])]) {
                return false;
            };
        };
    }
    //rank is same files will vary
    else if (from[1] === to[1]) {
        const start = Math.min(files.indexOf(from[0]),files.indexOf(to[0]));
        const end = Math.max(files.indexOf(from[0]),files.indexOf(to[0]));
        for (let i = start + 1; i < end; i++) {
            if (pieces[8 - from[1]][i]) {
                return false;
            };
        };
    }
    else {
        return false;
    }
    return true;
}

function bishop(from, to) {
    if (from === to) {
        return false;
    }
    const from_col = files.indexOf(from[0]);
    const to_col = files.indexOf(to[0]);
    const from_rank = Number(from[1]);
    const to_rank = Number(to[1]);
    //bishop moves symmetrically always i.e. if it goes 3 to the riht it will go 3 upwards or downwards.
    if (Math.abs(from_col - to_col) !== Math.abs(from_rank - to_rank)) {
        return false;
    }
    const start_col = Math.min(from_col, to_col);
    const end_col = Math.max(from_col, to_col);
    const start_rank = Math.min(from_rank, to_rank);
    const end_rank = Math.max(from_rank, to_rank);
    //done for the cases (rank increases file decreases) or rank decreases file increases) 
    for (let i = 1; i < end_col - start_col; i++) {
        let col;
        let rank;

        if (from_col < to_col) {
            col = start_col + i;
        }
        else {
            col = end_col - i;
        }
        if (from_rank < to_rank) {
            rank = start_rank + i;
        }
        else {
            rank = end_rank - i;
        }
        if (pieces[8 - rank][col]) {
            return false;
        }
    }
    return true;
}

function queen(from,to) {
    return (bishop(from,to) || rook(from,to));
}

function king(from, to) {
    const col = Math.abs(files.indexOf(from[0]) - files.indexOf(to[0]));
    const row = Math.abs(from[1] - to[1]);
    return col <= 1 && row <= 1 && (col !== 0 || row !== 0);
}

function identify(piece) {
    if (piece === '♜' || piece === '♖') {
        return rook;
    }

    if (piece === '♞' || piece === '♘') {
        return knight;
    }

    if (piece === '♝' || piece === '♗') {
        return bishop;
    }

    if (piece === '♛' || piece === '♕') {
        return queen;
    }

    if (piece === '♚' || piece === '♔') {
        return king;
    }

    if (piece === '♟' || piece === '♙') {
        return pawn;
    }
}

const white_pieces = ['♖','♘','♗','♕','♔','♙'];
const black_pieces = ['♜','♞','♝','♛','♚','♟'];

const attackers = function check(turn) {

    let kingpiece;
    let enemypiece;
    let enemycolor;
    if (turn === "white"){
        kingpiece = '♔';
        enemypiece = black_pieces;
        enemycolor = "black"
    }
    else {
    kingpiece = '♚';
        enemypiece = white_pieces;
        enemycolor = "white"

    }
    //king position
    let king_row = -1
    let king_col = -1
    for (let row = 0; row < 8; row ++) {
        for (let col = 0; col < 8; col++) {
            if (pieces[row][col] === kingpiece) {
                king_row = row
                king_col = col
                break;
            }
        }
        if (king_row !== -1) {
            break;
        } 
    }
    const king_square = files[king_col] + (8 - king_row);
    const attackers = [];
    //enemy position
    for (let row = 0; row < 8; row ++) {
        for (let col = 0; col < 8; col++) {
            const piece = pieces[row][col]
            const from = files[col] + (8 - row);
            if (!enemypiece.includes(piece)) continue;

            let move_function;
            if (piece === '♜' || piece === '♖') {
                move_function = rook;
            }
            if (piece === '♞' || piece === '♘') {
                move_function = knight;
            }

            if (piece === '♝' || piece === '♗') {
                move_function = bishop;
            }

            if (piece === '♛' || piece === '♕') {
                move_function = queen;
            }

            if (piece === '♚' || piece === '♔') {
                move_function = king;
            }

            if (piece === '♟' || piece === '♙') {
                if (pawn(from, king_square, enemycolor)) {
                    attackers.push({
                        square: from,
                        piece: piece,
                        move_function: pawn
                    });
                }
                continue;
            }

            if (move_function(from, king_square)) {
                attackers.push({
                    square: from,
                    piece: piece,
                    move_function: move_function
                });
            }

        }
    }
    return attackers;

}

function is_legal(from, to) {
    const from_row = 8 - Number(from[1]);
    const from_col = files.indexOf(from[0]);
    const to_row = 8 - Number(to[1]);
    const to_col = files.indexOf(to[0]);

    const moving_piece = pieces[from_row][from_col];
    const captured_piece = pieces[to_row][to_col];
    // temporarily make the move
    pieces[to_row][to_col] = moving_piece;
    pieces[from_row][from_col] = "";

    // check whether the movers own king is attacked
    const illegal = attackers(turn).length > 0;

    // undo the move
    pieces[from_row][from_col] = moving_piece;
    pieces[to_row][to_col] = captured_piece;

    return !illegal;
}

function has_legal_moves(turn) {
    let own_pieces;
    if (turn === "white") {
        own_pieces = white_pieces;
    }
    else {
        own_pieces = black_pieces
    }
    for (let from_row = 0; from_row < 8; from_row++) {
        for (let from_col = 0; from_col < 8; from_col++) {
            const piece = pieces[from_row][from_col]
            if (!own_pieces.includes(piece)) continue;
            const from = files[from_col] + (8 - from_row);
            const move_function = identify(piece);

            for (let to_row = 0; to_row < 8; to_row++) {
                for (let to_col = 0; to_col < 8; to_col++){
                    const to = files[to_col] + (8 - to_row)
                    const target = pieces[to_row][to_col]
                    if (own_pieces.includes(target)) continue;
                    if (!move_function(from, to)) continue;
                    if (is_legal(from, to)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function checkmate(turn) {
    return attackers(turn).length > 0 && !has_legal_moves(turn);
}

function stalemate(turn) {
    return attackers(turn).length === 0 && !has_legal_moves(turn);
}

function can_castle(from,to) {
    if (turn === "white" && from === "e1") {
        if (to === "g1") {
            if (white_king_moved || white_rook_h_moved) {
                return false;
            }
            if (pieces[7][7] !== "♖") {
                return false;
            }
            if (pieces[7][5] || pieces[7][6]) {
                return false;
            }
            if (attackers("white").length > 0) {
                return false;
            }
            if (!is_legal("e1","f1")) {
                return false;
            }

            pieces[7][4] = "";
            pieces[7][5] = "♔";
            const safe = is_legal("f1", "g1");
            pieces[7][5] = "";
            pieces[7][4] = "♔";

            if (!safe) return false;

            return true;
        }
        if (to === "c1") {
            if (white_king_moved || white_rook_a_moved) {
                return false;
            }
            if (pieces[7][0] !== "♖") {
                return false;
            }
            if (pieces[7][1] || pieces[7][2] || pieces[7][3]) {
                return false;
            }
            if (attackers("white").length > 0) {
                return false;
            }
            if (!is_legal("e1","d1")) {
                return false;
            }

            pieces[7][4] = "";
            pieces[7][3] = "♔";
            const safe = is_legal("d1", "c1");
            pieces[7][3] = "";
            pieces[7][4] = "♔";

            if (!safe) return false;

            return true;
        }
    }
    if (turn === "black" && from === "e8") {
        if (to === "g8") {
            if (black_king_moved || black_rook_h_moved) {
                return false;
            }
            if (pieces[0][7] !== "♜") {
                return false;
            }
            if (pieces[0][5] || pieces[0][6]) {
                return false;
            }
            if (attackers("black").length > 0) {
                return false;
            }
            if (!is_legal("e8","f8")) {
                return false;
            }

            pieces[0][4] = "";
            pieces[0][5] = "♚";
            const safe = is_legal("f8", "g8");
            pieces[0][5] = "";
            pieces[0][4] = "♚";

            if (!safe) return false;

            return true;
        }
        if (to === "c8") {
            if (black_king_moved || black_rook_a_moved) {
                return false;
            }
            if (pieces[0][0] !== "♜") {
                return false;
            }
            if (pieces[0][1] || pieces[0][2] || pieces[0][3]) {
                return false;
            }
            if (attackers("black").length > 0) {
                return false;
            }
            if (!is_legal("e8","d8")) {
                return false;
            }
            pieces[0][4] = "";
            pieces[0][3] = "♚";
            const safe = is_legal("d8", "c8");
            pieces[0][3] = "";
            pieces[0][4] = "♚";

            if (!safe) return false;

            return true;
        }
    }
    return false;
}


function castle_rook(from, to) {
    if (from === "e1" && to === "g1") {
        pieces[7][7] = "";
        pieces[7][5] = "♖";
    }

    else if (from === "e1" && to === "c1") {
        pieces[7][0] = "";
        pieces[7][3] = "♖";
    }

    else if (from === "e8" && to === "g8") {
        pieces[0][7] = "";
        pieces[0][5] = "♜";
    }

    else if (from === "e8" && to === "c8") {
        pieces[0][0] = "";
        pieces[0][3] = "♜";
    }
}



function update_castling_rights(from, to, moving_piece, captured_piece) {

    // king moved
    if (moving_piece === "♔") {
        white_king_moved = true;
    }

    if (moving_piece === "♚") {
        black_king_moved = true;
    }

    // rook moved from its original square
    if (moving_piece === "♖") {
        if (from === "a1") {
            white_rook_a_moved = true;
        }

        if (from === "h1") {
            white_rook_h_moved = true;
        }
    }

    if (moving_piece === "♜") {
        if (from === "a8") {
            black_rook_a_moved = true;
        }

        if (from === "h8") {
            black_rook_h_moved = true;
        }
    }

    // rook captured on its original square
    if (captured_piece === "♖") {
        if (to === "a1") {
            white_rook_a_moved = true;
        }

        if (to === "h1") {
            white_rook_h_moved = true;
        }
    }

    if (captured_piece === "♜") {
        if (to === "a8") {
            black_rook_a_moved = true;
        }

        if (to === "h8") {
            black_rook_h_moved = true;
        }
    }
}

function promote(choice) {
    if (promotion_square === null) {
        return {
            success: false,
            message: "No promotion is pending"
        };
    }
    const white = {
        queen: '♕', rook: '♖', bishop: '♗', knight: '♘'
    };
    const black = {
        queen: '♛', rook: '♜', bishop: '♝', knight: '♞'
    };
    let promoted_piece;
    if (promotion_color === "white") {
        promoted_piece = white[choice]
    }
    else {
        promoted_piece = black[choice]
    }

    if(!promoted_piece) {
        return {
            success:false,
            message: "Invalid promotion piece"
        };
    }
    const row = 8 - Number(promotion_square[1]);
    const col = files.indexOf(promotion_square[0]);
    pieces[row][col] = promoted_piece;
    promotion_square = null;
    promotion_color = null;
    const in_check = attackers(turn).length > 0;
    const is_checkmate = checkmate(turn);
    const is_stalemate = stalemate(turn);
    return {
        success: true,
        message: "Promotion successful",
        pieces:pieces,
        turn:turn,
        check: in_check,
        checkmate: is_checkmate,
        stalemate: is_stalemate
    }
}

export {make_move, get_game, promote};