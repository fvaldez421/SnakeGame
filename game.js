$(document).ready(function () {
    const c = document.getElementById("canv");
    const ctx = c.getContext("2d");
    $(document).on("keydown", newDir); // key listener
    setInterval(refresh, 400); //refreshes page every 400ms

    let trail; // trail array will contain objects with x and y values
    let body; //beggining length of tail
    let lastDir; // last used direction (prevents doubling back)
    let xd; // direction of x-axis
    let yd; // direction of y-axis
    const bl = 20; //working block size (20px)
    const scaleX = 20;
    const scaleY = 16;
    let rocks;
    let usedArr;
    let hx,hy,ax,ay,bx,by;
    let head,apple,banana;

    function start() { // called upon page ready
        lastDir = null;
        rocks = [];
        body = 1;
        trail = [];
        usedArr = [];
        makeRocks();
        resetHead();
        resetApple();
        resetBanana();
        xd = 0;
        yd = 0;
        hx = head.x;
        hy = head.y;
        ax = apple.x;
        ay = apple.y;
        bx = banana.x;
        by = banana.y;
    }

    function generateCoors(forRocks) { // Generates original, random coordinates
        let testArr = [];
        let repeat = false;
        let innerScaleX = scaleX;
        let innerScaleY = scaleY;
        if (forRocks) { // Rocks is a boolean for rock creation. They take up an additional 20 px so they must be compensated
            innerScaleX = 19;
            innerScaleY = 15;
        }
        if (trail && head) { // trail and head are also taken positions so if they have been established, their coordinates must be added
            testArr = usedArr.concat(trail, head);
        } else {
            testArr = usedArr;
        }
        const x = (Math.floor(Math.random() * innerScaleX)) * bl; // Random values
        const y = (Math.floor(Math.random() * innerScaleY)) * bl;

        testArr.forEach((coors) => { // If the random coordinates match any of the used coordinates x +/- 20, y +/- 20, a new stack is called
            if (x == coors.x && y == coors.y || x + 20 == coors.x && y + 20 == coors.y) {
                repeat = true; // repeat is used to prevent unwanted values being returned
                generateCoors(forRocks); // passes on rocks boolean incase repeat happens on rock formation
            } else if (x + 20 == coors.x && y == coors.y || x == coors.x && y + 20 == coors.y) {
                repeat = true;
                generateCoors(forRocks);
            }
        });
        // console.log(testArr);
        if (!repeat) { // will only return a value if repeat is false, if nothing is returned, Do-While repeats
            return { x, y };
        }
    }
    function makeRocks() { // resets location of rocks. Do-While ensures a new, free open space
        do {
            let coors = generateCoors(true); // forRocks bool is true on rock formation

            if (coors) {
                const { x, y } = coors;
                const rock = {
                    x: { 1: x, 2: x + bl },
                    y: { 1: y, 2: y + bl },
                };
                // console.log('coors:', coors);
                rocks.push(rock);
                usedArr.push(coors, { x: x + 20, y: y + 20 }, { x, y: y + 20 }, { x: x + 20, y });
            }
        }
        while (rocks.length < 3);
    }
    function resetHead() { // resets location of head. Do-While ensures a new, free open space
        do {
            let coors = generateCoors();
            if (coors) {
                head = coors; 
                usedArr.push(coors);
            }
        }
        while (!head);
    }
    function resetApple() { // resets location of apple. Do-While ensures a new, free open space
        let testCoors = apple;
        apple = null;
        do {
            let coors = generateCoors();
            if (coors && coors !== apple) {
                usedArr = usedArr.filter((usedCoors) => usedCoors != testCoors); // clears usedArr of the its previous position
                apple = coors; // reassigns variable for the global scope
                usedArr.push(coors); // adds new position to usedArr
            }
        }
        while (!apple);
    }
    function resetBanana() { // resets location of banana. Do-While ensures a new, free open space
        let testCoors = banana
        banana = null;
        do {
            let coors = generateCoors();
            if (coors && coors !== banana) {
                usedArr = usedArr.filter((usedCoors) => usedCoors !== testCoors); // clears usedArr of the its previous position
                banana = coors; // reassigns variable for the global scope
                usedArr.push(coors); // adds new position to usedArr
            }
        }
        while (!banana);
    }

    function refresh() { // generally the main game function, adds scores, checks status and rerenders the canvas

        hx += xd;
        hy += yd;
        if (hx === 400) { // edge consditionals, used to be set to wrap around but are nw set to restart game.
            // hx = 0;
            start();
        } else if (hx === -20) {
            // hx = 380;
            start();
        }
        if (hy === 320) {
            // hy = 0;
            start();
        } else if (hy === -20) {
            // hy = 300;
            start();
        }
        if (hx === ax && hy === ay) { // if the head touches the apple, coors are randomized, body is allows one more block
            body++;
            resetApple();
            ax = apple.x;
            ay = apple.y;
        } else if (hx === bx && hy === by) { // if the head touches the banana, coors are randomized, body is allowed two more blocks
            body = body + 2;
            resetBanana();
            bx = banana.x;
            by = banana.y;
        }

        ctx.fillStyle = "lightgrey"; // canvas rerender, new sheet over last refresh
        ctx.fillRect(0, 0, 400, 320);

        let grd;
        grd = ctx.createRadialGradient(hx + 10, hy + 10, 0, hx + 10, hy + 10, bl); // prints latest head
        grd.addColorStop(0, "green");
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.fillRect(hx, hy, bl, bl);

        grd = ctx.createRadialGradient(ax + 10, ay + 10, 0, ax + 10, ay + 10, bl); //prints current apple over latest canvas
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.fillRect(ax, ay, bl, bl);

        grd = ctx.createRadialGradient(bx + 10, by + 10, 0, bx + 10, by + 10, bl); //prints current banana over latest canvas
        grd.addColorStop(0, "yellow");
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.fillRect(bx, by, bl, bl);

        rocks.forEach((rock, i) => { // iterates through the rocks, creates each individually
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

                if (x[a] === hx && y[a] === hy || x[a] === hx && y[b] === hy && body > 1) {
                    // body = 1; // previously set to reset progress
                    start();
                }
            }
        });

        trail.forEach((block) => { // prints most current snake using coordinates inside trail array 
            let { x, y } = block;
            grd = ctx.createRadialGradient(x + 10, y + 10, 0, x + 10, y + 10, bl);
            grd.addColorStop(0, "lightgreen");
            grd.addColorStop(1, "black");
            ctx.fillStyle = grd;
            ctx.fillRect(x, y, bl, bl);

            if (x === hx && y === hy && body > 1) { // if any trails coordinates match the head, the score is reset
                // body = 1; // previously set to reset progress
                start();
            }
        });
        trail.push({ x: hx, y: hy }); // pushes updated head into trail
        while (trail.length > body) { // clears oldest block from trail, dependent on body count
            trail.shift();
        }

        $("#score").html(body - 1); // prints updated score (body - defaulted count of 1)
    }

    function newDir(event) { // key listeners
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
    start(); // starts game
});