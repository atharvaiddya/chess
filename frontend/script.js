//board creation
const board = document.getElementById("board");
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
let pieces = [];

function render_block(){
    board.innerHTML = "";
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
}

// whites turn first
let turn = "white";
let selected_square = null;
let promotion_pending = false;
const white_pieces = ['♖','♘','♗','♕','♔','♙'];
const black_pieces = ['♜','♞','♝','♛','♚','♟'];

board.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("square")) return;
    if (promotion_pending) return;
    
    const click = event.target.dataset.position;
    
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

    const from = selected_square;
    const to = click;

    selected_square = null;

    const result = await send_move(from, to);

    if(!result.success) {
        console.log("Backend rejected move.", result.message);
        return;
    }

    pieces = result.pieces;
    turn = result.turn;

    render_block();

    if (result.promotion) {
        promotion_pending = true;
        document.getElementById("promotion").style.display = "block";
        return;
    }

    if (result.checkmate) {
        console.log(`Checkmate! ${turn === "white" ? "black" : "white"} wins.`);
    }
    else if (result.stalemate) {
        console.log("Stalemate.");
    }
    else if (result.check) {
        console.log(`${turn} is in check.`);
    }

});

document.getElementById("promotion").addEventListener("click", async (event) => {
    if (!event.target.dataset.piece) return;
    const choice = event.target.dataset.piece;
    const response = await fetch("/api/promote", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            piece: choice
        })
    });

    const result = await response.json();

    console.log("Promotion response:", result);

    if (!result.success) {
        console.log(result.message);
        return;
    }

    pieces = result.pieces;
    turn = result.turn;

    promotion_pending = false;

    document.getElementById("promotion").style.display = "none";

    render_block();

    if (result.checkmate) {
        console.log(`Checkmate! ${turn === "white" ? "black" : "white"} wins.`);
    }
    else if (result.stalemate) {
        console.log("Stalemate.");
    }
    else if (result.check) {
        console.log(`${turn} is in check.`);
    }

});



async function game() {
    const response = await fetch("/api/game");
    const game = await response.json();
    pieces = game.pieces;
    turn = game.turn;

    console.log("Game received from backend.", game);
    console.log("Pieces received from backend.", pieces);

    render_block();
}

game();

async function send_move(from, to) {
    const response = await fetch("/api/move", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: from,
            to: to
        })
    });

    const result = await response.json();
    console.log("Backend response: ", result);
    return result;
}