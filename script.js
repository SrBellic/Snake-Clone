const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const gameOverText = document.getElementById('game-over');

const statsText = document.getElementById('stats-message');
const buttons = document.querySelectorAll('.buttons button');

const PIXEL = {
	width: 25,
	height: 25,
};

const CANVAS_LIMIT = {
	//Canvas size limit
	width: canvas.width,
	height: canvas.height,
};

const score = 100; //Initial score for the snake

let axisY = 0;
let axisX = 0; //Coordenates of the snake
let direction = null;
let lastDirection = null;
let gameStatus = true;

document.addEventListener('keydown', (e) => {
	//restart the game if it is over
	if (gameStatus === false) {
		gameOverText.classList.add('hidden'); //Hide game over text
		location.reload(); //Reload the page to restart the game
		gameStatus = true;
	}

	const allowed = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
	if (!allowed.includes(e.key)) return;

	const opposites = {
		ArrowUp: 'ArrowDown',
		ArrowDown: 'ArrowUp',
		ArrowLeft: 'ArrowRight',
		ArrowRight: 'ArrowLeft',
	};

	// Block opposite directions
	if (lastDirection && e.key === opposites[lastDirection]) return;

	direction = e.key;
});

class Snake {
	//Snake class to handle the snake's body, movement and enviroment
	constructor(body, score) {
		this.body = body;
		this.long = body.length;
		this.score = score;
	}

	stats() {
		return `Long: ${this.long}, Score: ${this.score}`;
	}

	grow(body, score) {
		this.body.push(body);
		this.long = this.body.length;
		this.score += score;
	}

	move(axisX, axisY) {
		// Save the previous position of each segment
		for (let i = this.body.length - 1; i > 0; i--) {
			this.body[i].x = this.body[i - 1].x;
			this.body[i].y = this.body[i - 1].y;
		}
		// Move the head
		this.body[0].x = axisX;
		this.body[0].y = axisY;
	}

	eat() {
		const last = this.body[this.body.length - 1];
		this.grow({ x: last.x, y: last.y }, score);
	}
}

const fruit = {
	//Fruit object to be generated randomly
	x:
		Math.floor(Math.random() * (CANVAS_LIMIT.width / PIXEL.width)) *
		PIXEL.width,
	y:
		Math.floor(Math.random() * (CANVAS_LIMIT.height / PIXEL.height)) *
		PIXEL.height,
};

let snake = new Snake(
	[
		{ x: 0, y: 0 }, // cabeza
		{ x: -25, y: 0 },
		{ x: -50, y: 0 },
	],
	0
);

statsText.textContent = snake.stats();

function generateFruit() {
	//Function to generate fruit in a random position
	let valid = false;

	while (!valid) {
		fruit.x =
			Math.floor(Math.random() * (CANVAS_LIMIT.width / PIXEL.width)) *
			PIXEL.width;
		fruit.y =
			Math.floor(Math.random() * (CANVAS_LIMIT.height / PIXEL.height)) *
			PIXEL.height;

		// Don't generate fruit on the snake's body
		valid = !snake.body.some(
			(segment) => segment.x === fruit.x && segment.y === fruit.y
		);
	}
}

function checkGameOver() {
	const head = snake.body[0];

	// Check if the snake hits the wall
	const hitWall =
		head.x < 0 ||
		head.y < 0 ||
		head.x > CANVAS_LIMIT.width ||
		head.y > CANVAS_LIMIT.height;

	// Check if the snake hits itself
	const hitSelf = snake.body
		.slice(1)
		.some((segment) => segment.x === head.x && segment.y === head.y);

	if (hitWall || hitSelf) {
		gameStatus = false; //Set game status to false
	}

	if (!gameStatus) {
		gameOverText.classList.remove('hidden'); //Show game over text
		// location.reload(); //Reload the page to restart the game
	}
}

function updateDirection() {
	//Function to update the direction of the snake based on the arrow keys pressed

	if (!direction) return; //If no direction is set, do nothing

	switch (
		direction //This condition makes the limits of the movement
	) {
		case 'ArrowUp':
			if (axisY > -PIXEL.height) axisY -= PIXEL.height;
			break;
		case 'ArrowDown':
			if (axisY < CANVAS_LIMIT.height - PIXEL.height) axisY += PIXEL.height;
			break;
		case 'ArrowRight':
			if (axisX < CANVAS_LIMIT.width - PIXEL.width) axisX += PIXEL.width;
			break;
		case 'ArrowLeft':
			if (axisX > -PIXEL.width) axisX -= PIXEL.width;
			break;
	}
	lastDirection = direction; //Save the last direction
	snake.move(axisX, axisY);

	// fruit collision check
	if (snake.body[0].x === fruit.x && snake.body[0].y === fruit.y) {
		snake.eat();

		generateFruit();

		//Update stats
		statsText.textContent = snake.stats();
	}

	checkGameOver();
}

function draw() {
	//Function to draw the snake and fruit on the canvas
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'red'; //Color for fruit
	ctx.fillRect(fruit.x, fruit.y, PIXEL.width, PIXEL.height); //fruit render

	if (snake.body[0].x === fruit.x && snake.body[0].y === fruit.y) {
		snake.eat(fruit);
		statsText.textContent = snake.stats();
	}

	snake.body.forEach((segment, index) => {
		ctx.fillStyle = 'white';
		if (index % 2 === 0) ctx.fillStyle = '#ddf0cdff';

		ctx.fillRect(segment.x, segment.y, PIXEL.width, PIXEL.height); //snake render
	});

	ctx.restore();

	requestAnimationFrame(draw); //callback to draw function
}

setInterval(updateDirection, 175); //Update the snake's position every 175ms
draw();
