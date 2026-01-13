const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let questions = [
    {
        question: "Więcej niż jedno zwierzę to...",
        answers: [
            { text: "Lama", points: 42, revealed: false },
            { text: "Owca", points: 33, revealed: false },
            { text: "Wataha", points: 15, revealed: false },
            { text: "Stado", points: 10, revealed: false },
            { text: "Wataha", points: 5, revealed: false },
            { text: "Mrowisko", points: 2, revealed: false }
        ]
    },
    {
        question: "Przedmiot znajdowany w piórniku?",
        answers: [
            { text: "Długopis", points: 50, revealed: false },
            { text: "Ołówek", points: 30, revealed: false },
            { text: "Gumka", points: 15, revealed: false },
            { text: "Linijka", points: 5, revealed: false }
        ]
    },
    {
        question: "Do kogo Monika mówi kochanie?",
        answers: [
            { text: "Długopis", points: 50, revealed: false },
            { text: "Ołówek", points: 30, revealed: false },
            { text: "Gumka", points: 15, revealed: false },
            { text: "Linijka", points: 5, revealed: false }
        ]
    },
    {
        question: "Jak do Szymona mówi tata Moniki?",
        answers: [
            { text: "Długopis", points: 50, revealed: false },
            { text: "Ołówek", points: 30, revealed: false },
            { text: "Gumka", points: 15, revealed: false },
            { text: "Linijka", points: 5, revealed: false }
        ]
    }
];

let currentQuestionIndex = 0;
let gameState = {
    activeQuestion: questions[currentQuestionIndex].question,
    answers: questions[currentQuestionIndex].answers.map(a => ({ ...a, revealed: false })),
    teamAStrikes: 0,
    teamBStrikes: 0,
    teamAPoints: 0,
    teamBPoints: 0,
    winner: null, // To przechowuje kto aktualnie odpowiada (np. "DRUŻYNA MONIKI")
    lastAction: null,
    boardLocked: false
};

