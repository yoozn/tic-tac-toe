

const Player = (newName, newSymbol) => {
    let name = newName;
    let symbol = newSymbol;
    let wins = 0;

    const setSymbol = (newSymbol) => {
        symbol = newSymbol;
    }
    const getSymbol = () => symbol;

    const setName = (newName) => {
        name = newName;
    }
    const getName = () => name;

    const win = () => {
        wins++;
    }
    const getWins = () => wins;

    return {setSymbol, getSymbol, setName, getName, win, getWins};
}

const Gameboard = (function() {
    let gameboard = [];
    const createBoard = () => {
        const mainContainer = document.querySelector(".main");
        const gameboardContainer = document.createElement("div");
        gameboardContainer.classList.add("gameboard-container");
        mainContainer.appendChild(gameboardContainer);
        
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
                const newSquare = document.createElement('div');
                newSquare.classList.add('square');
                newSquare.dataset.x= square.x;
                newSquare.dataset.y= square.y;
                gameboardContainer.appendChild(newSquare);

                newSquare.addEventListener('mouseover', () => {
                    if (square.symbol == "none") {
                        square.symbol = "hover";
                        const symbol = document.createElement('img');
                        if (pageManager.isPlayerTurn()) {
                            symbol.classList.add(`${pageManager.user.getSymbol() == "X" ? "x-img" : "o-img"}`);
                            symbol.src = `${pageManager.user.getSymbol() == "X" ? "images/x.png" : "images/o-png"}`;
                        } else {
                            symbol.classList.add(`${pageManager.user.getSymbol() == "X" ? "o-img" : "x-img"}`);
                            symbol.src = `${pageManager.user.getSymbol() == "X" ? "images/o.png" : "images/x-png"}`;
                        }
                        symbol.classList.add("hover");
                        symbol.setAttribute("draggable", false);
                        newSquare.appendChild(symbol);
                    }
                });
                newSquare.addEventListener('mouseleave', () => {
                    if (square.symbol == "hover") {
                        square.symbol = "none";
                        const childImg = newSquare.querySelector(".hover");
                        newSquare.removeChild(childImg);
                    }
                });
                newSquare.addEventListener('click', () => {
                    if (square.symbol == "none" || square.symbol == "hover") {
                        if (pageManager.isPlayerTurn()) {
                            pageManager.piecePlaced();
                            pageManager.switchTurn();
                            square.symbol = pageManager.user.getSymbol();
                            // console.log(gameboard);
                        }
                        else {
                            if (pageManager.getMode() == "2P") {
                                pageManager.piecePlaced();
                                pageManager.switchTurn();
                                square.symbol = pageManager.computer.getSymbol();
                                // console.log(gameboard);
                            }
                        }
                    }
                    if (pageManager.getPieceCount() > 4) {
                        console.log("checking");
                        checkWin(square);
                    }
                });
            }
        }

    };

    const updateBoard = () => {
        for (square of gameboard) {

        }
    }

    const resetBoard = () => {
        gameboard = [];
        const main = document.querySelector(".main");
        console.log(main);
        main.removeChild(main.querySelector(".gameboard-container"));
        createBoard();
    }

    const checkWin = (square) => {
        let x = square.x;
        let y = square.y;
        let vertCount = 1;
        let horzCount = 1;
        let diagLRCount = 1;
        let diagRLCount = 1;
    
        const checkSquares = (x_coord,y_coord, direction, firstIteration = true) => {
            if ((x_coord < 3 && x_coord >= 0) && (y_coord < 3 && y_coord >= 0)) {
                let newX = x_coord;
                let newY = y_coord;
                if (direction == "right") newX++;
                if (direction == "left") newX--;
                if (direction == "up") newY--;
                if (direction == "down") newY++;
                if (direction == "diagLRdown") {newX++; newY++;};
                if (direction == "diagLRup") {newX--; newY--;};
                if (direction == "diagRLup") {newX++;newY--;};
                if (direction == "diagRLdown") {newX--;newY++;};
                //switch turn method is called before this function, so the symbols are opposite of intuition
                const newSquare = gameboard.filter(sqr => {
                    return (sqr.x == x_coord && sqr.y == y_coord);
                })[0];
                if (newSquare.symbol == (pageManager.isPlayerTurn() ? pageManager.computer.getSymbol() : pageManager.user.getSymbol())) {
                    if (firstIteration == false) {
                        if (direction == "right" || direction == "left") horzCount++;
                        if (direction == "up" || direction == "down") vertCount++;
                        if (direction == "diagLRdown" || direction == "diagLRup") diagLRCount++;
                        if (direction == "diagRLdown" || direction == "diagRLup") diagRLCount++;
                    }
                    checkSquares(newX, newY, direction, false);
                }
        }
    }

        checkSquares(x, y, "right");
        checkSquares(x, y, "left");
        checkSquares(x, y, "up");
        checkSquares(x, y, "down");
        checkSquares(x, y, "diagLRdown");
        checkSquares(x, y, "diagLRup");
        checkSquares(x, y, "diagRLdown");
        checkSquares(x, y, "diagRLup");

        console.log({horzCount, vertCount, diagLRCount, diagRLCount});
        if (vertCount >= 3 || horzCount >= 3 || diagLRCount >= 3 || diagRLCount >= 3) {
            pageManager.isPlayerTurn() ? pageManager.win(pageManager.computer) : pageManager.win(pageManager.user);
        }
    }
    return {gameboard, createBoard, updateBoard, resetBoard};
})();

const pageManager = (function() {
    const user = Player("User", "X");
    const computer = Player("Computer", "O");
    let playerTurn = true;
    let mode = "2P"
    let pieceCount = 0;

    const initialize = () => {
        Gameboard.createBoard();
        Gameboard.updateBoard();
    }

    const switchTurn = () => {
        playerTurn = !playerTurn;
    }

    const isPlayerTurn = () => {
        return playerTurn;
    }

    const switchMode = (newMode) => {
        mode = newMode;
    }

    const getMode = () => mode;

    const piecePlaced = () => {
        pieceCount++;
    }

    const getPieceCount = () => pieceCount;

    const win = (player) => {
        player.win();
        alert(`${player.getName()} wins! Score: ${player.getWins()}`);
        Gameboard.resetBoard();
    }

    return {user, computer, initialize, switchTurn, isPlayerTurn, switchMode, getMode, piecePlaced, getPieceCount, win};
})();

pageManager.initialize();
console.log(pageManager.user);
console.log(pageManager.user.getSymbol());