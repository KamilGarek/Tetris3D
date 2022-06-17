const Datastore = require('nedb')
const coll1 = new Datastore({
    filename: 'databases/Scores.db',
    autoload: true
});
const coll2 = new Datastore({
    filename: 'databases/Users.db',
    autoload: true
});
const coll3 = new Datastore({
    filename: 'databases/Blocks.db',
    autoload: true
});
const fs = require("fs")
const path = require("path")
const filepath = path.join(__dirname, "databases", "Blocks.db")
// form.uploadDir = "databases/"
const express = require("express");
const app = express()
const PORT = 3000
var users = []
const users_info = {
    user1: {
        login: "",
        blockId: 1,
        status: {},
    },
    user2: {
        login: "",
        blockId: 1,
        status: {}
    }
}
let licznik = 3
let czyLicznikJuzDziala = false
let blockIdNumber = 1


function addScoreRecord(loser, winner) {
    const doc = {
        winner: winner,
        loser: loser
    }
    coll1.insert(doc, function (err, newDoc) {
        console.log("id dokumentu: " + newDoc._id, "DODANO: " + new Date().getMilliseconds())
    });
}
function addUserRecord(user) {
    const doc = {
        user: user
    }
    coll2.find({ user: user }, function (err, docs) {
        if (docs == "") {
            coll2.insert(doc, function (err, newDoc) { });
        }
    });
}
function addBlockIdRecord() {
    const newBlockId = Math.floor(Math.random() * 5) + 1
    const doc = {
        id: blockIdNumber,
        blockId: newBlockId
    }
    coll3.insert(doc, function (err, newDoc) { });
    blockIdNumber++
}
function clearBlockDatabase() {
    // coll3.remove({}, { multi: true }, function (err, numRemoved) {
    //     console.log("usunięto wszystkie dokumenty: ",numRemoved)  
    // });
    // function del() {
    if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
            if (err) throw err
        })
    }
    // }
    // setTimeout(del, 1000)
}

// addScoreRecord("sdf","fghhhh")
clearBlockDatabase()
setInterval(addBlockIdRecord, 500)

app.use(express.static('static'))
app.use(express.text())

app.post("/logowanie", (req, res) => {
    data = req.body
    res.send(data)
})

app.post("/add_user", (req, res) => {
    const login = req.body
    res.setHeader("content-type", "application/json")

    if (users.length == 2) {
        const status = {
            status: "limit przekroczony",
            players: "2"
        }
        res.send(status)
    }
    else if (users.length == 1) {
        if (login == users[0]) {
            const status = {
                status: "zajety",
                players: "1"
            }
            res.send(status)
        }

        else {
            users[1] = login
            const status = {
                status: "dodano",
                players: "1"
            }
            users_info.user2.login = login
            addUserRecord(login)
            res.send(status)
        }
    }
    else {
        users[0] = login
        const status = {
            status: "dodano",
            players: "0"
        }
        users_info.user1.login = login
        addUserRecord(login)
        res.send(status)
    }
})

app.post("/check_users", (req, res) => {
    if (users.length == 2) {
        const usersStatus = {
            usersNumber: 2,
            usersTable: users
        }
        res.send(usersStatus)
    }
    else {
        const usersStatus = {
            usersNumber: 1,
            usersTable: users
        }
        res.send(usersStatus)
    }
})
app.post("/get_status", (req, res) => {
    res.setHeader("content-type", "application/json")
    const status_data = JSON.parse(req.body)

    if (status_data.login == users_info.user1.login) {
        users_info.user1.status = status_data
        // console.log("user1:");//
        // console.log(users_info.user1.login);//
        const Blocks = async () => {
            return new Promise(resolve => {
                coll3.find({ id: status_data.id }, function (err, docs) {

                    resolve(docs)
                });
            })
        }
        const przypiszDane = async () => {
            const id = await Blocks()
            let blockId = id[0].blockId
            const odp = {
                status: users_info.user2.status,
                blockId: blockId,
                isLost: users_info.user2.status.isLost
            }
            // zmiana userów
            //     addScoreRecord(users_info.user1.login, users_info.user2.login)

            res.send(odp)
        }
        przypiszDane()
    }
    else {
        users_info.user2.status = status_data
        // console.log("user2:");//
        // console.log(users_info.user2.login);//
        const Blocks = async () => {
            return new Promise(resolve => {
                coll3.find({ id: status_data.id }, function (err, docs) {
                    resolve(docs)
                });
            })
        }
        const przypiszDane = async () => {
            const id = await Blocks()
            let blockId = id[0].blockId
            const odp = {
                status: users_info.user1.status,
                blockId: blockId,
                isLost: users_info.user1.status.isLost
            }
            res.send(odp)
        }
        przypiszDane()
    }
})

app.post("/send_lose_info", (req, res) => {
    const status_data = req.body
    console.log(status_data)
    if (status_data == users_info.user1.login) {
        addScoreRecord(users_info.user1.login, users_info.user2.login) //opcjonalnie (może być też w "/get_status")
        users_info.user1.status.isLost = true
        console.log("___________________________")
    }
    else {
        addScoreRecord(users_info.user2.login, users_info.user1.login) //opcjonalnie (może być też w "/get_status")
        users_info.user2.status.isLost = true
        console.log("+++++++++++++++++++++++++++++++")
    }
})

app.post("/get_new_block_id", (req, res) => {
    const login = req.body
    let newBlockId
    if (login == users_info.user1.login) {
        newBlockId = users_info.user1.blockId
        users_info.user1.blockId++
    }
    else {
        newBlockId = users_info.user2.blockId
        users_info.user2.blockId++
    }
    const Blocks = async () => {
        return new Promise(resolve => {
            coll3.find({ id: newBlockId }, function (err, docs) {
                resolve(docs)
            });
        })
    }
    const przypiszDane = async () => {
        const id = await Blocks()
        res.send(id[0])
    }
    przypiszDane()
})

app.post("/get_score_data", (req, res) => {
    const usersHistory = async () => {
        return new Promise(resolve => {
            coll2.find({}, function (err, docs) {
                resolve(docs)
            });
        })
    }
    const gamesHistory = async () => {
        return new Promise(resolve => {
            coll1.find({}, function (err, docs) {
                resolve(docs)
            });
        })
    }
    const przypiszDane = async () => {
        const users = await usersHistory()
        const games = await gamesHistory()
        const data = {
            games: games,
            users: users
        }
        res.send(data)
    }
    przypiszDane()

})

app.post("/start_timer", (req, res) => {

    if (!czyLicznikJuzDziala) {
        const odliczanie = setInterval(function () {
            if (licznik == 0) {
                clearInterval(odliczanie)
            }
            licznik--
        }, 1000);
    }

    czyLicznikJuzDziala = true
    res.send()
})

app.post("/get_timer", (req, res) => {
    res.send(String(licznik))
})

app.post("/server_reset", (req, res) => {
    users = []
    users_info.user1 = {
        login: "",
        blockId: 1,
        status: {}
    }
    users_info.user2 = {
        login: "",
        blockId: 1,
        status: {}
    }
    licznik = 3
    czyLicznikJuzDziala = false
    blockIdNumber = 1
    clearBlockDatabase()
})

app.get("/", (req, res) => {
    res.sendFile("static/index.html")
})

app.listen(PORT, () => {
    console.log("start serwera na porcie: " + PORT)
})