io.on('connection', (socket) => {
    console.log(`[${new Date().toLocaleTimeString()}] Nowe połączenie.`);
    socket.emit('update', gameState);

    socket.on('buzz', (teamName) => {
        if (!gameState.winner && !gameState.boardLocked) {
            gameState.winner = teamName;
            gameState.lastAction = 'buzz';
            console.log(`[${new Date().toLocaleTimeString()}] BUZZER: ${teamName} przejął pytanie.`);
            io.emit('update', gameState);
        }
    });

    socket.on('admin-action', (data) => {
        const time = new Date().toLocaleTimeString();

        // Blokada akcji jeśli runda zakończona (rozdano punkty)
        if (gameState.boardLocked && !['next-question', 'reset-strikes', 'reset-buzzer'].includes(data.type)) {
            return;
        }

        switch (data.type) {
            case 'reveal':
                if (!gameState.answers[data.index].revealed) {
                    gameState.answers[data.index].revealed = true;
                    gameState.lastAction = 'reveal';
                    console.log(`[${time}] ODKRYCIE: Poz. ${data.index + 1} (${gameState.answers[data.index].text})`);
                }
                break;

            case 'strikeA':
                // MONIKA może dostać błąd TYLKO jeśli ona odpowiada LUB nikt nie jest wybrany (buzzer)
                if (gameState.winner === "DRUŻYNA MONIKI" || !gameState.winner) {
                    gameState.teamAStrikes = Math.min(gameState.teamAStrikes + 1, 3);
                    gameState.lastAction = 'strikeA';
                    console.log(`[${time}] BŁĄD MONIKI: Stan ${gameState.teamAStrikes}/3`);

                    if (gameState.teamAStrikes === 3 && gameState.teamBStrikes < 3) {
                        gameState.winner = 'DRUŻYNA SZYMONA';
                        console.log(`[${time}] PRZEJĘCIE: Szansa dla Szymona.`);
                    } else if (gameState.teamAStrikes === 3 && gameState.teamBStrikes === 3) {
                        handleAutoFinish('DRUŻYNA SZYMONA');
                    }
                } else {
                    console.log(`[${time}] BLOKADA: Nie można dać błędu Monice, gdy odpowiada Szymon!`);
                }
                break;

            case 'strikeB':
                // SZYMON może dostać błąd TYLKO jeśli on odpowiada LUB nikt nie jest wybrany
                if (gameState.winner === "DRUŻYNA SZYMONA" || !gameState.winner) {
                    gameState.teamBStrikes = Math.min(gameState.teamBStrikes + 1, 3);
                    gameState.lastAction = 'strikeB';
                    console.log(`[${time}] BŁĄD SZYMONA: Stan ${gameState.teamBStrikes}/3`);

                    if (gameState.teamBStrikes === 3 && gameState.teamAStrikes < 3) {
                        gameState.winner = 'DRUŻYNA MONIKI';
                        console.log(`[${time}] PRZEJĘCIE: Szansa dla Moniki.`);
                    } else if (gameState.teamAStrikes === 3 && gameState.teamBStrikes === 3) {
                        handleAutoFinish('DRUŻYNA MONIKI');
                    }
                } else {
                    console.log(`[${time}] BLOKADA: Nie można dać błędu Szymonowi, gdy odpowiada Monika!`);
                }
                break;

            case 'reset-strikes':
                gameState.teamAStrikes = 0;
                gameState.teamBStrikes = 0;
                gameState.lastAction = 'reset-strikes';
                console.log(`[${time}] RESET: Wyzerowano błędy obu drużyn.`);
                break;

            case 'reset-buzzer':
                gameState.winner = null;
                gameState.lastAction = 'reset-buzzer';
                console.log(`[${time}] RESET: Buzzer wolny.`);
                break;

            case 'addPointsA':
                awardPoints('A');
                break;

            case 'addPointsB':
                awardPoints('B');
                break;

            case 'next-question':
                currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
                gameState = {
                    ...gameState,
                    activeQuestion: questions[currentQuestionIndex].question,
                    answers: questions[currentQuestionIndex].answers.map(a => ({ ...a, revealed: false })),
                    teamAStrikes: 0,
                    teamBStrikes: 0,
                    winner: null,
                    lastAction: 'next-question',
                    boardLocked: false
                };
                console.log(`[${time}] NOWE PYTANIE: ${gameState.activeQuestion}`);
                break;

            case 'resetStrikeA':
                gameState.teamAStrikes = 0;
                gameState.lastAction = 'reset-strikes';
                console.log(`[${new Date().toLocaleTimeString()}] RESET: Wyzerowano błędy Moniki.`);
                break;

            case 'resetStrikeB':
                gameState.teamBStrikes = 0;
                gameState.lastAction = 'reset-strikes';
                console.log(`[${new Date().toLocaleTimeString()}] RESET: Wyzerowano błędy Szymona.`);
                break;
        }

        io.emit('update', gameState);
    });

    function awardPoints(team) {
        if (gameState.boardLocked) return;
        const pts = gameState.answers.filter(a => a.revealed).reduce((s, a) => s + a.points, 0);

        if (team === 'A') gameState.teamAPoints += pts;
        else gameState.teamBPoints += pts;

        gameState.winner = null;
        gameState.boardLocked = true;
        gameState.lastAction = 'points-assigned';
        console.log(`[SYSTEM] Punkty (${pts}) dodane dla ${team === 'A' ? 'Moniki' : 'Szymona'}.`);
    }

    function handleAutoFinish(luckyTeam) {
        console.log(`[SYSTEM] Koniec rundy (3:3). Punkty dla: ${luckyTeam}`);
        awardPoints(luckyTeam === 'DRUŻYNA MONIKI' ? 'A' : 'B');
        gameState.answers.forEach(a => a.revealed = true);
    }
});

server.listen(3001, () => {
    console.log('--- SERWER FAMILIADY STARTUJE ---');
    console.log('Adres: http://localhost:3001\n\n');
});