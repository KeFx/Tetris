'use strict';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("Gameboard");
const ctx = canvas.getContext("2d");

class Gameboard {
    constructor(origin, context, bgColor, rows, cols, baseUnitSideLength) {
        this.o = origin;
        this.c = context;
        this.bgColor = bgColor;
        this.rows = rows;
        this.cols = cols;
        this.baseUnitSideLength = baseUnitSideLength;
        this.grid = this.newEmptyGrid();
    }

    newEmptyGrid() {
        const g = new Array(this.rows);
        for (let i = 0; i < g.length; i++) {
            g[i] = new Array(this.cols)
            for (let j = 0; j < g[i].length; j++) {
                g[i][j] = false;
            }
        }
        return g;
    }

    drawGameboard() {
        this.c.save();
        this.c.beginPath();
        this.c.fillStyle = this.bgColor;

        this.c.rect(this.o.x, this.o.y,
            this.cols * this.baseUnitSideLength,
            this.rows * this.baseUnitSideLength);
        this.c.fill();
        this.c.restore();
    }

    gridToPixel(gridCoordinate) {
        return { x: gridCoordinate.x * this.baseUnitSideLength, y: gridCoordinate.y * this.baseUnitSideLength }
    }

    occupyCells(handlePoint, shape) {
        // for (const cell of shape.returnOccupiedCells(handlePoint)) {
        //     this.grid[cell.y][cell.x] = true;
        // }

        shape.returnOccupiedCells(handlePoint).forEach(cell => this.grid[cell.y][cell.x] = true);
    }

    isCellOccupied(pos) {
        return this.grid[pos.y][pos.x];
    }

    hasConflicts(occupiedCells, movement = "down") {
        
        // console.table(this.grid)
        console.table(occupiedCells);

        for (const cell of occupiedCells) {
            switch(movement){
                case "down": if(cell.y >= this.rows) {return true;} break;
                case "right": if(cell.x >= this.cols) {return true;} break;
                case "left": if(cell.x < 0) {return true;} break;
            }

            if (this.grid[cell.y][cell.x]) {
                console.log("somehow get true");
                return true;
            }
        }

        return false;
    }

    getNextVerticalPos(pos) {
        return { y: pos.y + 1, x: pos.x };
    }

    getLeftPos(pos) {
        return { y: pos.y, x: pos.x - 1 };
    }

    getRightPos(pos) {
        return { y: pos.y, x: pos.x + 1 };
    }

    canMoveDown(currentPos, shape) {
        const shapeOccupation = shape.returnCellsAfterDrop(currentPos);

        return !this.hasConflicts(shapeOccupation);
    }

    canMoveLeft(currentPos, shape) {
        const shapeOccupation = shape.returnCellsAfterMoveLeft(currentPos);

        return !this.hasConflicts(shapeOccupation, "left");
    }

    canMoveRight(currentPos, shape) {
        // return currentPos.x < this.cols - 1 &&
        //     !this.isCellOccupied(this.getRightPos(currentPos))

        const shapeOccupation = shape.returnCellsAfterMoveRight(currentPos);

        return !this.hasConflicts(shapeOccupation, "right");
    }

    startGame() {
        const START_POS = { x: 4, y: 0 };
        let currentSquarePos = { ...START_POS };

        let currentActiveSquare = new OPiece(
            this.gridToPixel(currentSquarePos),
            this.c, this.baseUnitSideLength, "lightblue", this.bgColor);

        currentActiveSquare.display();

        window.onkeydown = (e) => {
            let key = e.key || e.keyCode;
            switch (key) {

                case "ArrowDown": case "s":
                    if (this.canMoveDown(currentSquarePos, currentActiveSquare)) {
                        currentActiveSquare.drop();
                        currentSquarePos.y++;
                    };
                    break;

                case "ArrowLeft": case "a":
                    if (this.canMoveLeft(currentSquarePos, currentActiveSquare)) {
                        currentActiveSquare.left();
                        currentSquarePos.x--;
                    };
                    break;

                case "ArrowRight": case "d":
                    if (this.canMoveRight(currentSquarePos, currentActiveSquare)) {
                        currentActiveSquare.right();
                        currentSquarePos.x++;
                    };
                    break;

            }
        }

        const gInterval = setInterval(() => {

            if (this.canMoveDown(currentSquarePos, currentActiveSquare)) {
                currentActiveSquare.drop();
                currentSquarePos.y++
            } else {

                this.occupyCells(currentSquarePos, currentActiveSquare);

                currentSquarePos = { ...START_POS };
                console.log(`currentSquarePos: `, currentSquarePos);
                currentActiveSquare = new OPiece(
                    this.gridToPixel(currentSquarePos),
                    this.c, this.baseUnitSideLength, "lightblue", this.bgColor);

                currentActiveSquare.display();

            }
        },
            1000);
    }
}

const gb = new Gameboard({ x: 0, y: 0 }, ctx, "white", 21, 10, 15)
gb.drawGameboard();
gb.startGame();