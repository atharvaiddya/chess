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

    pieces[row][col] = pieces[from_row][from_col];
    pieces[from_row][from_col] = "";

    const from_square = document.querySelector(`[data-position=${selected_square}]`);
    const to_square = document.querySelector([`[data-position=${click}]`]);

    to_square.textContent = from_square.textContent;
    to_square.classList.add("piece");
    from_square.textContent = "";
    from_square.classList.remove("piece");
    
    if (turn === "white") {
        turn = "black";
    } else {
        turn = "white";
    }

    selected_square = null

});
