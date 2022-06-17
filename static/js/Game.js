import * as THREE from '../libs/three.module.js'
import { OrbitControls } from '../libs/orbitControls.js'
import { net } from "./Main.js";


class Game {

    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(100, 150, 100);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xffffff);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = true;
        this.controls.maxDistance = 100;
        this.controls.maxDistance = 200;
        this.controls.update();
        // this.controls.position.set(100, 100, 100)
        this.controls.target.set(100, 50, 0)
        this.controls.maxPolarAngle = Math.PI / 2

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        this.scene = new THREE.Scene();
        const axes = new THREE.AxesHelper(1000);
        this.scene.add(axes);
        this.interval;

        this.lost = false;
        this.activeTetro = "";
        this.enemyActiveTetro = []
        this.secondTetro = "";
        this.tetroTab = [];
        this.enemyTetroTab = []
        this.tetroId;
        this.gameOn = true;
        this.enemyTetroId = 1

        this.row0 = [];
        this.row1 = [];
        this.row2 = [];
        this.row3 = [];
        this.row4 = [];
        this.row5 = [];
        this.row6 = [];
        this.row7 = [];
        this.row8 = [];
        this.row9 = [];

        this.enemyRow0 = [];
        this.enemyRow1 = [];
        this.enemyRow2 = [];
        this.enemyRow3 = [];
        this.enemyRow4 = [];
        this.enemyRow5 = [];
        this.enemyRow6 = [];
        this.enemyRow7 = [];
        this.enemyRow8 = [];
        this.enemyRow9 = [];

        this.rowCleared = []


        this.playerLogin
        this.opponentBlockUUID = ""

    }

    setPlayerLogin(login) {
        this.playerLogin = login
        net.getNewBlockId(login)
    }

    pobierzNoweId(newId) {
        this.tetroId = newId.blockId
    }

    makeOpponentMove(status) {
        const data = status.status
        const blockId = status.blockId
        // console.log(status)
        // console.log(data)
        if (blockId != undefined && data.arrayPos != undefined) {
            for (let i = 0; i < data.arrayPos.length; i++) {
                data.arrayPos[i][0] = data.arrayPos[i][0] * -1
            }


            if (data.uuid != this.opponentBlockUUID) {
                this.enemyTetroId++
                //pojawnienie i dodanie do tablicy opadnięgo klocka
                this.enemyTetroTab.push(this.enemyActiveTetro)
                for (let i = 0; i < this.enemyActiveTetro.length; i++) {
                    this.scene.add(this.enemyActiveTetro[i])
                }
                for (let n = 0; n < this.enemyActiveTetro.length; n++) {
                    console.log(this.enemyActiveTetro[n])
                    if (this.enemyActiveTetro[n].position.y == 0) {
                        this.enemyRow0.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 10) {
                        this.enemyRow1.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 20) {
                        this.enemyRow2.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 30) {
                        this.enemyRow3.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 40) {
                        this.enemyRow4.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 50) {
                        this.enemyRow5.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 60) {
                        this.enemyRow6.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 70) {
                        this.enemyRow7.push(this.enemyActiveTetro[n])
                    }
                    else if (this.enemyActiveTetro[n].position.y == 80) {
                        this.enemyRow8.push(this.enemyActiveTetro[n])
                    }
                }
                this.checkEnemyRow()
                // this.checkRow(this.enemyTetroTab, this.activeTetro)
                //tworzenie nowego klocka
                this.opponentBlockUUID = data.uuid
                const geometry = new THREE.BoxGeometry(10, 10, 10, 64);

                const material = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    wireframe: false,
                    transparent: false,
                    map: new THREE.TextureLoader().load('mats/texture.png'),
                    color: 0x000000
                });
                //kolor
                if (blockId == 1) {
                    material.color.set(0x66aadd)
                } else if (blockId == 2) {
                    material.color.set(0xF56A15)
                } else if (blockId == 3) {
                    material.color.set(0xD8F123)
                } else if (blockId == 4) {
                    material.color.set(0x20EF29)
                } else if (blockId == 5) {
                    material.color.set(0xEF20D0)
                }
                //tworzenie nowej lecącego klocka
                this.enemyActiveTetro = []
                for (let i = 0; i < data.arrayPos.length; i++) {
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(data.arrayPos[i][0], data.arrayPos[i][1], data.arrayPos[i][2])
                    this.enemyActiveTetro.push(cube)
                    this.scene.add(cube)
                }
            }
            else {
                //poruszanie klockiem
                for (let i = 0; i < data.arrayPos.length; i++) {
                    this.enemyActiveTetro[i].position.set(data.arrayPos[i][0], data.arrayPos[i][1], data.arrayPos[i][2])
                }
            }
        }
    }



    startGame = () => {
        this.init()
        this.render()
        this.createTetro(this.tetroId)
        net.getNewBlockId(this.playerLogin)
        console.log("TETROSTART => " + this.tetroId)
        this.interval = setInterval(() => this.fall(this.activeTetro), 600)
    }

    init = () => {

        const geometry = new THREE.BoxGeometry(80, 100, 80, 8, 10, 8);
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,

            wireframe: true,
            transparent: false,
            opacity: 0.3,
            color: 0x808080
        });
        const geometryRedField = new THREE.BoxGeometry(80, 1, 80)
        const materialRedField = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            color: 0xff0000,
            opacity: 0.15
        });


        const p1Playfield = new THREE.Mesh(geometry, material);
        const p2Playfield = new THREE.Mesh(geometry, material);
        const redField1 = new THREE.Mesh(geometryRedField, materialRedField);
        const redField2 = new THREE.Mesh(geometryRedField, materialRedField);

        p1Playfield.position.x = 100;
        p1Playfield.position.y = 45;
        p1Playfield.position.z = 5;
        p1Playfield.userData.name = 'Player1 playfield'

        redField1.position.x = 100;
        redField1.position.y = 85;
        redField1.position.z = 5;
        redField1.userData.name = 'Player1 redField'

        p2Playfield.position.x = -100;
        p2Playfield.position.y = 45;
        p2Playfield.position.z = 5;
        p2Playfield.userData.name = 'Player2 playfield'

        redField2.position.x = -100;
        redField2.position.y = 85;
        redField2.position.z = 5;
        redField2.userData.name = 'Player2 redField'

        this.scene.add(p1Playfield, p2Playfield, redField1, redField2)

        this.camera.lookAt(p1Playfield.position);
    }

    createTetro = tetroID => {

        let x = 95
        let y = 100
        let z = 0

        const geometry = new THREE.BoxGeometry(10, 10, 10, 64);

        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: false,
            opacity: 0.5,
            map: new THREE.TextureLoader().load('mats/texture.png'),
            color: 0x66aadd
        });

        if (tetroID == 1) {

            const obj = new THREE.Object3D()
            material.color.set(0x66aadd)

            const cube1 = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            const cube3 = new THREE.Mesh(geometry, material);
            const cube4 = new THREE.Mesh(geometry, material);

            obj.add(cube1)
            obj.add(cube2)
            obj.add(cube3)
            obj.add(cube4)

            obj.userData.state = 'move'
            obj.position.set(x, y, z)

            cube1.position.set(-10, 0, 0)
            cube2.position.set(0, 0, 0)
            cube3.position.set(10, 0, 0)
            cube4.position.set(20, 0, 0)

            this.scene.add(obj)

            this.activeTetro = obj
        }

        else if (tetroID == 2) {

            material.color.set(0xF56A15)

            const obj = new THREE.Object3D()
            const cube1 = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            const cube3 = new THREE.Mesh(geometry, material);
            const cube4 = new THREE.Mesh(geometry, material);

            obj.add(cube1)
            obj.add(cube2)
            obj.add(cube3)
            obj.add(cube4)

            obj.userData.state = 'move'
            obj.position.set(x, y, z)

            cube1.position.set(-10, 0, 0)
            cube2.position.set(0, 0, 0)
            cube3.position.set(10, 0, 0)
            cube4.position.set(10, 10, 0)

            this.scene.add(obj)

            this.activeTetro = obj
        }

        else if (tetroID == 3) {

            material.color.set(0xD8F123)

            const obj = new THREE.Object3D()
            const cube1 = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            const cube3 = new THREE.Mesh(geometry, material);
            const cube4 = new THREE.Mesh(geometry, material);
            const cube5 = new THREE.Mesh(geometry, material);
            const cube6 = new THREE.Mesh(geometry, material);
            const cube7 = new THREE.Mesh(geometry, material);
            const cube8 = new THREE.Mesh(geometry, material);
            const cube9 = new THREE.Mesh(geometry, material);

            obj.add(cube1)
            obj.add(cube2)
            obj.add(cube3)
            obj.add(cube4)
            obj.add(cube5)
            obj.add(cube6)
            obj.add(cube7)
            obj.add(cube8)
            obj.add(cube9)

            obj.userData.state = 'move'
            obj.position.set(x, y, z)

            cube1.position.set(-10, 10, 0)
            cube2.position.set(0, 10, 0)
            cube3.position.set(10, 10, 0)
            cube4.position.set(-10, 0, 0)
            cube5.position.set(0, 0, 0)
            cube6.position.set(10, 0, 0)
            cube7.position.set(-10, -10, 0)
            cube8.position.set(0, -10, 0)
            cube9.position.set(10, -10, 0)



            this.scene.add(obj)

            this.activeTetro = obj
        }

        else if (tetroID == 4) {

            material.color.set(0x20EF29)

            const obj = new THREE.Object3D()
            const cube1 = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            const cube3 = new THREE.Mesh(geometry, material);
            const cube4 = new THREE.Mesh(geometry, material);

            obj.add(cube1)
            obj.add(cube2)
            obj.add(cube3)
            obj.add(cube4)

            obj.userData.state = 'move'
            obj.position.set(x, y, z)

            cube1.position.set(-10, 0, 0)
            cube2.position.set(0, 0, 0)
            cube3.position.set(0, -10, 0)
            cube4.position.set(10, -10, 0)

            this.scene.add(obj)

            this.activeTetro = obj
        }

        else if (tetroID == 5) {

            material.color.set(0xEF20D0)

            const obj = new THREE.Object3D()
            const cube1 = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            const cube3 = new THREE.Mesh(geometry, material);
            const cube4 = new THREE.Mesh(geometry, material);

            obj.add(cube1)
            obj.add(cube2)
            obj.add(cube3)
            obj.add(cube4)

            obj.userData.state = 'move'
            obj.position.set(x, y, z)

            cube1.position.set(-10, 0, 0)
            cube2.position.set(0, 0, 0)
            cube3.position.set(10, 0, 0)
            cube4.position.set(0, -10, 0)

            this.scene.add(obj)

            this.activeTetro = obj
        }
        this.changePosition(this.activeTetro, this.tetroTab)
    }

    fall = (obj) => {
        if (this.gameOn == true) {
            let fall = true
            loop:
            for (let i = 0; i < this.tetroTab.length; i++) {
                for (let j = 0; j < this.tetroTab[i].children.length; j++) {
                    for (let k = 0; k < obj.children.length; k++) {
                        if (obj.children[k].position.x + obj.position.x == this.tetroTab[i].children[j].position.x + this.tetroTab[i].position.x && obj.children[k].position.z + obj.position.z == this.tetroTab[i].children[j].position.z + this.tetroTab[i].position.z) {
                            if (obj.children[k].position.y + obj.position.y - 10 == this.tetroTab[i].children[j].position.y + this.tetroTab[i].position.y) {
                                obj.userData.move = false
                                this.tetroTab.push(obj)
                                fall = false
                                k = obj.children.length
                                j = this.tetroTab[i].children.length
                                i = this.tetroTab.length

                                let arrayPos = []
                                for (let i = 0; i < obj.children.length; i++) {
                                    arrayPos[i] = [obj.children[i].position.x + obj.position.x, obj.children[i].position.y + obj.position.y, obj.children[i].position.z + obj.position.z]
                                }
                                net.getNewBlockId(this.playerLogin)
                                net.sendAndCollectMoveData(arrayPos, this.enemyTetroId, this.playerLogin, false, obj.uuid)
                                console.log("TETRONEW => " + this.tetroId)
                                this.checkRow(this.tetroTab, obj)
                                this.checkWin(obj)
                                if (this.gameOn == true) {
                                    this.createTetro(this.tetroId)
                                }
                                break loop
                            }
                        }

                    }
                }
            }
            if (fall == true) {
                for (let i = 0; i < obj.children.length; i++) {
                    if (obj.children[i].position.y + obj.position.y == 0) {
                        obj.userData.move = false
                        this.tetroTab.push(obj)
                        fall = false
                        i = obj.children.length;
                        let arrayPos = []
                        for (let i = 0; i < obj.children.length; i++) {
                            arrayPos[i] = [obj.children[i].position.x + obj.position.x, obj.children[i].position.y + obj.position.y, obj.children[i].position.z + obj.position.z]
                        }
                        net.getNewBlockId(this.playerLogin)
                        net.sendAndCollectMoveData(arrayPos, this.enemyTetroId, this.playerLogin, false, obj.uuid)
                        console.log("TETRONEW => " + this.tetroId)
                        this.checkRow(this.tetroTab, obj)
                        this.checkWin(obj)
                        if (this.gameOn == true) {

                            this.createTetro(this.tetroId)
                        }
                        break
                    }
                }
            }
            if (fall == true) {
                obj.position.y -= 10
                let arrayPos = []
                for (let i = 0; i < obj.children.length; i++) {
                    arrayPos[i] = [obj.children[i].position.x + obj.position.x, obj.children[i].position.y + obj.position.y, obj.children[i].position.z + obj.position.z]
                }
                net.sendAndCollectMoveData(arrayPos, this.enemyTetroId, this.playerLogin, false, obj.uuid)
            }
        }
    }

    changePosition = (obj, tab) => {
        let moveLeft
        let moveRight
        let moveDown
        let moveUp
        let turnOne
        let turnTwo
        let turnThree
        let tb = this.tetroTab

        document.addEventListener("keydown", function (event) {
            moveLeft = true
            moveRight = true
            moveDown = true
            moveUp = true
            turnOne = true
            turnTwo = true
            turnThree = true


            var keyCode = event.which;
            if (obj.userData.move != false) {
                switch (keyCode) {

                    case 37:
                    case 65:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.x + obj.position.x <= 70) {
                                moveLeft = false
                                break
                            }
                        }
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            for (let j = 0; j < tb.length; j++) {
                                for (let k = 0; k < tb[j].children.length; k++) {
                                    if (obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z)
                                        if (obj.children[i].position.x + obj.position.x - 10 == tb[j].children[k].position.x + tb[j].position.x) {
                                            moveLeft = false
                                            break loop
                                        }
                                }
                            }
                        }
                        if (moveLeft == true) {
                            obj.position.x -= 10
                            moveRight = true
                        }
                        break;
                    case 38:
                    case 87:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.z + obj.position.z <= -30) {
                                moveUp = false
                                break
                            }
                        }
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            for (let j = 0; j < tb.length; j++) {
                                for (let k = 0; k < tb[j].children.length; k++) {
                                    if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y)
                                        if (obj.children[i].position.z + obj.position.z - 10 == tb[j].children[k].position.z + tb[j].position.z) {
                                            moveUp = false
                                            break loop
                                        }
                                }
                            }
                        }
                        if (moveUp == true) {
                            obj.position.z -= 10
                            moveDown = true
                        }
                        break;
                    case 39:
                    case 68:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.x + obj.position.x >= 135) {
                                moveRight = false
                                break
                            }
                        } loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            for (let j = 0; j < tb.length; j++) {
                                for (let k = 0; k < tb[j].children.length; k++) {
                                    if (obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z)
                                        if (obj.children[i].position.x + obj.position.x + 10 == tb[j].children[k].position.x + tb[j].position.x) {
                                            moveRight = false
                                            break loop
                                        }
                                }
                            }
                        }
                        if (moveRight == true) {
                            obj.position.x += 10
                            moveLeft = true
                        }
                        break;
                    case 40:
                    case 83:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.z + obj.position.z >= 40) {
                                moveDown = false
                                break
                            }
                        }
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            for (let j = 0; j < tb.length; j++) {
                                for (let k = 0; k < tb[j].children.length; k++) {
                                    if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y)
                                        if (obj.children[i].position.z + obj.position.z + 10 == tb[j].children[k].position.z + tb[j].position.z) {
                                            moveDown = false
                                            break loop
                                        }
                                }
                            }
                        }
                        if (moveDown == true) {
                            obj.position.z += 10
                            moveUp = true
                        }
                        break;
                    case 49:
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.x == obj.children[i].position.y) {
                                if (obj.children[i].position.y * -1 + obj.position.y < 0) {
                                    turnOne = false
                                    break
                                }
                                console.log(tb)
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y * -1 + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnOne = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.x * -1 == obj.children[i].position.y) {
                                if (obj.children[i].position.x * -1 + obj.position.x < 60 || obj.children[i].position.x * -1 + obj.position.x > 140) {
                                    turnOne = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x * -1 + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z) {
                                            turnOne = false
                                            console.log("BREAK-LOOP - 2")
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.x == 0) {
                                if (obj.children[i].position.y + obj.position.x < 60 || obj.children[i].position.y + obj.position.x > 140 || obj.children[i].position.x + obj.position.y < 0) {
                                    turnOne = false
                                    break loop
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.y + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.x + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnOne = false
                                            console.log("BREAK-LOOP - 3")
                                            break loop
                                        }
                                    }
                                }
                            }
                            else {
                                if (obj.children[i].position.y * -1 + obj.position.x < 60 || obj.children[i].position.y * -1 + obj.position.x > 140 || obj.children[i].position.x * -1 + obj.position.y < 0) {
                                    turnOne = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.y * -1 + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.x * -1 + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnOne = false
                                            console.log("BREAK-LOOP - 3")
                                            break loop
                                        }
                                    }
                                }
                            }
                        }

                        if (turnOne == true) {
                            for (let i = 0; i < obj.children.length; i++) {
                                if (obj.children[i].position.x == obj.children[i].position.y) {
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.y * -1, obj.children[i].position.z)
                                }
                                else if (obj.children[i].position.x * -1 == obj.children[i].position.y) {
                                    obj.children[i].position.set(obj.children[i].position.x * -1, obj.children[i].position.y, obj.children[i].position.z)
                                }
                                else if (obj.children[i].position.x == 0) {
                                    obj.children[i].position.set(obj.children[i].position.y, obj.children[i].position.x, obj.children[i].position.z)
                                }
                                else {
                                    obj.children[i].position.set(obj.children[i].position.y * -1, obj.children[i].position.x * -1, obj.children[i].position.z)
                                }
                            }
                        }


                        console.log("Q")
                        break;
                    case 50:
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.z == obj.children[i].position.x) {
                                if (obj.children[i].position.x * -1 + obj.position.x < 60 || obj.children[i].position.x * -1 + obj.position.x > 140) {
                                    turnTwo = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x * -1 + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnTwo = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.z * -1 == obj.children[i].position.x) {
                                if (obj.children[i].position.z * -1 + obj.position.z < -35 || obj.children[i].position.z * -1 + obj.position.z > 45) {
                                    turnTwo = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z * - 1 + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnTwo = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.z == 0) {
                                if (obj.children[i].position.x + obj.position.z < -35 || obj.children[i].position.x + obj.position.z > 45 || obj.children[i].position.z + obj.position.x < 60 || obj.children[i].position.z + obj.position.x > 140) {
                                    turnTwo = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.z + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.x + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnTwo = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else {
                                if (obj.children[i].position.x * -1 + obj.position.z < -35 || obj.children[i].position.x * -1 + obj.position.z > 45 || obj.children[i].position.z * -1 + obj.position.x < 60 || obj.children[i].position.z * -1 + obj.position.x > 140) {
                                    turnTwo = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.z * -1 + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.x * -1 + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnTwo = false
                                            break loop
                                        }
                                    }
                                }
                            }
                        }
                        if (turnTwo == true) {
                            for (let i = 0; i < obj.children.length; i++) {
                                if (obj.children[i].position.z == obj.children[i].position.x) {
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.y, obj.children[i].position.z * -1)
                                }
                                else if (obj.children[i].position.z * -1 == obj.children[i].position.x) {
                                    obj.children[i].position.set(obj.children[i].position.x * -1, obj.children[i].position.y, obj.children[i].position.z)
                                }
                                else if (obj.children[i].position.z == 0) {
                                    console.log("x == 0")
                                    obj.children[i].position.set(obj.children[i].position.z, obj.children[i].position.y, obj.children[i].position.x)
                                }
                                else {
                                    console.log("x != 0")
                                    obj.children[i].position.set(obj.children[i].position.z * -1, obj.children[i].position.y, obj.children[i].position.x * -1)
                                }
                            }
                        }

                        console.log("W")
                        break;
                    case 51:
                        loop:
                        for (let i = 0; i < obj.children.length; i++) {
                            if (obj.children[i].position.y == obj.children[i].position.z) {
                                if (obj.children[i].position.z * -1 + obj.position.z < -35 || obj.children[i].position.z * -1 + obj.position.z > 45) {
                                    turnThree = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z * -1 + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnThree = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.y * -1 == obj.children[i].position.z) {
                                if (obj.children[i].position.y * -1 + obj.position.y < 0) {
                                    turnThree = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.y * -1 + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.z + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnThree = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else if (obj.children[i].position.z == 0) {
                                if (obj.children[i].position.y + obj.position.z < -35 || obj.children[i].position.y + obj.position.z > 45 || obj.children[i].position.z + obj.position.y < 0) {
                                    turnThree = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.z + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.y + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnThree = false
                                            break loop
                                        }
                                    }
                                }
                            }
                            else {
                                if (obj.children[i].position.y * -1 + obj.position.z < -35 || obj.children[i].position.y * -1 + obj.position.z > 45 || obj.children[i].position.z * -1 + obj.position.y < 0) {
                                    turnThree = false
                                    break
                                }
                                for (let j = 0; j < tb.length; j++) {
                                    for (let k = 0; k < tb[j].children.length; k++) {
                                        if (obj.children[i].position.x + obj.position.x == tb[j].children[k].position.x + tb[j].position.x && obj.children[i].position.z * -1 + obj.position.y == tb[j].children[k].position.y + tb[j].position.y && obj.children[i].position.y * -1 + obj.position.z == tb[j].children[k].position.z + tb[j].position.z) {
                                            turnThree = false
                                            break loop
                                        }
                                    }
                                }
                            }
                        }
                        if (turnThree == true) {
                            for (let i = 0; i < obj.children.length; i++) {
                                if (obj.children[i].position.y == obj.children[i].position.z) {
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.y * -1, obj.children[i].position.z)
                                }
                                else if (obj.children[i].position.y * -1 == obj.children[i].position.z) {
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.y * -1, obj.children[i].position.z)
                                }
                                else if (obj.children[i].position.z == 0) {
                                    console.log("x == 0")
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.z, obj.children[i].position.y)
                                }
                                else {
                                    console.log("x != 0")
                                    obj.children[i].position.set(obj.children[i].position.x, obj.children[i].position.z * - 1, obj.children[i].position.y * -1)
                                }
                            }
                        }
                        console.log("E")
                        break;
                    case 32:
                        let fall = true
                        // let lowest = 0
                        // let distance = 0
                        // for (let i = 0; i < this.tetroTab.length; i++) {
                        //     for (let j = 0; j < game.tetroTab[i].children.length; j++) {
                        //         for (let k = 0; k < obj.children.length; k++) {
                        //             if (game.tetroTab[i].children[j].position.x == obj.children[k].position.x && game.tetroTab[i].children[j].position.z == obj.children[k].position.z) {
                        //                 console.log("checkLoop")
                        //                 if (obj.children[k].position.y - game.tetroTab[i].children[j].position.y > distance) {
                        //                     distance = (obj.children[k].position.y - game.tetroTab[i].children[j].position.y)

                        //                 }
                        //             }
                        //         }

                        //     }
                        // }
                        // console.log(distance)
                        // if (distance != 0) {
                        //     obj.position.y -= distance + 10
                        // } else {
                        //     console.log(distance)
                        //     for (let i = 0; i < obj.children.length; i++) {
                        //         if (obj.children[i].position.y < lowest) {
                        //             lowest = obj.children[i].position.y
                        //         }
                        //     }
                        //     obj.position.y = -lowest
                        //     console.log("brak klocka pod")
                        // }

                        // for (let i = 0; i < tb.length; i++) {
                        //     for (let j = 0; j < tb[i].children.length; j++) {
                        //         for (let k = 0; k < obj.children.length; k++) {
                        //             if (obj.children[k].position.x + obj.position.x == tb[i].children[j].position.x + tb[i].position.x && obj.children[k].position.z + obj.position.z == tb[i].children[j].position.z + tb[i].position.z) {
                        //                 if (obj.children[k].position.y + obj.position.y - 10 == tb[i].children[j].position.y + tb[i].position.y) {
                        //                     obj.userData.move = false
                        //                     tb.push(obj)
                        //                     fall = false
                        //                     tetroId = Math.floor(Math.random() * 5) + 1
                        //                     k = obj.children.length
                        //                     j = tb[i].children.length
                        //                     i = tb.length
                        //                     for (let n = 0; n < obj.children.length; n++) {
                        //                         if (obj.children[n].position.y + obj.position.y == 0) {
                        //                             this.row0.push(obj.children[n])
                        //                             console.log("DODAJ ROW 0")
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 10) {
                        //                             this.row1.push(obj.children[n])
                        //                             console.log("DODAJ ROW 1")
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 20) {
                        //                             this.row2.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 30) {
                        //                             this.row3.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 40) {
                        //                             this.row4.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 50) {
                        //                             this.row5.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 60) {
                        //                             this.row6.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 70) {
                        //                             this.row7.push(obj.children[n])
                        //                         }
                        //                         else if (obj.children[n].position.y + obj.position.y == 80) {
                        //                             this.row8.push(obj.children[n])
                        //                         }
                        //                     }
                        //                     console.log("__________________________")
                        //                     this.checkRow()
                        //                     this.checkWin(obj)
                        //                     if (this.gameOn == true) {
                        //                         this.createTetro(this.tetroId)
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                        // if (fall == true) {
                        //     for (let i = 0; i < obj.children.length; i++) {
                        //         if (obj.children[i].position.y + obj.position.y == 0) {
                        //             obj.userData.move = false
                        //             this.tetroTab.push(obj)
                        //             fall = false
                        //             i = obj.children.length;
                        //             for (let n = 0; n < obj.children.length; n++) {
                        //                 if (obj.children[n].position.y + obj.position.y == 0) {
                        //                     this.row0.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 10) {
                        //                     this.row1.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 20) {
                        //                     this.row2.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 30) {
                        //                     this.row3.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 40) {
                        //                     this.row4.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 50) {
                        //                     this.row5.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 60) {
                        //                     this.row6.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 70) {
                        //                     this.row7.push(obj.children[n])
                        //                 }
                        //                 else if (obj.children[n].position.y + obj.position.y == 80) {
                        //                     this.row8.push(obj.children[n])
                        //                 }
                        //             }
                        //             console.log("__________________________")
                        //             this.checkRow()
                        //             this.checkWin(obj)

                        //             if (this.gameOn == true) {
                        //                 this.tetroId = Math.floor(Math.random() * 5) + 1
                        //                 this.createTetro(this.tetroId)
                        //             }
                        //             break
                        //         }
                        //     }
                        // }


                        tab.push(obj)
                        this.createTetro(this.tetroId)
                        console.log("bottom")
                        obj.userData.move = false
                        break;
                    case 16:

                        let x = 75
                        let y = 90
                        let z = 0

                        console.log(this.scene)

                        this.secondTetro = obj
                        this.scene.remove(obj)
                        this.secondTetro.position.set(x, y, z)

                }
            }

        })
    }

    checkWin = obj => {
        for (let i = 0; i < obj.children.length; i++) {
            if (obj.children[i].position.y + obj.position.y >= 90) {
                i = this.tetroTab.length
                this.gameOn = false
                net.sendLoseInfo(this.playerLogin)
                alert("PRZEGRANA")
                break
            }
        }
    }
    IAmWinner = () => {
        alert("WYGRANA")
        this.gameOn = false
    }

    checkRow = (tab, obj) => {
        for (let n = 0; n < obj.children.length; n++) {
            if (obj.children[n].position.y + obj.position.y == 0) {
                this.row0.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 10) {
                this.row1.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 20) {
                this.row2.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 30) {
                this.row3.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 40) {
                this.row4.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 50) {
                this.row5.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 60) {
                this.row6.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 70) {
                this.row7.push(obj.children[n])
            }
            else if (obj.children[n].position.y + obj.position.y == 80) {
                this.row8.push(obj.children[n])
            }
        }
        if (this.row8.length == 64) {
            for (let i = 0; i < this.row8.length; i++) {
                this.row8[i].geometry.dispose()
                this.row8[i].material.dispose()
                this.row8[i].parent.remove(this.row8[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 80) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row8 = []
        }
        if (this.row7.length == 64) {
            for (let i = 0; i < this.row7.length; i++) {
                this.row7[i].geometry.dispose()
                this.row7[i].material.dispose()
                this.row7[i].parent.remove(this.row7[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 70) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row7 = this.row8
            this.row8 = []
        }
        if (this.row6.length == 64) {
            for (let i = 0; i < this.row6.length; i++) {
                this.row6[i].geometry.dispose()
                this.row6[i].material.dispose()
                this.row6[i].parent.remove(this.row6[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 60) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }

            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }
        if (this.row5.length == 64) {
            for (let i = 0; i < this.row5.length; i++) {
                this.row5[i].geometry.dispose()
                this.row5[i].material.dispose()
                this.row5[i].parent.remove(this.row5[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (this.tetroTab[i].children[j].position.y + tab[i].position.y > 50) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }
        if (this.row4.length == 64) {
            for (let i = 0; i < this.row4.length; i++) {
                this.row4[i].geometry.dispose()
                this.row4[i].material.dispose()
                this.row4[i].parent.remove(this.row4[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 40) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row4 = this.row5
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }
        if (this.row3.length == 64) {
            for (let i = 0; i < this.row3.length; i++) {
                this.row3[i].geometry.dispose()
                this.row3[i].material.dispose()
                this.row3[i].parent.remove(this.row3[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 30) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row3 = this.row4
            this.row4 = this.row5
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }
        if (this.row2.length == 64) {
            for (let i = 0; i < this.row2.length; i++) {
                this.row2[i].geometry.dispose()
                this.row2[i].material.dispose()
                this.row2[i].parent.remove(this.row2[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 20) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row2 = this.row3
            this.row3 = this.row4
            this.row4 = this.row5
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }

        if (this.row1.length == 10) {
            for (let i = 0; i < this.row1.length; i++) {
                this.row1[i].geometry.dispose()
                this.row1[i].material.dispose()
                this.row1[i].parent.remove(this.row1[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 10) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row1 = this.row2
            this.row2 = this.row3
            this.row3 = this.row4
            this.row4 = this.row5
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
        }

        if (this.row0.length >= 10) {
            console.log("clear ROW 0")
            for (let i = 0; i < this.row0.length; i++) {
                this.row0[i].geometry.dispose()
                this.row0[i].material.dispose()
                this.row0[i].parent.remove(this.row0[i])
            }
            for (let i = 0; i < tab.length; i++) {
                for (let j = 0; j < tab[i].children.length; j++) {
                    if (tab[i].children[j].position.y + tab[i].position.y > 0) {
                        tab[i].children[j].position.y -= 10
                    }
                }
            }
            this.row0 = this.row1
            this.row1 = this.row2
            this.row2 = this.row3
            this.row3 = this.row4
            this.row4 = this.row5
            this.row5 = this.row6
            this.row6 = this.row7
            this.row7 = this.row8
            this.row8 = []
            console.log(this.row0.length)
        }
    }
    checkEnemyRow = () => {
        if (this.enemyRow8.length == 64) {
            for (let i = 0; i < this.enemyRow8.length; i++) {
                this.enemyRow8[i].geometry.dispose()
                this.enemyRow8[i].material.dispose()
                this.scene.remove(this.enemyRow8[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 80) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow8 = []
        }
        if (this.enemyRow7.length == 64) {
            for (let i = 0; i < this.enemyRow7.length; i++) {
                this.enemyRow7[i].geometry.dispose()
                this.enemyRow7[i].material.dispose()
                this.scene.remove(this.enemyRow7[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 70) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }
        if (this.enemyRow6.length == 64) {
            for (let i = 0; i < this.enemyRow6.length; i++) {
                this.enemyRow6[i].geometry.dispose()
                this.enemyRow6[i].material.dispose()
                this.scene.remove(this.enemyRow6[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 60) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }

            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }
        if (this.enemyRow5.length == 64) {
            for (let i = 0; i < this.enemyRow5.length; i++) {
                this.enemyRow5[i].geometry.dispose()
                this.enemyRow5[i].material.dispose()
                this.scene.remove(this.enemyRow5[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 50) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }
        if (this.enemyRow4.length == 64) {
            for (let i = 0; i < this.enemyRow4.length; i++) {
                this.enemyRow4[i].geometry.dispose()
                this.enemyRow4[i].material.dispose()
                this.scene.remove(this.enemyRow4[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 40) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow4 = this.enemyRow5
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }
        if (this.enemyRow3.length == 64) {
            for (let i = 0; i < this.enemyRow3.length; i++) {
                this.enemyRow3[i].geometry.dispose()
                this.enemyRow3[i].material.dispose()
                this.scene.remove(this.enemyRow3[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 30) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow3 = this.enemyRow4
            this.enemyRow4 = this.enemyRow5
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }
        if (this.enemyRow2.length == 64) {
            for (let i = 0; i < this.enemyRow2.length; i++) {
                this.enemyRow2[i].geometry.dispose()
                this.enemyRow2[i].material.dispose()
                this.scene.remove(this.enemyRow2[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 20) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow2 = this.enemyRow3
            this.enemyRow3 = this.enemyRow4
            this.enemyRow4 = this.enemyRow5
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }

        if (this.enemyRow1.length == 10) {
            for (let i = 0; i < this.enemyRow1.length; i++) {
                this.enemyRow1[i].geometry.dispose()
                this.enemyRow1[i].material.dispose()
                this.scene.remove(this.enemyRow1[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 10) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow1 = this.enemyRow2
            this.enemyRow2 = this.enemyRow3
            this.enemyRow3 = this.enemyRow4
            this.enemyRow4 = this.enemyRow5
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
        }

        if (this.enemyRow0.length >= 10) {
            console.log("clear ROW 0")
            for (let i = 0; i < this.enemyRow0.length; i++) {
                this.enemyRow0[i].geometry.dispose()
                this.enemyRow0[i].material.dispose()
                this.scene.remove(this.enemyRow0[i])
            }
            for (let i = 0; i < this.enemyTetroTab.length; i++) {
                for (let j = 0; j < this.enemyTetroTab[i].length; j++) {
                    if (this.enemyTetroTab[i][j].position.y > 0) {
                        this.enemyTetroTab[i][j].position.y -= 10
                    }
                }
            }
            this.enemyRow0 = this.enemyRow1
            this.enemyRow1 = this.enemyRow2
            this.enemyRow2 = this.enemyRow3
            this.enemyRow3 = this.enemyRow4
            this.enemyRow4 = this.enemyRow5
            this.enemyRow5 = this.enemyRow6
            this.enemyRow6 = this.enemyRow7
            this.enemyRow7 = this.enemyRow8
            this.enemyRow8 = []
            console.log(this.enemyRow0.length)
        }
    }

    render = () => {

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        setTimeout(() => {
            requestAnimationFrame(this.render);
        }, 33)

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }


}

export { Game }