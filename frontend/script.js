const board = document.getElementById("board");
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
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

for (let i = 0; i < 64; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    // position
    const file = files[i % 8];
    const rank = 8 - Math.floor(i / 8);
    const position = file + rank;
    square.dataset.position = position;
    // piece
    const piece = pieces[Math.floor(i / 8)][i % 8];
    if (piece) {
        square.textContent =  piece;
        square.classList.add("piece");
    }
    // color
    if ((files.indexOf(file) + rank) % 2 == 1) {
        square.style.background = 'green';
    } else {
        square.style.background = 'greenyellow';
    }
    board.appendChild(square);
}


// whites turn first
let turn = "white";
let selected_square = null;
let last_move = null;
let promotion_square = null;
let promotion_color = null;
const white_pieces = ['♖','♘','♗','♕','♔','♙'];
const black_pieces = ['♜','♞','♝','♛','♚','♟'];

board.addEventListener("click", (event) => {
    if (!event.target.classList.contains("square")) return;
    
    const click = event.target.dataset.position;
    console.log(click);
    
    const file = click[0];
    const rank = Number(click[1]);
    
    const row = 8 - rank;
    const col = files.indexOf(file);

    const piece = pieces[row][col];

    //first click i.e. 'from' (second click will directly be assigned the 'to' part)
    if (selected_square === null) {

        if (turn === "white" && !white_pieces.includes(piece)) return;
        if (turn === "black" && !black_pieces.includes(piece)) return;

        selected_square = click;
        console.log("Selected:", selected_square);

        return;
    }

    const from_file = selected_square[0];
    const from_rank = Number(selected_square[1]);

    const from_row = 8 - from_rank;
    const from_col = files.indexOf(from_file);
    const moving_piece = pieces[from_row][from_col];

    if (self_cap(click)) {
        selected_square = null;
        return;
    }

    const move_function = identify(selected_square);

    if (!move_function(selected_square, click)) {
        selected_square = null;
        return;
    }

    pieces[row][col] = pieces[from_row][from_col];
    pieces[from_row][from_col] = "";

    const from_square = document.querySelector(`[data-position=${selected_square}]`);
    const to_square = document.querySelector(`[data-position=${click}]`);

    to_square.textContent = from_square.textContent;
    to_square.classList.add("piece");
    from_square.textContent = "";
    from_square.classList.remove("piece");
    
    if ((moving_piece === '♙' && click[1] === '8') || (moving_piece === '♟' && click[1] === '1')) {
        promotion_square = click;
        if (moving_piece === '♙') {
            promotion_color = "white";
        } 
        else {
            promotion_color = "black";
        }
        document.getElementById("promotion").style.display = "block";
        selected_square = null;
        return;
    }

    last_move = {
        from: selected_square,
        to: click,
        piece: moving_piece
    };

    if (turn === "white") {
        turn = "black";
    } else {
        turn = "white";
    }

    selected_square = null

});

document.getElementById("promotion").addEventListener("click", (event) => {
    if (!event.target.dataset.piece) return;
    const choice = event.target.dataset.piece;
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
    const row = 8 - Number(promotion_square[1]);
    const col = files.indexOf(promotion_square[0]);
    pieces[row][col] = promoted_piece;
    const square = document.querySelector(
        `[data-position=${promotion_square}]`
    );
    square.textContent = promoted_piece;
    document.getElementById("promotion").style.display = "none";

    promotion_square = null;
    promotion_color = null;

    if (turn === "white") {
        turn = "black";
    } else {
        turn = "white";
    }
});

//no self captures
function self_cap(click) {
    if (turn === "white" && white_pieces.includes(pieces[8 - click[1]][files.indexOf(click[0])])) {
        return true;
    }
    else if (turn === "black" && black_pieces.includes(pieces[8 - click[1]][files.indexOf(click[0])])) {
        return true;
    }

    return false;
}

// identifier
function identify(selected_square) {
    const piece = pieces[8 - selected_square[1]][files.indexOf(selected_square[0])]
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

// const move_function = identify(selected_square);
// move_function(selected_square, click)

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
    if (from[0] === to[0]) {
        const start = Math.min(from[1], to[1]);
        const end = Math.max(from[1], to[1]);
        for (let i = start + 1; i < end; i++) {
            if (pieces[8 - i][files.indexOf(from[0])]) {
                return false;
            };
        };
    }
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

    if (Math.abs(from_col - to_col) !== Math.abs(from_rank - to_rank)) {
        return false;
    }
    const start_col = Math.min(from_col, to_col);
    const end_col = Math.max(from_col, to_col);
    const start_rank = Math.min(from_rank, to_rank);
    const end_rank = Math.max(from_rank, to_rank);

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

function pawn(from,to) { 
    //one step forward
    if (from[0] === to[0] && !pieces[8 - to[1]][files.indexOf(to[0])] && Math.abs(from[1] - to[1]) === 1  && ((turn === "white" && to[1] > from[1]) || (turn === "black" && to[1] < from[1]))) {
        return true;
    }
    //diagonal
    if ((files.indexOf(from[0]) + 1 === files.indexOf(to[0]) || files.indexOf(from[0]) - 1 === files.indexOf(to[0])) && Math.abs(from[1] - to[1]) === 1 && ((turn === "white" && to[1] > from[1]) || (turn === "black" && to[1] < from[1])) && pieces[8 - to[1]][files.indexOf(to[0])]) {
        return true;
    }
    //first move two squares jump
    if (((turn === "white" && from[1] === 2 && to[1] === 4) || (turn === "black" && from[1] === 7 && to[1] === 5)) && from[0] === to[0] && !pieces[8 - to[1]][files.indexOf(to[0])]) {
        const middle_rank = (Number(from[1]) + Number(to[1])) / 2;
        if (!pieces[8 - middle_rank][files.indexOf(from[0])]) {
            return true;
        }
        return false;
    }
    return false;
}