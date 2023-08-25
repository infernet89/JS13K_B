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
var trail=[];

//TODO DEBUG
level=3;
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
    drawable=[];
    if(level==0)
    {
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
        drawable.push(tmp);
        canvas.style.cursor="default";

        mainPg=new Object();
        mainPg.type="ship";
        mainPg.size=20;
        mainPg.angle=90;
        mainPg.x=-20;
        mainPg.y=-20;
        drawable.push(mainPg);

        trail=[];
        trail.type="trail";
        drawable.push(trail);
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
        3 - Tron (survivor.io)
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
    else if(obj.type=="trail")
    {
        ctx.beginPath();
        ctx.fillStyle=bg;
        obj.forEach((e) => ctx.lineTo(e.x,e.y));
        ctx.stroke();
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
//main loop that draw the screen
function run()
{
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,canvasW,canvasH);
    //border
    ctx.fillStyle=fg;
    ctx.fillRect(0,0,canvasW,1);
    ctx.fillRect(0,canvasH-1,canvasW,1);
    ctx.fillRect(0,0,1,canvasH);
    ctx.fillRect(canvasW-1,0,1,canvasH);
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
        const speed=5;
        mainPg.angle=(Math.atan2(mainPg.y - mousey, mainPg.x - mousex) * (180 / Math.PI) + 360 - 90) % 360; //thanks, chatGPT.
        if(Math.abs(mainPg.x-mousex)<=speed)
            mainPg.dx=0;
        else if(mainPg.x<mousex)
            mainPg.dx=speed;
        else if(mainPg.x>mousex)
            mainPg.dx=-speed;
        if(Math.abs(mainPg.y-mousey)<=speed)
            mainPg.dy=0;
        else if(mainPg.y<mousey)
            mainPg.dy=speed;
        else if(mainPg.y>mousey)
            mainPg.dy=-speed;
        //and marks his trail
        if(distanceFrom(canvasW/2,canvasH/2,mainPg.x,mainPg.y)<canvasH/2)//inside circle
        {
            tmp=new Object();
            tmp.x=mainPg.x;
            tmp.y=mainPg.y;
            trail.push(tmp);
        }
        else
        {//outside circle
            trail.length=0;
        }
    }

    drawable.forEach(el => { draw(el); move(el); } );
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