import { net } from "./Main.js";
import { ui } from "./Main.js";
import { game } from "./Main.js";
class Ui {

    constructor() {
        document.getElementById("przycisk_loguj").onclick = function () {
            net.loguj()
        }
        document.getElementById("przycisk_tablica_wyników").onclick = function () {
            net.showScoreTable()
        }
        document.getElementById("przycisk_reset").onclick = function () {
            net.serverReset()
        }
    };
    ekranOczekiwaniaNaLogownie() {
        let div = document.createElement("div")
        div.setAttribute("id", "dark-filter")
        let canvas = document.getElementById("root").firstChild
        document.getElementById("root").insertBefore(div, canvas)
        let komunikat = document.createElement("h1")
        komunikat.setAttribute("id", "waitForPlayer")
        komunikat.innerHTML = "Czekaj na drugiego gracza"
        let kolko = document.createElement("div")
        kolko.setAttribute("id", "Loading-circle")
        let przerwa = document.createElement("div")
        przerwa.setAttribute("id", "przerwa")
        komunikat.appendChild(przerwa)
        komunikat.appendChild(kolko)
        div.appendChild(komunikat)
    }
    displayLeaderboards(leaderboards) {
        let tabela = "<table><tr><th>Poz.</th><th>Gracz</th><th>Wygrane</th><th>Przegrane</th></tr>"
        console.log("lea");
        console.log(leaderboards);
        document.getElementById("logowanie").remove()
        let records = 10
        if (leaderboards.length < records)
            records = leaderboards.length
        console.log("długość: " + leaderboards.length);
        console.log("records: " + records);
        for (let i = 0; i < records; i++) {
            const element = leaderboards[i];
            console.log("element" + i);
            console.log(element);
            tabela += "<tr><td>" + (i + 1) + "</td><td>" + element.user + "</td><td>" + element.games.wins + "</td><td>" + element.games.losts + "</td></tr>"
        }
        tabela += "</tabela>"
        let div = document.createElement("div")
        div.setAttribute("id", "leaderboards")
        document.getElementById("dark-filter").appendChild(div)
        let tableDiv = document.createElement("div")
        tableDiv.setAttribute("id", "leaderboardsTable")
        tableDiv.innerHTML = tabela
        let title = document.createElement("h1")
        title.setAttribute("id", "leaderboardsTitle")
        title.innerHTML = "Tabela wyników"
        let tableReturnButton = document.createElement("button")
        tableReturnButton.setAttribute("id", "tableReturnButton")
        tableReturnButton.setAttribute("class", "log_button")
        tableReturnButton.innerHTML = "POWRÓT DO LOGOWANIA"
        div.appendChild(title)
        div.appendChild(tableDiv)
        div.appendChild(tableReturnButton)

        document.getElementById("tableReturnButton").onclick = function () {
            ui.backToLogScreen()
        }
    }
    backToLogScreen() {
        let darkFilter = document.getElementById("dark-filter")
        darkFilter.children[0].remove()
        let div = document.createElement("div")
        div.setAttribute("id", "logowanie")
        darkFilter.appendChild(div)
        let title = document.createElement("h1")
        title.innerHTML = "LOGOWANIE"
        div.appendChild(title)
        let input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("id", "input_nazwa_uzytkownika")
        div.appendChild(input)
        let bt_log = document.createElement("button")
        bt_log.innerHTML = "LOGUJ"
        bt_log.setAttribute("class", "log_button")
        bt_log.setAttribute("id", "przycisk_loguj")
        div.appendChild(bt_log)
        let bt_tab = document.createElement("button")
        bt_tab.setAttribute("class", "log_button")
        bt_tab.setAttribute("id", "przycisk_tablica_wyników")
        bt_tab.innerHTML = "POKAŻ TABELĘ WYNIKÓW"
        div.appendChild(bt_tab)
        let bt_res = document.createElement("button")
        bt_res.setAttribute("class", "log_button")
        bt_res.setAttribute("id", "przycisk_reset")
        bt_res.innerHTML = "RESET"
        div.appendChild(bt_res)

        document.getElementById("przycisk_loguj").onclick = function () {
            net.loguj()
        }
        document.getElementById("przycisk_tablica_wyników").onclick = function () {
            net.showScoreTable()
        }
        document.getElementById("przycisk_reset").onclick = function () {
            net.serverReset()
        }
    }
}
export { Ui }