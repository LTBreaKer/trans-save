const imageR1 = new Image()
const imageL1 = new Image()
const imageR2 = new Image()
const imageL2 = new Image()
const background = new Image()
const platform = new Image()

background.src = "components/assets/back.jpg"
platform.src = "components/assets/test.png"
const imageIR1 = []
const imageIL1 = []

const imageIR2 = []
const imageIL2 = []

const arrow = new Image()
arrow.src = "components/assets/tagger.png"
const go_arrow = new Image()
go_arrow.src = "components/assets/GO.png"

imageR1.src = "components/assets/red_box_right.png"
imageL1.src = "components/assets/red_box_left.png"
imageIL1.src = "components/assets/red_box_IdleL.png"

imageR2.src = "components/assets/blue_box_right.png"
imageL2.src = "components/assets/blue_box_left.png"
imageIL2.src = "components/assets/blue_box_IdleL.png"

let pathR = ["components/assets/red_box_IdleR1.png", "components/assets/red_box_IdleR2.png", "components/assets/red_box_IdleR.png"]
let pathL = ["components/assets/red_box_IdleL1.png", "components/assets/red_box_IdleL2.png", "components/assets/red_box_IdleL.png"]

let pathR2 = ["components/assets/blue_box_IdleR1.png", "components/assets/blue_box_IdleR2.png", "components/assets/blue_box_IdleR.png"]
let pathL2 = ["components/assets/blue_box_IdleL1.png", "components/assets/blue_box_IdleL2.png", "components/assets/blue_box_IdleL.png"]

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
let pathN = ["components/assets/num0.png", "components/assets/num1.png", "components/assets/num2.png", "components/assets/num3.png", "components/assets/num4.png", "components/assets/num5.png", "components/assets/num6.png", "components/assets/num7.png", "components/assets/num8.png", "components/assets/num9.png"]

for (let i = 0; i < 10; i++)
{
    numbers[i] = new Image()
    numbers[i].src = pathN[i]
}

export {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform}