const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;
let enemiesInterval = 600;
let numberOfResources = 300;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let choosenDefender = 1;
const background = new Image();
background.src = 'Sprites_robots_vs_aliens/Theme1_background.jpg';

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

//mouse
const mouse = {
    x: 10, 
    y:10,
    width: 0.1, 
    height: 0.1,
    clicked: false,
}
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});

canvas.addEventListener('mouseup', function () {
    mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
})

canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}

class Cell {
    constructor(x, y){
        this.x = x
        this.y = y 
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if( mouse.x && mouse.y && collision(this, mouse)){
            c.strokeStyle = 'black';
            c.strokeRect(this.x, this.y, this.width, this.height);
        }
        

    }
}

function createGrid(){
    for( let y = cellSize; y < canvas.height; y += cellSize){
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

function handleGameGrid(){
    for(let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}
//projectiles
class Projectile{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        c.fillStyle = 'black';
        c.beginPath();
        c.arc(this.x, this.y, this.width, 0, Math.PI * 2, false);
        c.fill();
        c.closePath();
    }
}

function handleProjectiles(){
    for(let i = 0; i < projectiles.length ; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for(let j = 0; j < enemies.length; j++){
            if( enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice( i, 1);
                i--;
            }
        }

        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice( i, 1);
            i--;
        }
    }
}

//defenders
;
const defender1 = new Image();
defender1.src = 'Sprites_robots_vs_aliens/defender1.png';
const defender2 = new Image();
defender2.src = 'Sprites_robots_vs_aliens/defender2.png';


class Defender{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 194;
        this.spriteHeight = 194;
        this.minFrame = 0;
        this.maxFrame = 16;
        this.choosenDefender = choosenDefender;
    }
    draw(){
        //c.fillStyle = 'blue';
        //c.fillRect(this.x, this.y, this.width, this.height);
        c.fillStyle = 'gold';
        c.font = '20px Orbitron';
        c.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        if(this.choosenDefender === 1){
            c.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }else if(this.choosenDefender === 2){
            c.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    update(){
        if(frame % 10 === 0){
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if(this.frameX === 15) this.shootNow = true;
        }
        switch (choosenDefender) {
            case 1:
                if(this.shooting){
                    this.minFrame = 0;
                    this.maxFrame = 16;
                }else{
                    this.minFrame = 17;
                    this.maxFrame = 24;
                }
                break;
            case 2:
                if(this.shooting){
                    this.minFrame = 0;
                    this.maxFrame = 20;
                }else{
                    this.minFrame = 21;
                    this.maxFrame = 28;
                }
            default:
                break;
        }

        if(this.shooting && this.shootNow){
            projectiles.push( new Projectile(this.x + 70, this.y + 35));
            this.shootNow = false;
        }
    }
}


function handleDefenders(){
    for(let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if(enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        }else{
            defenders[i].shooting = false;
        }
        for(let j = 0; j < enemies.length; j++){
            if( defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
                
            }
            if( defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
                
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85,
    strokeColor: 'black',
}
const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85,
    strokeColor: 'black',
}

function chooseDefender(){
    if(collision(mouse, card1) && mouse.clicked){
        choosenDefender = 1
    } else if (collision(mouse, card2) && mouse.clicked){
        choosenDefender = 2;
    }

    switch (choosenDefender) {
        case 1:
            card1.strokeColor = 'gold';
            card2.strokeColor = 'black';
            break;
        case 2:
            card1.strokeColor = 'black';
            card2.strokeColor = 'gold';
            break
        default:
            card1.strokeColor = 'black';
            card2.strokeColor = 'black';
            break;
    }

    c.lineWidth = 1;
    c.fillStyle = 'rgba(0, 0, 0, 0.2)';
    c.fillRect(card1.x, card1.y, card1.width, card1.height);
    c.strokeStyle = card1.strokeColor;
    c.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194 / 2, 194 / 2);
    c.strokeRect(card1.x, card1.y, card1.width, card1.height);
    c.fillRect(card2.x, card2.y, card2.width, card2.height);
    c.drawImage(defender2, 0, 0, 194, 194, 80, 5, 194 / 2, 194 / 2);
    c.strokeStyle = card2.strokeColor;
    c.strokeRect(card2.x, card2.y, card2.width, card2.height);
    

}

// floating Messages
const floatingMessages = [];

class floatingMessage{
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if(this.opacity > 0.03) this.opacity -= 0.03;
    }
    draw(){
        c.globalAlpha = this.opacity;
        c.fillStyle = this.color;
        c.font = this.size + 'px Orbitron';
        c.fillText(this.value, this.x, this.y);
        c.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for(let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();

        if(floatingMessages[i].lifeSpan >= 50){
            floatingMessages.splice( i, 1);
            i--;
        }
    }
}

//enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'Sprites_robots_vs_aliens/enemy1_walk.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'Sprites_robots_vs_aliens/enemy2_walk.png'
enemyTypes.push(enemy2);

class Enemy{
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor( Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.attacking = false;

        switch (this.enemyType) {
            case enemy1:
                this.maxFrame = 4;
                break;
            case enemy2:
                this.maxFrame = 7;
                break;
            default:
                break;
        }

        this.spriteWidth = 256;
        this.spriteHeight = 256;
    }
    update(){
        this.x -= this.movement;
        if( frame % 9 === 0){
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
        
    }
    draw(){
        //c.fillStyle = 'red';
        //c.fillRect(this.x, this.y, this.width, this.height);
        c.fillStyle = 'gold';
        c.font = '20px Orbitron';
        c.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        //c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        c.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

function handleEnemies(){
    for(let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if(enemies[i].x < 0){
            gameOver = true;
        }
        if(enemies[i].health <= 0){
            let gainedResources = enemies[i].maxHealth / 10;
            floatingMessages.push( new floatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'gold'));
            floatingMessages.push( new floatingMessage('+' + gainedResources, 470, 85, 30, 'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y)
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice( i, 1);
            i--;
        }
    }
    if( frame % enemiesInterval === 0 && score < winningScore){
        let verticalPosition = Math.floor( Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if( enemiesInterval > 120) enemiesInterval -= 50;
    }
}
//resources
const amounts = [20, 30, 40];
class Resource{
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6
        this.height = cellSize * 0.6
        this.amount = amounts[Math.floor( Math.random() * amounts.length)];
    }
    draw(){
        c.fillStyle = 'yellow';
        c.fillRect(this.x, this.y, this.width, this.height);
        c.fillStyle = 'black';
        c.font = '20px Orbitron';
        c.fillText(this.amount, this.x + 15, this.y + 25);
    }
}

function handleResources(){
    if(frame % 500 === 0 && score < winningScore){
        resources.push( new Resource());
    }
    for(let i = 0; i < resources.length; i++){
        resources[i].draw();
        if(resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            floatingMessages.push( new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'gold'));
            floatingMessages.push( new floatingMessage('+' + resources[i].amount, 470, 85, 30, 'gold'));
            resources.splice( i, 1);
            i--;
        }
    }
}
//utilities
function handleGameStatus(){
    c.fillStyle = 'gold';
    c.font = '30px Orbitron';
    c.fillText('Resources: ' + numberOfResources, 180, 80);
    c.fillText('Score: ' + score, 180, 40);
    if(gameOver){
        c.fillStyle = 'black';
        c.font = '90px Orbitron';
        c.fillText('GAME OVER', 135, 330);
    }
    if(score >= winningScore && enemies.length === 0){
        c.fillStyle = 'black';
        c.font = '60px Orbitron';
        c.fillText('LEVEL COMPLETE', 130, 300);
        c.font = '30px Orbitron';
        c.fillText('You win with: ' + score + 'points!', 134, 340);
    }
}

canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if(gridPositionY < cellSize) return;
    for(let i = 0; i < defenders.length; i++){
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
        return;
    }
    let defenderCost = 100;
    if(numberOfResources >= defenderCost){
        defenders.push( new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push( new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'blue'));
    }
});


function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(background, 0, 0, canvas.width, canvas.height);
    c.fillStyle = 'blue'
    c.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleResources()
    handleDefenders();
    handleEnemies();
    handleProjectiles();
    chooseDefender()
    handleGameStatus();
    handleFloatingMessages()
    frame++;
    if( !gameOver ) requestAnimationFrame(animate);
    
}

animate();

function collision(first, second){
    if( !( first.x > second.x + second.width ||
           first.x + first.width < second.x || 
           first.y > second.y + second.height ||
           first.y + first.height < second.y 
    )){
        return true;
    }
}

addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})
