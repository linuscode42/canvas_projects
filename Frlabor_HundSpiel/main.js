import { Player } from './player.js';
import { InputHandler } from './Input.js';
import { Background } from './background.js';
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from './enemies.js';
import { UI } from './UI.js';

window.addEventListener('load', function(){


const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 500;

class Game{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.groundMargin = 80;
        this.speed = 0;
        this.maxSpeed = 3;
        this.background = new Background(this);
        this.player = new Player(this)
        this.input = new InputHandler(this);
        this.UI = new UI(this);
        this.enemies = [];
        this.particles = [];
        this.maxParticles = 200;
        this.enemyTimer = 0;
        this.enemyInterval = 1000;
        this.debug = false;
        this.score = 0;
        this.fontColor = 'black';
        this.player.currentState = this.player.states[0];
        this.player.currentState.enter();
        
    }
    update(deltatime){
        this.background.update();
        this.player.update(this.input.keys, deltatime);

        //handle Enemies
        if(this.enemyTimer > this.enemyInterval){
            this.addEnemy();
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltatime;
        }
        this.enemies.forEach( (enemy, index) => {
            enemy.update(deltatime);
            if(enemy.markedForDeletion === true) this.enemies.splice( index, 1);
        })
        //handle Particles
        this.particles.forEach((particle, index) => {
            particle.update();
            if(particle.markedForDeletion) this.particles.splice( index, 1);
        });
        if(this.particles.length > this.maxParticles){
            this.particles = this.particles.slice( 0, this.maxParticles);
        }
    }
    draw(context){
        this.background.draw(context);
        this.player.draw(context);
        this.enemies.forEach( enemy => {
            enemy.draw(context);
        });
        this.particles.forEach(particle => {
            particle.draw(context);
        });
        this.UI.draw(context);
    }
    addEnemy(){
        if(this.speed > 0 && Math.random() < 0.5) this.enemies.push( new GroundEnemy(this));
        else if( this.speed > 0) this.enemies.push( new ClimbingEnemy(this))
        this.enemies.push( new FlyingEnemy(this));
    }
}

const game = new Game(canvas.width, canvas.height);
let lastTime = 0;

function animate(timeStamp){
    const deltatime = timeStamp - lastTime;
    lastTime = timeStamp;
    c.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltatime);
    game.draw(c);
    requestAnimationFrame(animate);
}

animate(0);

});
