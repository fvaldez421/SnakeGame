
$(document).ready(function () {
	const c = document.getElementById("canv");
	const ctx = c.getContext("2d");
	let grd;

	const spaceBar = 32;
	const leftArrow = 37;
	const upArrow = 38;
	const rightArrow = 39;
	const downArrow = 40;

	let gameOn = false;
	let gameInterval;
	let cycleActive = false;
	let wallMode = 1;

	let xd, yd;
	let lastDir;
	const bl = 20;
	let uniqueCoors = [];
	let rocks = [];

	let head, pastHead, apple, banana;
	let hx, hy, ax, ay, bx, by;
	let body;
	let trail = [];

	const startGameButton = $('#optionsComplete');
	startGameButton.on('click', () => {
		if (!gameInterval) {
			start();
		}
		if (!gameOn) {
			gameOn = true;
			init();
		}
	})

	/** Universal game event listener */
	$(document).on("keydown", function (event) {
		const { keyCode } = event;
		if (!gameInterval && keyCode === spaceBar) {
			if (!gameInterval) {
				start();
			}
			if (!gameOn) {
				gameOn = true;
				init();
			}
		} else if (isGameKey(keyCode)) {
			if (keyCode === spaceBar && (xd !== 0 || yd !== 0)) {
				pause();
			} else if (keyCode !== spaceBar) {
				return newDir(event);
			}
		}
	});

	/** Initializes a new game (resets all values) */
	function init(isRetry) {
		genBaseCoors();
		if (!isRetry) {
			lastDir = null;
			body = 1;
			trail = [];
			xd = 0;
			yd = 0;
		}
		resetRocks();
		resetItem('head');
		resetItem('apple');
		resetItem('banana');
		paintCanvas();
		paintRocks();
		paintApple();
		paintBanana();
		paintTrail();
		paintHead();
		$("#score").html(body - 1); // prints updated score (body - defaulted count of 1)
	}

	/** Game Cycle performs all 'turn' functions */
	function refresh() {
		if (!xd && !yd) return;
		pastHead = { ...head };
		hx += xd;
		hy += yd;
		testBoundaries();
		testTreats();
		testCannibalism();
		testObstacles();
		head = { x: hx, y: hy };

		// creates tail on first game move
		if (trail.length < 1) {
			trail.push(pastHead);
		}

		updateSnake();
		paintCanvas();
		paintRocks();
		paintApple();
		paintBanana();
		paintTrail();
		paintHead();
		$("#score").html(body - 1); // prints updated score (body - defaulted count of 1)
		cycleActive = false;
	}

	/** Generates base unique coordinates */
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

	/** 
	 * Returns an array of coordinates representing a rock 
	 * @param {object{}} coors base unique coordinates 
	 */
	var makeRock = coors => {
		const { x, y } = coors;
		return [
			{ x, y },
			{ x: x + bl, y },
			{ x, y: y + bl },
			{ x: x + bl, y: y + bl }
		]
	};

	/**
	 * is key an arrow key or spacebar
	 * @param {number} keyCode number of key in use
	 */
	var isGameKey = keyCode => (keyCode
		&& keyCode === leftArrow
		|| keyCode === upArrow
		|| keyCode === rightArrow
		|| keyCode === downArrow
		|| keyCode === spaceBar
	);

	/** ends the game */
	function endGame() {
		gameOn = false;
		clearInterval(gameInterval);
		gameInterval = null;
		console.log('endGame')
	}

	/** pauses game */
	function pause() {
		clearInterval(gameInterval);
		gameInterval = null;
	}

	function start() {
		gameInterval = setInterval(refresh, 400);
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
	 * Tests that coors are unique
	 * @param {object{}} coors 
	 * @param {boolean} isRock 
	 */
	function isUnique(coors) {
		const found = uniqueCoors.find(({ x, y }) => (coors.x === x && coors.y === y));
		return !!found;
	}

	/**
	 * Generates fresh/unique coordinates
	 * @param {boolean} forRocks Enables different boundaries and
	 * updates the uniqueCoors with all 4 rock segments
	 */
	function generateCoors(forRocks) {
		let testArr = [...uniqueCoors];
		let coors = null;
		if (forRocks) {
			testArr = testArr.filter(({ x, y }) => x < 360 && y < 280 && x !== 0 && y !== 0);
		}
		function getRand() {
			const randNum = Math.floor(Math.random() * (testArr.length - 1));
			return testArr[randNum] || null;
		}
		coors = getRand();
		if (forRocks) {
			let clearsAll = true;
			let blockArr = makeRock(coors);
			blockArr.forEach(pair => {
				let pass = isUnique(pair)
				if (!pass) clearsAll = pass;
			});
			if (!clearsAll) {
				coors = generateCoors(forRocks);
				blockArr = makeRock(coors);
			}
			blockArr.forEach(updateUnique);
		} else {
			updateUnique(coors);
		}
		return coors;
	}

	/** Resets the coordinates for rocks */
	function resetRocks() {
		rocks = [];
		for (let i = 0; i < 3; i++) {
			const coors = generateCoors(true); // forRocks bool is true on rock formation
			if (coors) {
				const { x, y } = coors;
				const rock = {
					x: { 1: x, 2: x + bl },
					y: { 1: y, 2: y + bl },
				};
				rocks.push(rock);
			}
		}
	}

	function resetItem(item) {
		if (item === 'head') {
			head = generateCoors();
			hx = head.x;
			hy = head.y;
		} else if (item === 'apple') {
			apple = generateCoors();
			ax = apple.x;
			ay = apple.y;
		} else if (item === 'banana') {
			banana = generateCoors();
			bx = banana.x;
			by = banana.y;
		}
	}

	function updateSnake() {
		trail = [pastHead, ...trail];
		updateUnique(pastHead);
		// clears oldest block from trail, dependent on body count
		while (trail.length > body) {
			const freedCoors = trail.pop();
			uniqueCoors.push(freedCoors);
		}
	}

	function paintCanvas() {
		ctx.fillStyle = "lightgrey";
		ctx.fillRect(0, 0, 400, 320);
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
			resetItem('apple');
		} else if (hx === bx && hy === by) { // if the head touches the banana, coors are randomized, body is allowed two more blocks
			body = body + 3;
			resetItem('banana');
		}
	}

	function testBoundaries() {
		const easy = wallMode === 1;
		const standard = wallMode === 2;
		if (hx === 400) { // edge conditionals, used to be set to wrap around but are new set to recycle game.
			if (easy) {
				hx = 0;
			} else if (standard) {
				endGame();
			}
		} else if (hx === -20) {
			if (easy) {
				hx = 380;
			} else if (standard) {
				endGame();
			}
		} else if (hy === 320) {
			if (easy) {
				hy = 0;
			} else if (standard) {
				endGame();
			}
		} else if (hy === -20) {
			if (easy) {
				hy = 300;
			} else if (standard) {
				endGame();
			}
		}
	}

	function userFault() {
		endGame();
	}

	function testObstacles() {
		rocks.forEach((rock, i) => { // iterates through the rocks, paints each individually
			let { x, y } = rock;
			for (let a = 1, b = 2; a < 3 && b > 0; a++ , b--) {
				if ((x[a] === hx && y[a] === hy) || (x[a] === hx && y[b] === hy)) {
					userFault();
					paintHead();
				}
			}
		});
	}

	function testCannibalism() {
		trail.forEach((block, i) => { // prints most current snake using coordinates inside trail array 
			if (i + 1 === trail.length) return;
			let { x, y } = block;
			if (x === hx && y === hy && body > 1) { // if any trails coordinates match the head, the score is reset
				userFault();
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

	/** Changes direction of snake (Map represents fourth quadrant in a cartesian plane) */
	function newDir(event) {
		if (!cycleActive && gameInterval) {
			cycleActive = true;
			switch (event.keyCode) {
				case leftArrow:
					if (lastDir !== rightArrow) { // conditionals prevent doubling back
						lastDir = leftArrow;
						xd = -1 * bl;
						yd = 0;
					}
					break;
				case upArrow:
					if (lastDir !== downArrow) {
						lastDir = upArrow;
						xd = 0;
						yd = -1 * bl;
					}
					break;
				case rightArrow:
					if (lastDir !== leftArrow) {
						lastDir = rightArrow;
						xd = 1 * bl;
						yd = 0;
					}
					break;
				case downArrow:
					if (lastDir !== upArrow) {
						lastDir = downArrow;
						xd = 0;
						yd = 1 * bl;
					}
					break;
			}
		}
	}
});

