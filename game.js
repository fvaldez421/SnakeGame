$(document).ready(function(){
    var c = document.getElementById("canv");
    var ctx = c.getContext("2d");
    $(document).on("keydown", newDir); // key listener
    setInterval(refresh, 400); //refreshes page every 400ms

    var trail = []; // tail array will contain objects with x and y values
    var body = 3; //beggining length of tail
    var lastDir; // last used direction (prevents doubling back)
    var bl = 20; //working block size (20px)
    var hx = 200; // head x-coordinate
    var hy = 200; // head y-coordinate
    var fx = (Math.floor(Math.random() * 21)) * 20; // (fruit x and y)
    var fy = (Math.floor(Math.random() * 21)) * 20; // Random values from the start
    var xd = 0; // direction of x-axis
    var yd = 0; // direction of y-axis
    
    function start() { // called upon page ready, simply creates a head at the center of the map
        var grd = ctx.createRadialGradient(hx+10, hy+10, 0, hx+10, hy+10, 20);
        grd.addColorStop(0,"green");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(hx,hy,bl,bl);
    }
    function refresh() { // generally the main game function, adds scores, checks status and rerenders the canvas
        hx+=xd;
        hy+=yd;
        if (hx === 420) { // wrap-around conditionals
            hx = 0;
        }else if (hx === -20) {
            hx = 400;
        }
        if (hy === 420) {
            hy = 0;
        }else if (hy === -20) {
            hy = 400;
        }
        if (hx===fx && hy===fy) { // if the head touches the fruit, fruit coors are randomized, body is allows one more block
            body++;
            fx = (Math.floor(Math.random() * 21)) * 20;
            fy = (Math.floor(Math.random() * 21)) * 20;    
        };

        ctx.fillStyle = "lightgrey"; // canvas rerender, new sheet over last refresh
        ctx.fillRect(0,0,420,420);

        for(var i=0; i < trail.length; i++) { // prints most current snake using coordinates inside trail array 
            var grd = ctx.createRadialGradient(trail[i].x + 10,trail[i].y + 10, 0, trail[i].x + 10,trail[i].y + 10, 20);
            grd.addColorStop(0,"green");
            grd.addColorStop(1,"black");
            ctx.fillStyle = grd;
            ctx.fillRect(trail[i].x,trail[i].y,bl,bl);

            if (trail[i].x === hx && trail[i].y === hy) { // if any trail coordinated match the heads, the score is reset
                body = 3;
            }
        }
        trail.push({x:hx , y:hy}); // pushes updated head into trail
        while (trail.length > body) { // clears oldest block from trail, dependent on body count
            trail.shift()
        }

        var grd = ctx.createRadialGradient(hx+10, hy+10, 0, hx+10, hy+10, 20); // prints latest head
        grd.addColorStop(0,"green");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(hx,hy,bl,bl);

        var grd = ctx.createRadialGradient(fx+10, fy+10, 0, fx+10, fy+10, 20); //prints current fruit over latest canvas
        grd.addColorStop(0,"red");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(fx,fy,bl,bl); 

        $("#score").html(body - 3); // prints updated score (body - defaulted count of 3)
    }

    function newDir(event) {
        switch(event.keyCode) {
            case 37:
                if (lastDir !== 39) { // prevent doubling back
                    lastDir = 37;
                    xd = -1*20;
                    yd = 0;
                }
            break;
            case 38:
                if (lastDir !== 40) {
                    lastDir = 38;
                    xd = 0;
                    yd = -1*20;
                }
            break;
            case 39:
                if (lastDir !== 37) {
                    lastDir = 39;
                    xd = 1*20;
                    yd = 0;
                }
            break;        
            case 40:
                if (lastDir !== 38) {
                    lastDir = 40;
                    xd = 0;
                    yd = 1*20;
                }
            break;            
        }
    }
    start();


});