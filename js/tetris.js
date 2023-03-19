import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameOver = document.querySelector(".game-over");
const gameScore = document.querySelector(".score");
const startButton = document.querySelector(".game-over > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 11;

// Variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 4,
};

init();

// Functions
function init() {
    score = 0;
    gameScore.innerText = score;
    tempMovingItem = { ... movingItem };

    for (let i=0; i<GAME_ROWS; i++) {
        prependNewLine()
     } 
     generateNewBlock()
}


function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j=0; j<GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

function renderBlocks(moveType="") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ... movingItem };
            if(moveType === "retry") {
                clearInterval(downInterval);
                showGameOver();
            }
            setTimeout(()=>{
                renderBlocks("retry");
                if(moveType === "top") {
                    seizeBlock();
                }        
            }, 0)
            return true;
        }        
    })
    movingItem.top = top;
    movingItem.left = left;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if(!li.classList.contains("seized")) {
                matched = false;
            }
        })
        if(matched) {
            child.remove();
            prependNewLine();
            score += 10;
            gameScore.innerText = score;
        }
    })
    generateNewBlock();
}

function generateNewBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, duration)
    const blockArray = Object.entries(BLOCKS);
    const random = Math.floor(Math.random() * blockArray.length);
    movingItem.type = blockArray[random][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target) {
    if(!target || target.classList.contains("seized")) {
        return false;
    }    
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection() {
    const direction = tempMovingItem.direction
    direction === 3 ? tempMovingItem.direction =0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top", 1);
    }, 20);
}

function showGameOver() {
    gameOver.style.display = "flex";
}

// Event
document.addEventListener("keydown", e => {
    switch(e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
           changeDirection();
            break;
        case 32:
            dropBlock();
            break;            
    }
})

startButton.addEventListener("click", () => {
    playground.innerHTML = "";
    gameOver.style.display = "none";
    init();
})