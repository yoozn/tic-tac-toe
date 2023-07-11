const gameboardContainer = document.querySelector(".gameboard-container");


const Gameboard = (function() {
    let gameboard = [];
    const createBoard = () => {
        const gameSquare = (x_coord, y_coord) => {
            let x = x_coord;
            let y = y_coord;
            let symbol = "none";
            return {x, y, symbol};
        };

        for (let i=0; i < 3; i++) {
            for (let j =0; j<3; j++) {
                let square = gameSquare(j, i);
                gameboard.push(square);
            }
        }

    };

    const updateBoard = () => {
        for (square of gameboard) {
            newSquare = document.createElement('div');
            newSquare.classList.add('.square');
            newSquare.dataset.x= square.x;
            newSquare.dataset.y= square.y;
            gameboardContainer.appendChild(newSquare);
        }
    }
    return {gameboard, createBoard, updateBoard};
})();

Gameboard.createBoard();
Gameboard.updateBoard();
console.log(Gameboard.gameboard);