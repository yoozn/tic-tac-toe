

const Player = (newName, newSymbol) => {
    let name = newName;
    let symbol = newSymbol;
    let wins2P = 0;
    let wins1PE = 0;
    let wins1PH = 0;

    const setSymbol = (newSymbol) => {
        symbol = newSymbol;
    }
    const getSymbol = () => symbol;

    const setName = (newName) => {
        name = newName;
    }
    const getName = () => name;

    const win = (mode) => {
        if (mode == "2P") wins2P++;
        else if (mode == "1PEasy") wins1PE++;
        else if (mode == "1PHard") wins1PH++;
    }
    const getWins = (mode) => {
        if (mode == "2P") return wins2P;
        if (mode == "1PEasy") return wins1PE;
        if (mode == "1PHard") return wins1PH;
    };

    return {setSymbol, getSymbol, setName, getName, win, getWins};
}

const Gameboard = (function() {
    let gameboard = [];
    const createBoard = () => {
        const mainContainer = document.querySelector(".main");
        const gameboardContainer = document.createElement("div");
        gameboardContainer.classList.add("gameboard-container");
        mainContainer.appendChild(gameboardContainer);
        
        const gameSquare = (x_coord, y_coord, sym="none") => {
            let x = x_coord;
            let y = y_coord;
            let symbol = "none";
            return {x, y, symbol};
        };

        for (let i=0; i < 3; i++) {
            for (let j =0; j<3; j++) {
                let square = gameSquare(j, i, "none");
                gameboard.push(square);
                const newSquare = document.createElement('div');
                newSquare.classList.add('square');
                newSquare.dataset.x= square.x;
                newSquare.dataset.y= square.y;
                gameboardContainer.appendChild(newSquare);

                newSquare.addEventListener('mouseover', () => {
                    if (square.symbol == "none" && (pageManager.getMode() == "2P" || pageManager.isPlayerTurn())) {
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
                    let won = false;
                    let tie = false;
                    if (square.symbol == "none" || square.symbol == "hover") {
                        if (pageManager.isPlayerTurn()) {
                            square.symbol = pageManager.user.getSymbol();
                        }
                        else {
                            if (pageManager.getMode() == "2P") {
                                square.symbol = pageManager.computer.getSymbol();
                            }
                        }
                        newSquare.querySelector(".hover").classList.remove("hover");
                        pageManager.piecePlaced();
                        if (pageManager.getPieceCount() > 4) {
                            if (pageManager.isPlayerTurn()) {
                                won = checkWin(square, "user");
                                if (!won) {
                                    tie = (pageManager.checkTie());
                                }
                        } else if (pageManager.getMode() == "2P") {
                            if (!checkWin(square, "computer")) 
                            {
                                pageManager.checkTie();
                            }
                        }
                        // console.log({"won" : won});
                    }
                    //if switch turn without checking if won, can screw up hover on computer mode
                    if (!won && !tie) {
                        pageManager.switchTurn();
                        // evaluatePosition();
                        //piece count gets set to 0 after a tie, so an array entry is added after the game is reset w.o. the middle conditional (6hrs to find...)
                        if ( pageManager.getPieceCount() > 0 && !pageManager.isPlayerTurn()) {
                            if (pageManager.getMode() == "1PEasy") {
                                const freeSpaces = gameboard.filter( sqr => {
                                    return sqr.symbol == "none";
                                });
                                const randomIndex = Math.floor(Math.random() * freeSpaces.length);
                                const randomSquare = freeSpaces[randomIndex];
                                const squareToPlaceIndex = gameboard.indexOf(randomSquare);
                                gameboard[squareToPlaceIndex].symbol = pageManager.computer.getSymbol();
                                const squareElement = gameboardContainer.childNodes[squareToPlaceIndex];
                                const symbol = document.createElement('img');
                                symbol.classList.add(`${pageManager.user.getSymbol() == "X" ? "o-img" : "x-img"}`);
                                // symbol.classList.add("hover");
                                symbol.src = `${pageManager.user.getSymbol() == "X" ? "images/o.png" : "images/x-png"}`;
                                squareElement.appendChild(symbol);
                                pageManager.piecePlaced();
                                if (pageManager.getPieceCount() > 4) {
                                    won = checkWin(gameboard[squareToPlaceIndex], "computer");
                                    tie = pageManager.checkTie();
                                }
                                if (!won && !tie) pageManager.switchTurn();
                            }
                            else if (pageManager.getMode() == "1PHard") {
                                const moves = evaluatePosition("O");
                                let move;
                                if (moves.primaryMoves.length > 0 ) {
                                    move = moves.primaryMoves[0];
                                } else if (moves.secondaryMoves.length > 0) {
                                    move = moves.secondaryMoves[0];
                                } else if (moves.tertiaryMoves.length > 0) {
                                    move = moves.tertiaryMoves[0];
                                } else if (moves.quaternaryMoves.length > 0) {
                                    let randomMove = Math.floor(moves.quaternaryMoves.length * Math.random());
                                    move = moves.quaternaryMoves[randomMove];
                                } else if (moves.quinaryMoves.length > 0) {
                                    let randomMove = Math.floor(moves.quinaryMoves.length * Math.random());
                                    move = moves.quinaryMoves[randomMove];
                                }

                                gameboard[move].symbol = pageManager.computer.getSymbol();
                                const squareElement = gameboardContainer.childNodes[move];
                                const symbol = document.createElement('img');
                                symbol.classList.add(`${pageManager.user.getSymbol() == "X" ? "o-img" : "x-img"}`);
                                symbol.src = `${pageManager.user.getSymbol() == "X" ? "images/o.png" : "images/x-png"}`;
                                squareElement.appendChild(symbol);
                                pageManager.piecePlaced();
                                if (pageManager.getPieceCount() > 4) {
                                    won = checkWin(gameboard[move], "computer");
                                    tie = pageManager.checkTie();
                                }
                                if (!won && !tie) pageManager.switchTurn();
                            }
                        }
                    };
                }
                });
            }
        }
    };


    const resetBoard = () => {
        gameboard = [];
        pageManager.resetPieceCount();
        pageManager.resetPlayerTurn();
        const main = document.querySelector(".main");
        main.removeChild(main.querySelector(".gameboard-container"));
        createBoard();
    }

    const evaluatePosition = (sym = "X", firstIteration = true) => {
        let sym2;
        let diagLRcount = 0;
        let diagRLcount = 0;
        let criticalRowSquare;
        let criticalColumnSquare;
        let criticalDiagLRSquare;
        let criticalDiagRLSquare;
        let primaryMoves = [];
        let secondaryMoves = [];
        let tertiaryMoves = [];
        let quaternaryMoves = [];
        let quinaryMoves = [];
        if (sym == "X" ? sym2 = "O" : sym2 = "X");
        for (let i = 0; i < 3; i++) {
            rowCount = 0;
            columnCount = 0;
            gameboard.forEach(sqr => {
                if(sqr.y == i) {
                    if (sqr.symbol == sym) rowCount++;
                    else if (sqr.symbol == sym2) rowCount--
                    else {
                        criticalRowSquare = (i * 3) + sqr.x;
                        if (!quaternaryMoves.includes(criticalRowSquare)) quinaryMoves.push(criticalRowSquare);
                    }
                }
                if (sqr.x == i) {
                    if (sqr.symbol == sym) columnCount++;
                    else if (sqr.symbol == sym2) columnCount--;
                    else {
                        criticalColumnSquare = (sqr.y * 3) + i;
                        if (!quinaryMoves.includes(criticalColumnSquare)) quinaryMoves.push(criticalColumnSquare);
                    }
                }
            })
            if (gameboard[i*4].symbol == sym) diagLRcount++;
            else if (gameboard[i*4].symbol == sym2) diagLRcount--;
            else {
                criticalDiagLRSquare = i*4;
                if (!quinaryMoves.includes(criticalDiagLRSquare)) quinaryMoves.push(criticalDiagLRSquare);
            }

            if (gameboard[2*(i+1)].symbol == sym) diagRLcount++;
            else if (gameboard[2*(i+1)].symbol == sym2) diagRLcount--;
            else {
                criticalDiagRLSquare = 2 * (i+1);
                if (!quinaryMoves.includes(criticalDiagRLSquare)) quinaryMoves.push(criticalDiagRLSquare);
            }

            if (rowCount == 2) {
                primaryMoves.push(criticalRowSquare);
            } 
            if (columnCount == 2) {
                primaryMoves.push(criticalColumnSquare);
            }

        }
        if (diagLRcount == 2) {
            primaryMoves.push(criticalDiagLRSquare);
        }
        if (diagRLcount == 2) {
            primaryMoves.push(criticalDiagRLSquare);
        }

        if (gameboard[4].symbol == "none") {
            tertiaryMoves.push(4);
        }

        if (gameboard[0].symbol == "none") quaternaryMoves.push(0);
        if (gameboard[2].symbol == "none") quaternaryMoves.push(2);
        if (gameboard[6].symbol == "none") quaternaryMoves.push(6);
        if (gameboard[8].symbol == "none") quaternaryMoves.push(8);

        if (firstIteration){
            secondaryMoves = evaluatePosition(sym = sym2, false).primaryMoves;
            console.log("primary moves", primaryMoves);
            console.log("secondary moves", secondaryMoves);
            console.log("tertiary moves", tertiaryMoves);
            console.log("quaternary moves", quaternaryMoves);
            console.log("quaternary moves", quinaryMoves);
        }
        return {primaryMoves, secondaryMoves, tertiaryMoves, quaternaryMoves, quinaryMoves};
    }

    const checkWin = (square, player) => {
        // console.log({"checkwinarea":gameboard});
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
                if (newSquare.symbol == "X" || newSquare.symbol == "O") {
                    if (newSquare.symbol == (player == "computer" ? pageManager.computer.getSymbol() : pageManager.user.getSymbol())) {
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
            pageManager.isPlayerTurn() ? pageManager.win(pageManager.user) : pageManager.win(pageManager.computer);
            return true;
        }
        return false;
    }
    return {gameboard, createBoard, resetBoard, evaluatePosition};
})();

const pageManager = (function() {
    const user = Player("User", "X");
    const computer = Player("Computer", "O");
    let playerTurn = true;
    let mode = "2P"
    let pieceCount = 0;
    let showingHeader = false;
    const initialize = () => {
        Gameboard.createBoard();

        const twoPlayerContainer = document.querySelector(".two-p-container")
        const twoPlayerText = document.querySelector(".two-p-text");
        const onePlayerContainer = document.querySelector(".one-p-text")
        const onePlayerEasy = document.querySelector(".easy-container");
        const onePlayerHard = document.querySelector(".hard-container");
        const continueButton = document.querySelector(".continue-button");
        const winText = document.querySelector(".header-text");
        const header = document.querySelector(".header");
        const sidebar = document.querySelector(".sidebar");

        twoPlayerContainer.addEventListener('click', () => {
            mode = "2P";
            // twoPlayerSelect.style.backgroundColor = "rgb(255, 178, 78)";
            // onePlayerContainer.style.backgroundColor = "rgb(255, 209, 111)";
            // onePlayerEasy.style.backgroundColor = "rgb(255, 209, 111)";
            // onePlayerHard.style.backgroundColor = "rgb(255, 209, 111)";
            twoPlayerContainer.classList.add("side-selected");
            twoPlayerText.classList.add("container-selected");
            onePlayerContainer.classList.remove("container-selected");
            onePlayerEasy.classList.remove("side-selected");
            onePlayerHard.classList.remove("side-selected");
            const currentMode = document.querySelector(".mode");
            currentMode.textContent = mode;
            Gameboard.resetBoard();
        });

        onePlayerEasy.addEventListener('click', () => {
            mode = "1PEasy";
            // twoPlayerSelect.style.backgroundColor = "rgb(255, 209, 111)";
            // onePlayerContainer.style.backgroundColor = "rgb(255, 178, 78)";
            // onePlayerEasy.style.backgroundColor = "rgb(255, 178, 78)";
            // onePlayerHard.style.backgroundColor = "rgb(255, 209, 111)";
            twoPlayerContainer.classList.remove("side-selected");
            twoPlayerText.classList.remove("container-selected");
            onePlayerContainer.classList.add("container-selected");
            onePlayerEasy.classList.add("side-selected");
            onePlayerHard.classList.remove("side-selected");
            const currentMode = document.querySelector(".mode");
            currentMode.textContent = mode;
            Gameboard.resetBoard();
        });

        onePlayerHard.addEventListener('click', () => {
            mode = "1PHard";
            // twoPlayerSelect.style.backgroundColor ="rgb(255, 209, 111)";
            // onePlayerContainer.style.backgroundColor = "rgb(255, 178, 78)";
            // onePlayerEasy.style.backgroundColor = "rgb(255, 209, 111)";
            // onePlayerHard.style.backgroundColor = "rgb(255, 178, 78)";
            twoPlayerContainer.classList.remove("side-selected");
            twoPlayerText.classList.remove("container-selected");
            onePlayerContainer.classList.add("container-selected");
            onePlayerEasy.classList.remove("side-selected");
            onePlayerHard.classList.add("side-selected");
            const currentMode = document.querySelector(".mode");
            currentMode.textContent = mode;
            Gameboard.resetBoard();
        });

        continueButton.addEventListener('click', () => {
            const header = document.querySelector(".header");
            const sidebar = document.querySelector(".sidebar")
            header.classList.remove("header-show");
            Gameboard.resetBoard();
            header.addEventListener("transitionend", () => {
                showingHeader = false;
                sidebar.classList.remove("sidebar-left");
            }, {once: true});
        })

        header.addEventListener('mouseover', () => {
            updateHeader();
            if (!showingHeader){
                winText.textContent = "";
                continueButton.style.visibility = "hidden";
                header.classList.add("header-hover")
                sidebar.classList.add("sidebar-left");
            }
        })

        header.addEventListener('mouseleave', () => {
            header.classList.remove("header-hover");
            header.addEventListener('transitionend', () => {
                sidebar.classList.remove("sidebar-left");
            }, {once: true})
        })
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

    const checkTie = () => {
        if (pieceCount == 9) {
            const winText = document.querySelector(".header-text");
            winText.textContent = "Tie.";
            showHeader();
            return true;
        }
    }

    const getPieceCount = () => pieceCount;

    const resetPieceCount = () => {
        pieceCount = 0;
    }

    const resetPlayerTurn = () => {
        playerTurn = true;
    }

    const win = (player) => {
        player.win(mode);
        const winText = document.querySelector(".header-text");
        winText.textContent = `${player.getName()} won!`;
        showHeader();
    }

    const updateHeader = () => {
        const leftScore = document.querySelector(".score-left");
        const leftName = document.querySelector(".player-1");
        const rightScore = document.querySelector(".score-right");
        const rightName = document.querySelector(".player-2");
        const currentMode = document.querySelector(".mode");

        leftName.textContent = user.getName();
        leftScore.textContent = user.getWins(mode);
        rightName.textContent = computer.getName();
        rightScore.textContent = computer.getWins(mode);
        currentMode.textContent = mode;
    }

    const showHeader = () => {
        updateHeader();
        showingHeader = true;
        const header = document.querySelector(".header");
        // const leftScore = document.querySelector(".score-left");
        // const leftName = document.querySelector(".player-1");
        // const rightScore = document.querySelector(".score-right");
        // const rightName = document.querySelector(".player-2");
        const continueButton = document.querySelector(".continue-button");
        // const currentMode = document.querySelector(".mode");
        const sidebar = document.querySelector(".sidebar");

        // leftName.textContent = user.getName();
        // leftScore.textContent = user.getWins(mode);
        // rightName.textContent = computer.getName();
        // rightScore.textContent = computer.getWins(mode);
        // currentMode.textContent = mode;
        sidebar.classList.add("sidebar-left");
        continueButton.style.visibility = "visible";
        header.classList.add("header-show");
    }

    return {user, computer, initialize, switchTurn, isPlayerTurn, switchMode, getMode, piecePlaced, getPieceCount, win, checkTie, resetPieceCount, resetPlayerTurn};
})();

pageManager.initialize();
