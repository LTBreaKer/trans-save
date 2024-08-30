
import { socket } from './game.js';
import {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform} from './image_src.js';

const canvas = document.querySelector('canvas');
console.log(canvas);

const c = canvas.getContext("2d");
canvas.width = 0;

function load_draw(image, x, y, width, height)
{
    if (image.complete)
        c.drawImage(image, x, y, width, height);
    else 
        image.onload = () => c.drawImage(image, x, y, width, height);
}

class Player{
    constructor({imgR, imgL, imgIR, imgIL}) {
        this.imageR = imgR
        this.imageL = imgL
        this.imageIdlR = imgIR
        this.imageIdlL = imgIL

        this.image = new Image()
        this.image = this.imageIdlR[2]

        this.tagger = true
        
        this.width = 40
        this.height = 40

        this.position= {
            x: 0,
            y: 0,
        }

        this.keyStatus={
            rightPressed: false,
            leftPressed: false,
            upPressed: true,
            upreleased: true,
        }

    }

    draw() {
        load_draw(this.image, this.position.x ,this.position.y, this.width, this.height)
    }
}

class Platform{

    width = 0
    height = 20

    position= {
        x: 0,
        y: 0,
    }

    draw() {
        c.save()

        c.shadowColor = 'rgba(32, 174, 221, 0.8)'; 
        c.shadowBlur = 30;                    // Blur radius for the shadow
        c.shadowOffsetX = 2;                 // Horizontal shadow offset
        c.shadowOffsetY = 2;                 // Vertical shadow offset
        load_draw(platform, this.position.x ,this.position.y, this.width, this.height)
        c.restore()
    }
}

function draw_arrow(player)
{
    c.drawImage(arrow, player.position.x + player.width/4, player.position.y - player.height, player.width/2, player.height/2)
}

function draw_go(player)
{
    c.drawImage(go_arrow, player.position.x, player.position.y - player.height, player.width, player.height)
}

function draw_timer(time, player)
{
    let dec = Math.floor(time/10)
    let uni = time%10
    load_draw(numbers[dec], canvas.width/2, player.height, player.width, player.height)
    load_draw(numbers[uni], canvas.width/2 + player.width, player.height, player.width, player.height)
}

async function rain()
{
    let raindrops = [];
    let count = 60;

    for (let i = 0; i < count; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speedX: -20, // Horizontal wind effect
            length: Math.random() * 20 + 30
        });
    }

    raindrops.forEach(raindrop => {
        // Create a gradient for the raindrop
        let grd = c.createLinearGradient(raindrop.x, raindrop.y, raindrop.x + raindrop.speedX, raindrop.y + raindrop.length);
        grd.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        grd.addColorStop(1, "rgba(255, 255, 255, 0)");

        c.strokeStyle = grd;
        c.lineWidth = 3.5;

        c.beginPath();
        c.moveTo(raindrop.x, raindrop.y);
        c.lineTo(raindrop.x + raindrop.speedX, raindrop.y + raindrop.length);
        c.stroke();
    });
}

const platforms = Array.from({ length: 12 }, () => new Platform())
const players = [new Player({imgR:imageR1, imgL:imageL1, imgIR:imageIR1, imgIL:imageIL1}), new Player({imgR:imageR2, imgL:imageL2, imgIR:imageIR2, imgIL:imageIL2})]
let GO = false
let time = 1
let winner
let esc = false

function start_game()
{

    resizeWindow()
    animation()

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function blink()
    {
        let i = 0
        for (; i < 3; i++)
        {
            players.forEach(player=>{

                if (player.imageIdlR.includes(player.image))
                    player.image = player.imageIdlR[i]
                else 
                    player.image = player.imageIdlL[i]

                c.clearRect(0, 0, canvas.width, canvas.height)
                player.draw()
            })
            await delay(100)
        }
    }

    setInterval(blink, 2000)

    function animation()
    {
        if (socket.readyState === WebSocket.OPEN)
        {    
            socket.send(JSON.stringify({
                'action': 'key update',
                'P0_rightPressed': players[0].keyStatus.rightPressed,
                'P1_rightPressed': players[1].keyStatus.rightPressed,

                'P0_leftPressed': players[0].keyStatus.leftPressed,
                'P1_leftPressed': players[1].keyStatus.leftPressed,

                'P0_upPressed': players[0].keyStatus.upPressed,
                'P1_upPressed': players[1].keyStatus.upPressed,

                'P0_upreleased': players[0].keyStatus.upreleased,
                'P1_upreleased': players[1].keyStatus.upreleased,
                'esc': esc
            }))
        }

        window.requestAnimationFrame(animation)
        c.clearRect(0, 0, canvas.width, canvas.height)
        load_draw(background, 0, 0, canvas.width, canvas.height)
        

        left_right()
    
        platforms.forEach(platform =>{
            platform.draw()
        })
        players.forEach(player=>{
            player.draw()
            if (player.tagger)
            {
                if (!GO)
                    load_draw(go_arrow, player.position.x, player.position.y - player.height, player.width, player.height)
                else
                    load_draw(arrow, player.position.x + player.width/4, player.position.y - player.height, player.width/2, player.height/2)
            }
        })
        rain();

        draw_timer(time, players[0])
        if (time === 0)
        {
            document.getElementById('overlay').style.visibility = 'visible'
            const overlay = document.querySelector('.overlay-text')
            overlay.textContent = winner + ' 𝙬𝙞𝙣𝙨'
            socket.close()
        }
    }
    
    function left_right()
    {
        if (esc)
            return
        players.forEach(player=>{
        if (player.keyStatus.rightPressed)
            player.image = player.imageR

        else if (player.keyStatus.leftPressed)
            player.image = player.imageL
        })
    }

    socket.addEventListener('message', function(event) {

        let socket_data = JSON.parse(event.data)
    
        if (socket_data.action === "game update")
        {
            canvas.height = socket_data.canvas_height
            canvas.width = socket_data.canvas_width
            
            let platformWidths = socket_data.platform_widths
            let platformHeights = socket_data.platform_heights
            let platformXs = socket_data.platform_xs
            let platformYs = socket_data.platform_ys

            for (let i = 0; i < platformWidths.length; i++)
            {
                platforms[i].width = platformWidths[i]
                platforms[i].height = platformHeights[i]
                platforms[i].position.x = platformXs[i]
                platforms[i].position.y = platformYs[i]
            }
        }

        if (socket_data.action === "update player")
        {
            players[0].position.x = socket_data.player0_x
            players[0].position.y = socket_data.player0_y
            players[0].keyStatus.upPressed = socket_data.upPressed0

            players[1].position.x = socket_data.player1_x
            players[1].position.y = socket_data.player1_y
            players[1].keyStatus.upPressed = socket_data.upPressed1

            players[0].width = socket_data.player_width
            players[1].width = socket_data.player_width

            players[0].height = socket_data.player_height
            players[1].height = socket_data.player_height

            players[0].tagger = socket_data.player0_Tagger
            players[1].tagger = socket_data.player1_Tagger
            GO = socket_data.GO
            time = socket_data.time
            winner = socket_data.winner
        }
    
    })

    window.addEventListener("resize", resizeWindow)
    function resizeWindow()
    {
        if (socket.readyState === WebSocket.OPEN)
        {
            socket.send(JSON.stringify({
                'action': 'window resize',
                'window_innerHeight': window.innerHeight,
                'window_innerWidth': window.innerWidth,
            }))
        }
    }
    
    function pause_game()
    {
        if (!esc)
        {
            document.getElementById('overlay').style.visibility = 'visible';
            esc = true
            return
        }

        if (esc && socket.readyState === WebSocket.OPEN)
        {
            esc = false
            document.getElementById('overlay').style.visibility = 'hidden';
        }
    }

    window.addEventListener("keydown", (event)=> {
        if (time == 0)
        {
            players.forEach((player)=>{
                player.keyStatus.leftPressed = false
                player.keyStatus.rightPressed = false
                player.keyStatus.upPressed = false
                player.keyStatus.upreleased = true
            })
            return
        }

        const key = event.code
        if (key === "Escape")
        {
            pause_game()
            return
        }

        if (esc)  
            return
        switch(key)
        {
            case "KeyA":
            {
                players[0].keyStatus.leftPressed = true
                break
            }
            case "KeyD":
            {
                players[0].keyStatus.rightPressed = true
                break
            }
            case "KeyW":
            {
                players[0].keyStatus.upreleased = false
                break
            }

            case "ArrowLeft":
            {
                players[1].keyStatus.leftPressed = true
                break
            }
            case "ArrowRight":
            {
                players[1].keyStatus.rightPressed = true
                break
            }
            case "ArrowUp":
            {
                players[1].keyStatus.upreleased = false
                break
            }
        }
    })
    
    window.addEventListener("keyup", (event)=> {
        if (time == 0 || esc)
        {
            players.forEach((player)=>{
                player.keyStatus.leftPressed = false
                player.keyStatus.rightPressed = false
                player.keyStatus.upPressed = false
                player.keyStatus.upreleased = true
            })
            return
        }
        const key = event.code
        switch(key)
        {
            case "KeyA":
            {
                players[0].image = players[0].imageIdlL[2]
                players[0].keyStatus.leftPressed = false
                break
            }
            case "KeyD":
            {
                players[0].keyStatus.rightPressed = false
                players[0].image = players[0].imageIdlR[2]
                break
            }
            case "KeyW" :
            {
                players[0].keyStatus.upreleased = true
                break
            }

            case "ArrowLeft":
            {
                players[1].image = players[1].imageIdlL[2]
                players[1].keyStatus.leftPressed = false
                break
            }
            case "ArrowRight":
            {
                players[1].keyStatus.rightPressed = false
                players[1].image = players[1].imageIdlR[2]
                break
            }
            case "ArrowUp" :
            {
                players[1].keyStatus.upreleased = true
                break
            }
        }
    })
    
    let button = document.querySelector('.overlay-button')

    button.addEventListener("click", ()=>{
        socket.close()
    })

    window.addEventListener("blur", ()=>{
    
        players.forEach(player=>{
            if (player.keyStatus.leftPressed)
                {
                    player.keyStatus.leftPressed = false
                    player.image = player.imageIdlL[2]
                }
            
                if (player.keyStatus.rightPressed)
                {
                    player.keyStatus.rightPressed = false
                    player.image = player.imageIdlR[2]
                }
            
                if (!player.keyStatus.upreleased)
                    player.keyStatus.upreleased = true
        })
    })
}

export {start_game}
// export {players, time, esc, socket}