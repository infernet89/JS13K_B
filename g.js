// < >
//constant
const fg="#ed419a"; //it stands for foreground color
const bg="#070707"; //it stands for background color
//global variables
var canvas;
var canvasW;
var canvasH;
var ctx;
var dragging=false;
var mousex=-100;
var mousey=-100;
var oldmousex,oldmousey;
var level=0;
var drawable=[];
var cooldown=0;
var mainPg;
var cooldown=0;
var cooldownTreshold=30;
var snakeGrow=0;
var tail;

//TODO DEBUG
level=4;
//TODO DEBUG

//setup
canvas = document.getElementById("g");
ctx = canvas.getContext("2d");
canvasW=canvas.width  = 1280;//window.innerWidth;
canvasH=canvas.height = 800;//window.innerHeight;

//controls
canvas.addEventListener("mousemove",mossoMouse);
canvas.addEventListener("mousedown",cliccatoMouse);
canvas.addEventListener("mouseup",rilasciatoMouse);

setup();
setInterval(run, 33);

//setup all the objects
function setup()
{
    if(level==0)
    {
        drawable=[];
        var tmp=new Object();
        tmp.type="circle";
        tmp.x=canvasW/2;
        tmp.y=canvasH/3*2;
        tmp.radius=30;
        tmp.clickable=true;
        tmp.click=function(e) { levelUp();};
        drawable.push(tmp);        
    }
    else if(level==2)
    {
        drawable=[];
        mainPg=new Object();
        mainPg.type="circle";
        mainPg.radius=20;
        mainPg.x=mousex;
        mainPg.y=mousey;
        for(var i=0;i<20;i++)
        {
            var tmp=new Object();
            tmp.type="circle";
            tmp.radius=10;
            regenerateBall(tmp); 
            drawable.push(tmp);
        }
        canvas.style.cursor="none";
    }
    else if(level==3)
    {
        drawable=[];
        var tmp=new Object();
        tmp.type="circle";
        tmp.radius=canvasH/2;
        tmp.x=canvasW/2;
        tmp.y=canvasH/2;
        tmp.dx=0;
        tmp.dy=0;
        tmp.damage=0;
        drawable.push(tmp);
        
        mainPg=new Object();
        mainPg.type="ship";
        mainPg.size=20;
        mainPg.angle=90;
        mainPg.x=-20;
        mainPg.y=-20;
        drawable.push(mainPg);   

        canvas.style.cursor="default";       
    }
    else if(level==4)
    {
        /*TODO DEBUG/guarda la posizione dell'ultimo circle e di mainPg, per posizione Head e Apple
        mainPg.x=mainPg.x-mainPg.x%32;
        mainPg.y=mainPg.y-mainPg.y%32;
        mainPg.angle=mainPg.angle-mainPg.angle%90;
        drawable.filter(el => el.type=="circle").forEach(ball =>
        {
            ball.x=ball.x-ball.x%32;
            if(ball.x<=0)
                ball.x=32;
            if(ball.x>=canvasW)
                ball.x=canvasW-32;
            if(ball.y<=0)
                ball.y=32;
            if(ball.y>=canvasH)
                ball.y=canvasH-32;
            ball.y=ball.y-ball.y%32;
            ball.radius=12;
            ball.dx=0;
            ball.dy=0;
        });
        */
        mainPg=new Object();//TODO DEBUG
        mainPg.type="head";
        mainPg.size=32;
        //TODO DEBUG
        mainPg.x=128*8;
        mainPg.y=128;
        mainPg.angle=270;
        drawable.push(mainPg);
        var tmp=new Object();
        tmp.type="circle";
        tmp.radius=12;
        tmp.x=32*28;
        tmp.y=32*4;
        tmp.dx=0;
        tmp.dy=0;
        drawable.push(tmp);
        //TODO DEBUG
        var dx;
        var dy;
        if(mainPg.angle==0)
        {
            dx=0;
            dy=32;
        }
        else if(mainPg.angle==90)
        {
            dx=-32;
            dy=0;
        }
        else if(mainPg.angle==180)
        {
            dx=0;
            dy=-32;
        }
        else if(mainPg.angle==270)
        {
            dx=32;
            dy=0;
        }
        tail=mainPg;
        snakeGrow=3;
        snakeGrow=20;//TODO DEBUG
        cooldownTreshold=8;
        drawable=drawable.filter(el => el.type=="circle" || el.type=="head");
    }
}
//level up!
function levelUp()
{
    dragging=false;
    level++;
    /*
        1 - clickCircle
        2 - absorbeCircles
        3 - Asteroid
        4 - Snake
        5 - arkanoid
        6 - Pong
    */
    setup();
    console.log("Level up!",level);//TODO DEBUG
}
//draw a single object
function draw(obj)
{
    ctx.save();
    if(obj.type=="circle")
    {
        ctx.fillStyle=fg;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
        ctx.fill(); 
    }
    else if(obj.type=="ship")
    {
        ctx.translate(obj.x,obj.y);
        ctx.rotate((obj.angle* Math.PI) / 180);
        for(i=0;i<obj.size;i++)
        {
            if(i%2)
                ctx.fillStyle=fg;
            else
                ctx.fillStyle=bg;
            ctx.fillRect(-i/2,i,3,3);
            ctx.fillRect(+i/2,i,3,3);
        }
    }
    else if(obj.type=="projectile")
    {
        ctx.translate(obj.x,obj.y);
        ctx.rotate((obj.angle* Math.PI) / 180);
        ctx.fillStyle=fg;
        for(i=0;i<obj.size;i++)
        {
            ctx.fillRect(-i*2,0,2,1);
        }
    }
    else if(obj.type=="head")
    {
        ctx.translate(obj.x,obj.y);
        ctx.rotate((obj.angle* Math.PI) / 180);
        ctx.translate(-obj.size/2,-obj.size/2);
        ctx.translate(obj.size/2-2,0);
        ctx.fillStyle=bg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(obj.size/2, obj.size);
        ctx.lineTo(-obj.size/2, obj.size);
        ctx.fill();
        for(i=0;i<obj.size;i++)
        {
            if(i%2)
                ctx.fillStyle=fg;
            else
                ctx.fillStyle=bg;
            ctx.fillRect(-i/2,i,3,3);
            ctx.fillRect(+i/2,i,3,3);
        }
        //eyes
        ctx.fillStyle=fg;
        ctx.beginPath();
        ctx.arc(-3, 25, 2, 0, 2 * Math.PI);
        ctx.arc(5, 25, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle=bg; 
        ctx.beginPath();
        ctx.arc(-3, 25, 1, 0, 2 * Math.PI);
        ctx.arc(5, 25, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle="#F00";
    }
    else if(obj.type=="body")
    {
        ctx.translate(obj.x,obj.y);
        ctx.rotate((obj.angle* Math.PI) / 180);
        ctx.translate(-obj.size/2,-obj.size/2);
        ctx.fillStyle=fg;
        ctx.fillRect(0,0,32,32);
        ctx.fillStyle=bg;
        ctx.fillRect(2,5,20,5);
        ctx.fillRect(10,20,20,5);
    }
    ctx.restore();
}
function move(obj)
{
    if(obj.dx==null || obj.dy==null) return;
    obj.x+=obj.dx;
    obj.y+=obj.dy;
    if(level==2)
    {
        //we absorbe the ball
        if(distanceFrom(mainPg.x,mainPg.y,obj.x,obj.y) < obj.radius+mainPg.radius)
        {
            mainPg.radius+=2;
            obj.x=-999;
        }
        //we regenerate the one offscreen
        if(obj.x < -200 || obj.x > canvasW+200 || obj.y < -200 || obj.y > canvasH+200)
        {
            regenerateBall(obj);              
        }
        //ending conditions
        if(mainPg.radius>=canvasH/2)
        {
            mainPg.radius=canvasH/2;
            if(mainPg.x>canvasW/2-10 && mainPg.x<canvasW/2+10)
                levelUp();
        }
    }
}
//main loop that draw the screen and perform the game logic
function run()
{
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,canvasW,canvasH);
    if(level==0)
    {
        ctx.fillStyle=fg;
        ctx.font = "300px Brush Script MT";
        ctx.textAlign="center";
        ctx.fillText("B",canvasW/2,canvasH/3);
        canvas.style.cursor="default";
    }
    else if(level==1)
    {
        cooldown--;
        if(cooldown<0)
        {
            drawable=[];
            cooldown=100;
        }
        else if(cooldown==30)
        {
            var tmp=new Object();
            tmp.type="circle";
            tmp.x=rand(20,canvasW-20);
            tmp.y=rand(20,canvasH-20);
            tmp.radius=20;
            tmp.clickable=true;
            tmp.click=function(e) { levelUp();};
            drawable.push(tmp);
        }
        canvas.style.cursor="default";
    }
    else if(level==2)
    {
        mainPg.x=mousex;
        if(mainPg.x-mainPg.radius<0)
        {
            mainPg.x=mainPg.radius;
        }
        else if(mainPg.x+mainPg.radius>canvasW)
        {
            mainPg.x=canvasW-mainPg.radius;
        }
        mainPg.y=mousey;
        if(mainPg.y-mainPg.radius<0)
        {
            mainPg.y=mainPg.radius;
        }
        else if(mainPg.y+mainPg.radius>canvasH)
        {
            mainPg.y=canvasH-mainPg.radius;
        }
        draw(mainPg);
    }
    else if(level==3)
    {
        //make the main pg follow the mouse
        const speed=4;
        const bulletSpeed=15;
        const dx=mousex - mainPg.x;
        const dy=mousey - mainPg.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        mainPg.angle=(Math.atan2(mainPg.y - mousey, mainPg.x - mousex) * (180 / Math.PI) + 360 - 90) % 360; //thanks, chatGPT.
        if(dragging || length<5)
        {
            mainPg.dx=0;
            mainPg.dy=0;
        }
        else
        {
            mainPg.dx=dx/length*speed;
            mainPg.dy=dy/length*speed;
        }

        //shoot a projectile
        if(cooldown--<0)
        {
            var tmp=new Object();
            tmp.type="projectile";
            tmp.x=mainPg.x;
            tmp.y=mainPg.y;
            tmp.size=10;
            tmp.angle=(mainPg.angle+270)%360;
            tmp.dx=dx/length*bulletSpeed;
            tmp.dy=dy/length*bulletSpeed;
            drawable.push(tmp);

            cooldown=cooldownTreshold;
        }
        //rimuove da drawable ciò che non è più applicabile
        var liveBalls=0;
        for (var i = drawable.length - 1; i >= 0; i--)
        {
            if( (drawable[i].type == "projectile") &&
            (drawable[i].x<0 || drawable[i].y<0 || drawable[i].x> canvasW || drawable[i].y>canvasH) )
                drawable.splice(i, 1);
            else if(drawable[i].type == "circle" && drawable[i].radius<20)
                drawable.splice(i, 1);
            else if(drawable[i].type == "circle" && drawable[i].radius>24)
            {
                liveBalls++;
            }
        }
        //controlla le collisioni tra palle e tutto il resto 
        drawable.filter(el => el.type=="circle").forEach(ball => 
        { 
            //colpito da proiettile
            drawable.filter(el => el.type=="projectile").forEach(el =>
            {
                if(distanceFrom(el.x,el.y,ball.x,ball.y)<ball.radius+el.size)
                {
                    el.x=-100;
                    cooldown=5;
                    ball.dx+=el.dx/ball.radius*10;
                    ball.dy+=el.dy/ball.radius*10;
                    ball.radius-=8;
                    //split the ball after 10 hit
                    if(ball.damage++>8)
                    {                        
                        cooldownTreshold-=3;
                        var tmp=new Object();
                        tmp.type="circle";
                        tmp.radius=ball.radius/2;
                        tmp.x=ball.x+tmp.radius;
                        tmp.y=ball.y-tmp.radius;
                        tmp.dx=ball.dx;
                        tmp.dy=ball.dy;
                        tmp.damage=0;
                        drawable.push(tmp);
                        var tmp=new Object();
                        tmp.type="circle";
                        tmp.radius=ball.radius/2;
                        tmp.x=ball.x+tmp.radius;
                        tmp.y=ball.y+tmp.radius;
                        tmp.dx=ball.dx;
                        tmp.dy=ball.dy;
                        tmp.damage=0;
                        drawable.push(tmp);
                        var tmp=new Object();
                        tmp.type="circle";
                        tmp.radius=ball.radius/2;
                        tmp.x=ball.x-tmp.radius;
                        tmp.y=ball.y+tmp.radius;
                        tmp.dx=ball.dx;
                        tmp.dy=ball.dy;
                        tmp.damage=0;
                        drawable.push(tmp);
                        
                        ball.radius=ball.radius/2;
                        ball.x-=ball.radius;
                        ball.y-=ball.radius;
                        ball.damage=0;
                    }
                    
                }
            } );
            //bounce from other balls
            drawable.filter(el => el.type=="circle" && el!=ball).forEach(b2 => 
            {
                if(distanceFrom(ball.x,ball.y,b2.x,b2.y)<=ball.radius+b2.radius)
                {
                    var tmp=ball.dx;
                    ball.dx=b2.dx/ball.radius*b2.radius;
                    b2.dx=tmp/b2.radius*ball.radius;

                    tmp=ball.dy;
                    ball.dy=b2.dy/ball.radius*b2.radius;
                    b2.dy=tmp/b2.radius*ball.radius;
                    //se sono già compenetranti, le separo a forza
                    while(distanceFrom(ball.x+ball.dx,ball.y+ball.dy,b2.x+b2.dx,b2.y+b2.dy)<ball.radius+b2.radius)
                    {
                        if(ball.x<b2.x)
                        {
                            ball.dx--;
                            b2.dx++;
                        }
                        else
                        {
                            ball.dx++;
                            b2.dx--;
                        }
                        if(ball.y<b2.y)
                        {
                            ball.dy--;
                            b2.dy++;
                        }
                        else
                        {
                            ball.dy++;
                            b2.dy--;
                        }
                    }
                }
            });
            //bounce from borders
            if(ball.x<=ball.radius && ball.dx<0)
                ball.dx*=-1;
            if(ball.y<=ball.radius && ball.dy<0)
                ball.dy*=-1;
            if(ball.x>=canvasW-ball.radius && ball.dx>0)
                ball.dx*=-1;
            if(ball.y>=canvasH-ball.radius && ball.dy>0)
                ball.dy*=-1;
            //force exit from borders
            if(ball.x+ball.dx<ball.radius)
                ball.dx++;
            if(ball.y+ball.dy<ball.radius)
                ball.dy++;
            if(ball.x+ball.dx>canvasW-ball.radius)
                ball.dx--;
            if(ball.y+ball.dy>canvasH-ball.radius)
                ball.dy--;
            //la palla si muove con un po' di attrito.
            if(Math.abs(ball.dx*=0.97)<0.1 || Math.abs(ball.dx)>30)
                ball.dx=0;
            if(Math.abs(ball.dy*=0.97)<0.1 || Math.abs(ball.dy)>30)
                ball.dy=0;
        } );
        if(liveBalls==0)
            levelUp();
    }
    else if(level==4)
    {
        if(!dragging && --cooldown<0)
        {
            //turn head
            var dx=mainPg.x-mousex;
            var dy=mainPg.y-mousey;
            //forbidden directions
            if(mainPg.angle==0 && dy<0)
                dy=0;
            if(mainPg.angle==90 && dx>0)
                dx=0;
            if(mainPg.angle==180 && dy>0)
                dy=0;
            if(mainPg.angle==270 && dx<0)
                dx=0;
            //top
            if(Math.abs(dy)>Math.abs(dx) && dy>32 && mainPg.angle!=180)
                mainPg.angle=0;
            //left
            else if(Math.abs(dy)<Math.abs(dx) && dx>32 && mainPg.angle!=90)
                mainPg.angle=270;
            //bottom
            else if(Math.abs(dy)>Math.abs(dx) && dy<-32 && mainPg.angle!=0)
                mainPg.angle=180;
            //right
            else if(Math.abs(dy)<Math.abs(dx) && dx<-32 && mainPg.angle!=270)
                mainPg.angle=90;

            //move
            drawable.filter(el => el.type=="head" || el.type=="body").forEach(el => {
                if(el.angle==0)
                {
                    el.dx=0;
                    el.dy=-32;
                }
                else if(el.angle==90)
                {
                    el.dx=32;
                    el.dy=0;
                }
                else if(el.angle==180)
                {
                    el.dx=0;
                    el.dy=32;
                }
                else if(el.angle==270)
                {
                    el.dx=-32;
                    el.dy=0;
                }
                //warp
                if(el.angle==0 && el.y<32)
                    el.y=canvasH;
                else if(el.angle==90 && el.x>canvasW-32)
                    el.x=0;
                else if(el.angle==180 && el.y>canvasH-32)
                    el.y=0;
                else if(el.angle==270 && el.x<32)
                    el.x=canvasW;
            });
            //grow
            if(snakeGrow-- > 0)
            {
                var tmp=new Object();
                tmp.type="body";
                tmp.size=32;
                tmp.x=tail.x;
                tmp.y=tail.y;
                tmp.angle=tail.angle;
                tmp.prev=tail;
                tail.next=tmp;
                drawable.push(tmp);
                tail=tmp;
            }
            else snakeGrow=0;
            //follow
            tmp=tail;
            while(tmp.prev!=null)
            {
                tmp.angle=tmp.prev.angle;
                tmp=tmp.prev;

            }
            //eat
            for (var i = drawable.length - 1; i >= 0; i--)
            {
                if(drawable[i].type == "circle" && distanceFrom(mainPg.x,mainPg.y,drawable[i].x,drawable[i].y)<16)
                {
                    snakeGrow+=3;
                    drawable.splice(i, 1);
                }
                //TODO eat a piece of himself
                /*if(drawable[i].type == "body" && distanceFrom(mainPg.x,mainPg.y,drawable[i].x+drawable[i].dx,drawable[i].y+drawable[i].dy)<16 && drawable[i].prev!=mainPg)
                {
                    console.log("EAT HIMSELF");//TODO DEBUG
                    //drawable[i].next.prev=drawable[i].prev;
                    drawable.splice(i, 1);
                }*/
            }                
            cooldown=cooldownTreshold;
        }
        else
        {
            var nEggs=0;
            drawable.filter(el => el.type=="head" || el.type=="body" || el.type=="circle").forEach(el => {
                el.dx=0;
                el.dy=0;
                if(el.type=="circle")
                {
                    nEggs++;
                    //vibration
                    el.x=Math.round(el.x/32)*32+rand(-0.1,0.1);
                    el.y=Math.round(el.y/32)*32+rand(-0.1,0.1);
                }
                //warp
                if(el.y<32)
                {
                    var tmp=new Object();
                    tmp.type=el.type;
                    tmp.size=el.size;
                    tmp.angle=el.angle;
                    tmp.x=el.x;
                    tmp.y=canvasH;
                    draw(tmp);
                }
                if(el.x>canvasW-32)
                {
                    var tmp=new Object();
                    tmp.type=el.type;
                    tmp.size=el.size;
                    tmp.angle=el.angle;
                    tmp.x=0;
                    tmp.y=el.y;
                    draw(tmp);
                }
                if(el.y>canvasH-32)
                {
                    var tmp=new Object();
                    tmp.type=el.type;
                    tmp.size=el.size;
                    tmp.angle=el.angle;
                    tmp.x=el.x;
                    tmp.y=0;
                    draw(tmp);
                }
                if(el.x<32)
                {
                    var tmp=new Object();
                    tmp.type=el.type;
                    tmp.size=el.size;
                    tmp.angle=el.angle;
                    tmp.x=canvasW;
                    tmp.y=el.y;
                    draw(tmp);
                }
            });
            //maybe spawn an egg?
            if(rand(0,1000)>970+nEggs*3)
            {
                var tmp=new Object();
                tmp.type="circle";
                tmp.radius=12;
                tmp.x=mainPg.x;
                tmp.y=mainPg.y;
                tmp.dx=0;
                tmp.dy=0;
                var isLegit=false;
                while(!isLegit)
                {
                    tmp.x=rand(1,canvasW/32-1)*32;
                    tmp.y=rand(1,canvasH/32-1)*32;
                    isLegit=true;
                    drawable.filter(el => el.type=="head" || el.type=="body" || el.type=="circle").forEach(el =>
                    {
                        if(distanceFrom(tmp.x,tmp.y,el.x,el.y)<32)
                            isLegit=false;
                    });
                }
                drawable.push(tmp);
            }
        }
    }

    //draw, move and check object collisions
    drawable.forEach(el => { move(el); draw(el); } );
    if(level==3 || level==4)
    {
        draw(mainPg);
    }
    drawable.forEach(el => { 
        el.selected=isSelected(el); 
        if(el.clickable && el.selected) 
        { 
            canvas.style.cursor="pointer"; 
            if(dragging)
            {
                el.click();
            }
        } 
    });

    //log gesture
    oldmousex=mousex;
    oldmousey=mousey;
    //border
    ctx.fillStyle=fg;
    ctx.fillRect(0,0,canvasW,1);
    ctx.fillRect(0,canvasH-1,canvasW,1);
    ctx.fillRect(0,0,1,canvasH);
    ctx.fillRect(canvasW-1,0,1,canvasH);
}
function regenerateBall(obj)
{
    obj.x=100;
    obj.y=100;
    while(obj.x > 10 && obj.x < canvasW+10 && obj.y > 10 && obj.y < canvasH+10) 
    {
        obj.x=rand(-200,canvasW+200);
        obj.y=rand(-200,canvasH+200);
    }
    while(!obj.dx || !obj.dy)
    {
        obj.dx=rand(-10,10);
        obj.dy=rand(-10,10);
    } 
}
//check if mouse is inside obj
function isSelected(obj,tx,ty)
{
    if(tx==null)
    {
        tx=mousex;
        ty=mousey;
    }
    //circle-based
    if(obj.radius>0 && distanceFrom(tx,ty,obj.x,obj.y) < obj.radius)
        return true;
    else if(obj.radius>0)
        return false;
    //rectangle-based
    if(tx < obj.x) return false;
    if(tx > obj.x + obj.width) return false;
    if(ty < obj.y) return false;
    if(ty > obj.y + obj.height) return false;
    return true;
}
/*#############
    Funzioni Utili
##############*/
function rand(da, a)
{
    if(da>a) return rand(a,da);
    a=a+1;
    return Math.floor(Math.random()*(a-da)+da);
}
function distanceFrom(ax,ay,bx,by)
{
    return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}
//uindows
function cliccatoMouse(evt)
{
    dragging=true;
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function mossoMouse(evt)
{
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function rilasciatoMouse(evt)
{
    dragging=false;    
}
window.AutoScaler = function(element, initialWidth, initialHeight, skewAllowance){
    var self = this;
    
    this.viewportWidth  = 0;
    this.viewportHeight = 0;
    
    if (typeof element === "string")
        element = document.getElementById(element);
    
    this.element = element;
    this.gameAspect = initialWidth/initialHeight;
    this.skewAllowance = skewAllowance || 0;
    
    this.checkRescale = function() {
        if (window.innerWidth == self.viewportWidth && 
            window.innerHeight == self.viewportHeight) return;
        
        var w = window.innerWidth;
        var h = window.innerHeight;
        
        var windowAspect = w/h;
        var targetW = 0;
        var targetH = 0;
        
        targetW = w;
        targetH = h;
        
        if (Math.abs(windowAspect - self.gameAspect) > self.skewAllowance) {
            if (windowAspect < self.gameAspect)
                targetH = w / self.gameAspect;
            else
                targetW = h * self.gameAspect;
        }
        
        self.element.style.width  = targetW + "px";
        self.element.style.height = targetH + "px";
    
        self.element.style.marginLeft = ((w - targetW)/2) + "px";
        self.element.style.marginTop  = ((h - targetH)/2) + "px";
    
        self.viewportWidth  = w;
        self.viewportHeight = h;
        
    }
    
    // Ensure our element is going to behave:
    self.element.style.display = 'block';
    self.element.style.margin  = '0';
    self.element.style.padding = '0';
    
    // Add event listeners and timer based rescale checks:
    window.addEventListener('resize', this.checkRescale);
    rescalercheck=setInterval(this.checkRescale, 1500);
};