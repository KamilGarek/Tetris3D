import { net } from "./Main.js";
import { game } from "./Main.js";
import { ui } from "./Main.js";

class Net {
    playerLogin = ""
    loguj() {
        const options = {
            method: "POST",
            body: JSON.stringify({ login: document.getElementById("input_nazwa_uzytkownika").value })
        };
        if (document.getElementById("input_nazwa_uzytkownika").value == "") {
            console.log("checklogin");
            alert("podaj login!")
            return 0
        }
        fetch("/logowanie", options)
            .then(response => response.text())
            .then(data => {
                const login = {
                    method: "POST",
                    body: JSON.parse(data).login
                }
                this.playerLogin = login.body
                // console.log(login)
                // console.log(typeof login)
                fetch("/add_user", login)
                    .then(response => response.json())
                    .then(data => {
                        function displayOtherUser() {
                            const check = {
                                method: "POST"
                            }
                            fetch("/check_users", check)
                                .then(response => response.json())
                                .then(data => {
                                    const usersStatus = data
                                    if (usersStatus.usersNumber == 2) {
                                        // console.log("Grasz przeciwko: " + usersStatus.usersTable[0])
                                        document.getElementById("opponent_info").innerHTML = "Grasz przeciwko: <b>" + usersStatus.usersTable[0] + "<b/>"
                                    }
                                })
                                .catch(error => console.log(error));
                        }
                        const status = data
                        // console.log(status)
                        // console.log(login.body)
                        var mojLogin = login.body
                        if (status.status == "limit przekroczony")
                            alert("przekroczono limit zalogowanych użytkowników")
                        else if (status.status == "zajety")
                            alert("ten login jest już zajęty")
                        else if (status.status == "dodano") {
                            document.getElementById("dark-filter").remove()
                            document.getElementById("status").innerHTML = "user added"
                            document.getElementById("user_info").innerHTML = "Witaj <b>" + mojLogin + "</b>"
                            game.setPlayerLogin(mojLogin)
                            if (status.players == "0")
                                this.waitForPlayer()
                            else {
                                displayOtherUser()
                                this.waitForStart()
                            }
                        }
                        else
                            alert("wystąpiły problemy")
                    })
                    .catch(error => console.log(error));
            })
            .catch(error => console.log(error));
    }
    waitForPlayer() {
        ui.ekranOczekiwaniaNaLogownie()
        let checkUsers = setInterval(function () {
            console.log("interval sprawdzający userów nadal chodzi!")
            const check = {
                method: "POST"
            }
            fetch("/check_users", check)
                .then(response => response.json())
                .then(data => {
                    const usersStatus = data
                    if (usersStatus.usersNumber == 2) {
                        // console.log("Gracz " + usersStatus.usersTable[1] + " dołączył do gry!")
                        document.getElementById("opponent_info").innerHTML = "Gracz <b>" + usersStatus.usersTable[1] + " </b>dołączył do gry!"
                        document.getElementById("dark-filter").remove()
                        clearInterval(checkUsers)
                        net.waitForStart()
                    }
                })
                .catch(error => console.log(error));

        }, 1000)
    }
    startGame() {
        game.startGame()
        // const sendingAndCollectingMoveData = setInterval(this.sendAndCollectMoveData,1000)
    }

    waitForStart() {
        let div = document.createElement("div")
        div.setAttribute("id", "dark-filter")
        let canvas = document.getElementById("root").firstChild
        document.getElementById("root").insertBefore(div, canvas)
        let komunikat = document.createElement("h1")
        komunikat.setAttribute("id", "waitForPlayer")
        komunikat.innerHTML = "Start za:"
        let kolko = document.createElement("div")
        kolko.setAttribute("id", "Loading-circle")
        let przerwa = document.createElement("div")
        przerwa.setAttribute("id", "przerwa")
        let zegar = document.createElement("div")
        zegar.setAttribute("id", "zegar")
        komunikat.appendChild(przerwa)
        komunikat.appendChild(zegar)
        komunikat.appendChild(przerwa)
        komunikat.appendChild(kolko)
        div.appendChild(komunikat)
        const check = {
            method: "POST"
        }
        fetch("/start_timer", check)
            .then(response => response.text())
            .then(data => {
                const checkGameStart = setInterval(function () {
                    const check = {
                        method: "POST"
                    }
                    fetch("/get_timer", check)
                        .then(response => response.text())
                        .then(data => {
                            // console.log(data);
                            if (data == 0) {
                                document.getElementById("waitForPlayer").remove()
                                document.getElementById("dark-filter").remove()
                                clearInterval(checkGameStart)
                                net.startGame()
                            }
                            else {
                                document.getElementById("zegar").innerHTML = data
                            }
                        })
                        .catch(error => console.log(error));
                }, 100)
            })
            .catch(error => console.log(error));
    }

    sendAndCollectMoveData(arrayPos, id, login, isLost, uuid) {
        const status = JSON.stringify({
            arrayPos: arrayPos,
            id: id,
            login: login,
            isLost: isLost,
            uuid: uuid
        })
        // console.log(status.login);
        // console.log(typeof status)
        //const status = game.sendYourPosition() tu albo po wciścnięciu przycisku
        //status zawiera: login, pozycję obiektu, obrót obiektu, informację o przegranej
        //login, object_pos, object_rot, lost
        //string, int, table[int, int, int], boolean                                   
        const object = {
            method: "POST",
            body: status
        }
        fetch("/get_status", object)
            .then(response => response.json())
            .then(data => {
                if (data.isLost)
                    game.IAmWinner()
                else {
                    const res_object = data
                    game.makeOpponentMove(res_object)
                }
            })
    }

    sendLoseInfo(login) {


        const object = {
            method: "POST",
            body: login
        }
        fetch("/send_lose_info", object)
    }

    getNewBlockId(login) {
        const object = {
            method: "POST",
            body: login
        }

        fetch("/get_new_block_id", object)
            .then(response => response.json())
            .then(noweId => {
                game.pobierzNoweId(noweId)
            })
    }
    showScoreTable() {
        const object = {
            method: "POST"
        }
        fetch("/get_score_data", object)
            .then(response => response.json())
            .then(data => {
                let leaderboards = []
                const games = data.games
                const users = data.users
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    user.games = {}
                    let wins = 0
                    let losts = 0
                    for (let j = 0; j < games.length; j++) {
                        const game = games[j];
                        console.log(game.winner)
                        console.log(user.user);
                        if (game.winner == user.user)
                            wins++
                        if (game.loser == user.user)
                            losts++
                    }
                    user.games.wins = wins
                    user.games.losts = losts
                    // console.log(user);
                    leaderboards[i] = user
                }
                for (let j = 0; j < leaderboards.length; j++) {
                    for (let i = 1; i < leaderboards.length; i++) {
                        const element = leaderboards[i];
                        const preElement = leaderboards[i - 1]
                        let bufor
                        if (element.games.wins > preElement.games.wins) {
                            bufor = preElement
                            leaderboards[i - 1] = element
                            leaderboards[i] = bufor
                        }
                    }
                }

                console.log(users);
                console.log(leaderboards);
                ui.displayLeaderboards(leaderboards)
            })

    }
    serverReset = () => {
        const object = {
            method: "POST"
        }

        fetch("/server_reset", object)

    }
}
export { Net }