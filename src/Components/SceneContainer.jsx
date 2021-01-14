import React from 'react';
import {  Vector3, HemisphericLight, FreeCamera, KeyboardEventTypes } from '@babylonjs/core';
import SceneComponent from './ScenePresent'
import createDefaultGUIText from '../helpFunctions/createDefaultGUIText'
import getRandomPositions from '../helpFunctions/getRandowPositions'
import loadMesh from '../helpFunctions/loadMesh'
//Все меши
let apple = null, basket = null, bomb = null, BombOrAppleMesh = null
//Заработанные очки за ловлю мешей, текст для GUI, триггер начала игры
let gameStart = false
let textblock = null
let mainPoints = 0
// Рандомные позиции для яблок и бомб
let randomPositions = getRandomPositions()
let counterOfPositions = 0

const onSceneReady = async (scene, engine) => {
  engine.displayLoadingUI()
  let camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene)
  camera.setTarget(Vector3.Zero())
  
  let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
  light.intensity = 0.7
//Импорт мешей
  apple = await loadMesh('','Apple.babylon', 0, 5, -5)
    BombOrAppleMesh = apple
  basket = await loadMesh('mesh_mm1','basket.babylon', 0, 0, -5)  
  bomb = await loadMesh('', 'grenade.babylon', 0, 5, -5)
//Создаем текст
  textblock = createDefaultGUIText()
//Обрабатываем нажатия стрелок и пробела
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN:{
                if(kbInfo.event.keyCode === 39) basket.position.x = 2
                else if(kbInfo.event.keyCode === 37) basket.position.x = -2
                else if(kbInfo.event.keyCode === 32) gameStart = true
                break
            }
            case KeyboardEventTypes.KEYUP:{
                basket.position.x = 0
                break
            }
            default:
              break
        }
    })
    engine.hideLoadingUI()
}

let counter = false
let counterForBomb = false
// Основная логика игры, буду рефакторить
const onRender = scene => {
    let deltaTimeInMillis = scene.getEngine().getDeltaTime();
    const rpm = 50

    if(gameStart){
        // Здесь задается рандомная позиция для фрукта
        BombOrAppleMesh.position.x = randomPositions[counterOfPositions].position
        BombOrAppleMesh.position.y -= ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000))
        // Если фрукт прошел вниз по оси y меньше 3, тогда в зависимости от наличия бомбы в текущей итерации, превращает фрукт в бомбу
        if(!counterForBomb && BombOrAppleMesh.position.y <= 3){
            if(randomPositions[counterOfPositions].bomb){
                bomb.position = new Vector3(BombOrAppleMesh.position.x, BombOrAppleMesh.position.y, BombOrAppleMesh.position.z)
                BombOrAppleMesh = bomb
                apple.position = new Vector3(0, 5, -5)
                counterForBomb = true
            }else{
                bomb.position = new Vector3(0,5,-5)
                counterForBomb = true
            }
        }
        //Если фрукт прошел вниз по оси y меньше 0, начинается логика ловли фрукта и бомбы
        if(!counter && BombOrAppleMesh.position.y <= 0){
            if(basket.position.x === randomPositions[counterOfPositions].position && !randomPositions[counterOfPositions].bomb){
                textblock.text = "Good"
                counter = true
                mainPoints++
            }else if (basket.position.x !== randomPositions[counterOfPositions].position && randomPositions[counterOfPositions].bomb){
                textblock.text = "Wow, very good!"
                counter = true
                mainPoints++
            }else{
                textblock.text = "Bad"
                counter = true
                mainPoints--
            }
        }
        // Конец каждого падения фрукта. В конце все превращается во фрукт
        if(BombOrAppleMesh.position.y <=-0.5) {
            bomb.position = new Vector3(0, 5, -5)
            BombOrAppleMesh = apple 
            BombOrAppleMesh.position = new Vector3(0, 5, -5)
            counterOfPositions++
            if(counterOfPositions == 20) {
                gameStart = false
                textblock.text = `You scored ${mainPoints} points`
            }
            counter = false
            counterForBomb = false
        }
    }
    if(!gameStart && apple){
        BombOrAppleMesh.position = new Vector3(0, 5, -5)
        counterOfPositions = 0
    }

}
export default () => (
    <div>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
    </div>
)