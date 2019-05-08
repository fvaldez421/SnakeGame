$(document).ready(function () {
	const c = document.getElementById("canv");
	const ctx = c.getContext("2d");
	let grd;

	let trail; // trail array will contain objects with x and y values
	let body; //beggining length of tail
	let lastDir; // last used direction (prevents doubling back)
	let xd; // direction of x-axis
	let yd; // direction of y-axis
	const bl = 20; //working block size (20px)
	const scaleX = 20;
	const scaleY = 16;
	let uniqueCoors = [];
	let rocks;
	let hx, hy, ax, ay, bx, by;
	let head, apple, banana;

	let gameOn = false;
	let gameInterval;
	let cycleActive = false;

	const spaceBar = 32;
	const leftArrow = 37;
	const upArrow = 38;
	const rightArrow = 39;
	const downArrow = 40;

	function genBaseCoors() {
		let x = 0;
		let y = 0;
		for (let a = 0; a < 320; a++) {
			if ((a !== 0) && a % 20 === 0) {
				y = y + 20;
			}
			uniqueCoors.push({ x, y });
			x = x + 20;
			if (x > 380) {
				x = 0;
			}
		}
	};

	const makeRock = ({ x, y }) => [
		{ x, y },
		{ x: x + bl, y },
		{ x, y: y + bl },
		{ x: x + bl, y: y + bl }
	];

	/**
	 * is key an arrow key or spacebar
	 * @param {number} keyCode number of key in use
	 */
	const isGameKey = keyCode => (keyCode
		&& keyCode === leftArrow
		|| keyCode === upArrow
		|| keyCode === rightArrow
		|| keyCode === downArrow
		|| keyCode === spaceBar
	);

	$(document).on("keydown", function (event) {
		const { keyCode } = event;
		if (!gameInterval && keyCode === spaceBar) {
			if (!gameInterval) {
				gameInterval = setInterval(refresh, 400); //refreshes page every 400ms
			}
			if (!gameOn) {
				gameOn = true;
				init();
			}
		} else if (isGameKey(keyCode)) {
			if (keyCode === spaceBar && (xd !== 0 || yd !== 0)) {
				const pause = true;
				stop(pause);
			} else if (keyCode !== spaceBar) {
				return newDir(event);
			}
		}
	});

	/** Initializes a new game (resets all values) */
	function init() {
		lastDir = null;
		body = 1;
		trail = [];
		genBaseCoors();
		resetRocks();
		resetHead();
		resetApple();
		resetBanana();
		xd = 0;
		yd = 0;
		paintCanvas();
		// paintGround()
	}
	/**
	 * pauses or ends the game
	 * @param {boolean} pause 
	 */
	function stop(pause) {
		if (!pause) gameOn = false;
		clearInterval(gameInterval);
		gameInterval = null;
	}
	/**
	 * updates the set of uniqueCoors
	 * @param {object} coors Set of coordinates to remove from uniqueCoors
	 */
	function updateUnique(coors) {
		if (coors) {
			const { x: segX, y: segY } = coors;
			uniqueCoors = uniqueCoors.filter(({ x, y }) => x !== segX || y !== segY);
		}
	}
	/**
	 * Generates fresh/unique coordinates
	 * @param {boolean} forRocks Enables different boundaries and
	 * updates the uniqueCoors with all 4 rock segments
	 */
	function generateCoors(forRocks) {
		let testArr = [...uniqueCoors];
		if (forRocks) {
			testArr = testArr.filter(({ x, y }) => x !== 380 && y !== 300);
		}
		const randNum = Math.floor(Math.random() * testArr.length - 1);
		let coors = testArr[randNum];
		if (forRocks) {
			const coorsArr = makeRock(coors);
			coorsArr.forEach(updateUnique);
		} else {
			updateUnique(coors);
		}
		return coors;
	}

	function resetRocks() { // resets location of rocks. Do-While ensures a new, free open space
		const nextRocks = [];
		for (let i = 0; i < 3; i++) {
			const coors = generateCoors(true); // forRocks bool is true on rock formation
			if (coors) {
				const { x, y } = coors;
				const rock = {
					x: { 1: x, 2: x + bl },
					y: { 1: y, 2: y + bl },
				};
				nextRocks.push(rock);
			}
		}
		rocks = nextRocks;
	}

	function resetHead() {
		head = generateCoors();
		hx = head.x;
		hy = head.y;
	}

	function resetApple() {
		apple = generateCoors();
		ax = apple.x;
		ay = apple.y;
	}

	function resetBanana() {
		banana = generateCoors();
		bx = banana.x;
		by = banana.y;
	}

	function updateSnake(nextHead) {
		// pushes updated head into trail
		trail.unshift(nextHead);
		updateUnique(nextHead);
		// clears oldest block from trail, dependent on body count
		while (trail.length > body) {
			const freedCoors = trail.pop();
			uniqueCoors.push(freedCoors);
		}

	}

	function paintCanvas() {
		ctx.fillStyle = "lightgrey";
		ctx.fillRect(0, 0, 400, 320);

		paintApple();
		paintBanana();
		paintHead();
		paintTrail();
		paintRocks();
	}

	function paintApple() {
		grd = ctx.createRadialGradient(ax + 10, ay + 10, 0, ax + 10, ay + 10, bl); //prints current apple over latest canvas
		grd.addColorStop(0, "red");
		grd.addColorStop(1, "black");
		ctx.fillStyle = grd;
		ctx.fillRect(ax, ay, bl, bl);
	}

	function paintBanana() {
		grd = ctx.createRadialGradient(bx + 10, by + 10, 0, bx + 10, by + 10, bl); //prints current banana over latest canvas
		grd.addColorStop(0, "yellow");
		grd.addColorStop(1, "black");
		ctx.fillStyle = grd;
		ctx.fillRect(bx, by, bl, bl);
	}

	function paintRocks() {
		rocks.forEach((rock, i) => { // iterates through the rocks, paints each individually
			let { x, y } = rock;
			for (let a = 1, b = 2; a < 3 && b > 0; a++ , b--) {
				grd = ctx.createRadialGradient(x[a] + 10, y[a] + 10, 0, x[a] + 10, y[a] + 10, bl);
				grd.addColorStop(0, "white");
				grd.addColorStop(1, "black");
				ctx.fillStyle = grd;
				ctx.fillRect(x[a], y[a], bl, bl);

				grd = ctx.createRadialGradient(x[a] + 10, y[b] + 10, 0, x[a] + 10, y[b] + 10, bl);
				grd.addColorStop(0, "white");
				grd.addColorStop(1, "black");
				ctx.fillStyle = grd;
				ctx.fillRect(x[a], y[b], bl, bl);
			}
		});
	}

	function paintHead() {
		grd = ctx.createRadialGradient(hx + 10, hy + 10, 0, hx + 10, hy + 10, bl); // prints latest head
		grd.addColorStop(0, "green");
		grd.addColorStop(1, "black");
		ctx.fillStyle = grd;
		ctx.fillRect(hx, hy, bl, bl);
	}

	function testTreats() {
		if (hx === ax && hy === ay) { // if the head touches the apple, coors are randomized, body is allows one more block
			body++;
			resetApple();
		} else if (hx === bx && hy === by) { // if the head touches the banana, coors are randomized, body is allowed two more blocks
			body = body + 3;
			resetBanana();
		}
	}

	function testBoundaries(mode = 'standard') {
		let boundaryHit = false;
		let value;
		const easy = mode === 'easy';
		const standard = mode === 'standard';
		let easyAction = () => value;
		let standardAction = () => stop();
		let onHit = () => console.log('No boundary action assigned');
		if (easy) onHit = easyAction;
		if (standard) onHit = standardAction;

		if (hx === 400) { // edge conditionals, used to be set to wrap around but are new set to recycle game.
			if (easy) value = (hx = 0);
			boundaryHit = true;
		} else if (hx === -20) {
			if (easy) value = (hx = 380);
			boundaryHit = true;
		} else if (hy === 320) {
			if (easy) value = (hy = 0);
			boundaryHit = true;
		} else if (hy === -20) {
			if (easy) value = (hy = 300);
			boundaryHit = true;
		}

		if (boundaryHit) onHit();
	}

	function testObstacles() {
		rocks.forEach((rock, i) => { // iterates through the rocks, paints each individually
			let { x, y } = rock;
			for (let a = 1, b = 2; a < 3 && b > 0; a++ , b--) {
				if ((x[a] === hx && y[a] === hy) || (x[a] === hx && y[b] === hy)) {
					// body = 1; // previously set to reset progress
					stop();
					paintHead();
				}
			}
		});
	}

	function testCannibalism() {
		trail.forEach((block) => { // prints most current snake using coordinates inside trail array 
			let { x, y } = block;
			if (x === hx && y === hy && body > 1) { // if any trails coordinates match the head, the score is reset
				// body = 1; // previously set to reset progress
				stop();
				return;
			}
		});
	}

	function paintTrail() {
		trail.forEach((block) => { // prints most current snake using coordinates inside trail array 
			let { x, y } = block;
			grd = ctx.createRadialGradient(x + 10, y + 10, 0, x + 10, y + 10, bl);
			grd.addColorStop(0, "lightgreen");
			grd.addColorStop(1, "black");
			ctx.fillStyle = grd;
			ctx.fillRect(x, y, bl, bl);
		});
	};

	function refresh() {
		console.log(uniqueCoors.length);
		if (!xd && !yd) return;
		hx += xd;
		hy += yd;

		testTreats();
		testBoundaries();
		testObstacles();
		testCannibalism();

		// creates train on first game move
		if (trail.length < 1) {
			trail.push(head);
		}

		head = { x: hx, y: hy };
		paintCanvas();
		updateSnake(head);
		$("#score").html(body - 1); // prints updated score (body - defaulted count of 1)
		cycleActive = false;
	}

	function newDir(event) { // key listeners
		if (!cycleActive && gameInterval) {
			cycleActive = true;
			switch (event.keyCode) {
				case 37:
					if (lastDir !== 39) { // conditionals prevent doubling back
						lastDir = 37;
						xd = -1 * bl;
						yd = 0;
					}
					break;
				case 38:
					if (lastDir !== 40) {
						lastDir = 38;
						xd = 0;
						yd = -1 * bl;
					}
					break;
				case 39:
					if (lastDir !== 37) {
						lastDir = 39;
						xd = 1 * bl;
						yd = 0;
					}
					break;
				case 40:
					if (lastDir !== 38) {
						lastDir = 40;
						xd = 0;
						yd = 1 * bl;
					}
					break;
			}
		}
	}
	// init(); // cycles game
});