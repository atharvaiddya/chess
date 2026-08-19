const board = document.getElementById("board");
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieces = [
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

board.addEventListener("click", (event) => {
    if (event.target.classList.contains("square")) {
        console.log(event.target.dataset.position)
    }
    else {
        console.log(event.target); //change to null or something later for comparison purposes
    }
    
});