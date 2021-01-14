
const getRandomPositions = ()=>{
    const arr = []
    for(let i = 0; i < 20; i++){
        const positionRandom = Math.random()
        const bombRandom = Math.random()
        const result = {}
        positionRandom > 0.5?result.position = 2:result.position = -2
        bombRandom > 0.5? result.bomb = true: result.bomb = false
        arr.push(result)
    }
    return arr
}

export default getRandomPositions
