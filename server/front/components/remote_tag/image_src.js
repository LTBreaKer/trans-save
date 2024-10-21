const imageR1 = new Image()
const imageL1 = new Image()
const imageR2 = new Image()
const imageL2 = new Image()
const background = new Image()
const platform = new Image()

background.src = "assets/back.jpg"
platform.src = "assets/platform.png"
const imageIR1 = []
const imageIL1 = []

const imageIR2 = []
const imageIL2 = []

const arrow = new Image()
arrow.src = "assets/tagger.png"
const go_arrow = new Image()
go_arrow.src = "assets/GO.png"

imageR1.src = "assets/red_box_right.png"
imageL1.src = "assets/red_box_left.png"
imageIL1.src = "assets/red_box_IdleL.png"

imageR2.src = "assets/blue_box_right.png"
imageL2.src = "assets/blue_box_left.png"
imageIL2.src = "assets/blue_box_IdleL.png"

let pathR = ["assets/red_box_IdleR1.png", "assets/red_box_IdleR2.png", "assets/red_box_IdleR.png"]
let pathL = ["assets/red_box_IdleL1.png", "assets/red_box_IdleL2.png", "assets/red_box_IdleL.png"]

let pathR2 = ["assets/blue_box_IdleR1.png", "assets/blue_box_IdleR2.png", "assets/blue_box_IdleR.png"]
let pathL2 = ["assets/blue_box_IdleL1.png", "assets/blue_box_IdleL2.png", "assets/blue_box_IdleL.png"]

for (let i = 0; i < 3; i++)
{
    imageIR1[i] = new Image()
    imageIR1[i].src = pathR[i]

    imageIL1[i] = new Image()
    imageIL1[i].src = pathL[i]

    imageIR2[i] = new Image()
    imageIR2[i].src = pathR2[i]
    
    imageIL2[i] = new Image()
    imageIL2[i].src = pathL2[i]
}

const numbers = []
let pathN = ["assets/num0.png", "assets/num1.png", "assets/num2.png", "assets/num3.png", "assets/num4.png", "assets/num5.png", "assets/num6.png", "assets/num7.png", "assets/num8.png", "assets/num9.png"]

for (let i = 0; i < 10; i++)
{
    numbers[i] = new Image()
    numbers[i].src = pathN[i]
}

export {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform}