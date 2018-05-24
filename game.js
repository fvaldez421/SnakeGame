$(document).ready(function(){
    var c = document.getElementById("canv");
    var ctx = c.getContext("2d");
    $(document).on("keydown", newDir);
    setInterval(refresh, 400);

    var trail = [];
    var body = 3;
    var lastDir;
    var bl = 20;
    var hx = 200;
    var hy = 200;
    var fx = (Math.floor(Math.random() * 21)) * 20;
    var fy = (Math.floor(Math.random() * 21)) * 20;   
    var xd = 0;
    var yd = 0;
    
    function start() {
        var grd = ctx.createRadialGradient(hx+10, hy+10, 0, hx+10, hy+10, 20);
        grd.addColorStop(0,"green");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(hx,hy,bl,bl);
    }
    function refresh() {
        hx+=xd;
        hy+=yd;

        if (hx === 420) {
            hx = 0;
        }else if (hx === -20) {
            hx = 400;
        }
        if (hy === 420) {
            hy = 0;
        }else if (hy === -20) {
            hy = 400;
        }
        if (hx===fx && hy===fy) {
            body++;
            fx = (Math.floor(Math.random() * 21)) * 20;
            fy = (Math.floor(Math.random() * 21)) * 20;    
        };
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(0,0,420,420);

        for(var i=0; i < trail.length; i++) {
            var grd = ctx.createRadialGradient(trail[i].x + 10,trail[i].y + 10, 0, trail[i].x + 10,trail[i].y + 10, 20);
            grd.addColorStop(0,"green");
            grd.addColorStop(1,"black");
            ctx.fillStyle = grd;
            ctx.fillRect(trail[i].x,trail[i].y,bl,bl);
            if (trail[i].x === hx && trail[i].y === hy) {
                body = 3;
            }
        }
        trail.push({x:hx , y:hy});
        while (trail.length > body) {
            trail.shift()
        }
        var grd = ctx.createRadialGradient(hx+10, hy+10, 0, hx+10, hy+10, 20);
        grd.addColorStop(0,"green");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(hx,hy,bl,bl); 

        var grd = ctx.createRadialGradient(fx+10, fy+10, 0, fx+10, fy+10, 20);
        grd.addColorStop(0,"red");
        grd.addColorStop(1,"black");
        ctx.fillStyle = grd;
        ctx.fillRect(fx,fy,bl,bl); 

        $("#score").html(body - 3);
    }
    function newDir(event) {
        switch(event.keyCode) {
            case 37:
                if (lastDir == 39) {
                    console.log("repeat")
                }else {
                    lastDir = 37;
                    xd = -1*20;
                    yd = 0;
                }
            break;
            case 38:
            if (lastDir == 40) {
                console.log("repeat")
            }else {
                lastDir = 38;
                xd = 0;
                yd = -1*20;
            }
            break;
            case 39:
            if (lastDir == 37) {
                console.log("repeat")
            }else {
                lastDir = 39;
                xd = 1*20;
                yd = 0;
            }
            break;        
            case 40:
                if (lastDir == 38) {
                    console.log("repeat")
                }else {
                    lastDir = 40;
                    xd = 0;
                    yd = 1*20;
                }
            break;            
        }
    }
    start();


});