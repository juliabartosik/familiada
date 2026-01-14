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

let finalQuestions = [
    { q: "Więcej niż jedno zwierzę to...", answers: { "LAMA": 42, "OWCA": 33, "STADO": 15, "WATAHA": 10, "MROWISKO": 5 } },
    { q: "Przedmiot w piórniku?", answers: { "DLUGOPIS": 50, "OLOWEK": 30, "GUMKA": 15, "LINIJK": 5 } },
    { q: "Coś, co kładziemy na chleb?", answers: { "MASLO": 40, "SZYNKA": 25, "SER": 20, "DZEM": 10 } },
    { q: "Dzień tygodnia na 'P'?", answers: { "PONIEDZIALEK": 60, "PIATEK": 35 } },
    { q: "Zwierzę na literę 'K'?", answers: { "KOT": 45, "PIES": 0, "KON": 30, "KROWA": 20 } }
];

let finalState = {
    active: true,
    currentPlayer: 1,
    p1: {
        answers: [],
        points: [],
        revealed: [false, false, false, false, false],
        pointsRevealed: [false, false, false, false, false]
    },
    p2: {
        answers: [],
        points: [],
        revealed: [false, false, false, false, false],
        pointsRevealed: [false, false, false, false, false]
    }
}

let currentQuestionIndex = 0;
let gameState = {
    activeQuestion: questions[currentQuestionIndex].question,
    answers: questions[currentQuestionIndex].answers.map(a => ({ ...a, revealed: false })),
    teamAStrikes: 0,
    teamBStrikes: 0,
    teamAPoints: 0,
    teamBPoints: 0,
    winner: null,
    lastAction: null,
    boardLocked: false,
    finalState: {
        active: false,
        currentPlayer: 1,
        p1: { answers: [], points: [], revealed: Array(5).fill(false), pointsRevealed: Array(5).fill(false) },
        p2: { answers: [], points: [], revealed: Array(5).fill(false), pointsRevealed: Array(5).fill(false) }
    }
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

        if (gameState.boardLocked && !['next-question', 'reset-strikes', 'reset-buzzer', 'resetStrikeA', 'resetStrikeB'].includes(data.type)) {
            return;
        }

        switch (data.type) {
            case 'reveal':
                if (gameState.answers[data.index]) {
                    if (!gameState.answers[data.index].revealed) {
                        gameState.answers[data.index].revealed = true;
                        gameState.lastAction = 'reveal';
                        console.log(`[${time}] ODKRYCIE: Poz. ${data.index + 1} (${gameState.answers[data.index].text})`);
                    }
                } else {
                    console.log(`[${time}] BŁĄD: Próba odkrycia nieistniejącego indeksu: ${data.index}`);
                }
                break;

            case 'strikeA':
                if (gameState.winner === "DRUŻYNA MONIKI" || !gameState.winner) {
                    gameState.teamAStrikes = Math.min(gameState.teamAStrikes + 1, 3);
                    gameState.lastAction = 'strikeA';
                    if (gameState.teamAStrikes === 3 && gameState.teamBStrikes < 3) {
                        gameState.winner = 'DRUŻYNA SZYMONA';
                    } else if (gameState.teamAStrikes === 3 && gameState.teamBStrikes === 3) {
                        handleAutoFinish('DRUŻYNA SZYMONA');
                    }
                }
                break;

            case 'strikeB':
                if (gameState.winner === "DRUŻYNA SZYMONA" || !gameState.winner) {
                    gameState.teamBStrikes = Math.min(gameState.teamBStrikes + 1, 3);
                    gameState.lastAction = 'strikeB';
                    if (gameState.teamBStrikes === 3 && gameState.teamAStrikes < 3) {
                        gameState.winner = 'DRUŻYNA MONIKI';
                    } else if (gameState.teamAStrikes === 3 && gameState.teamBStrikes === 3) {
                        handleAutoFinish('DRUŻYNA MONIKI');
                    }
                }
                break;

            case 'resetStrikeA':
                gameState.teamAStrikes = 0;
                gameState.lastAction = 'reset-strikes';
                break;

            case 'resetStrikeB':
                gameState.teamBStrikes = 0;
                gameState.lastAction = 'reset-strikes';
                break;

            case 'reset-buzzer':
                gameState.winner = null;
                gameState.lastAction = 'reset-buzzer';
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
        }
        io.emit('update', gameState);
    });

    socket.on('final-action', (data) => {
        const { type, player, index, val } = data;
        const fs = gameState.finalState; // Operujemy na tym obiekcie
        const pKey = player === 1 ? 'p1' : 'p2';

        switch (type) {
            case 'start-final':
                fs.active = true;
                console.log("URUCHOMIONO FINAŁ");
                break;

            case 'submit-ans':
                if (fs[pKey].answers.length < 5) {
                    const answerUpper = val.toUpperCase().trim();
                    fs[pKey].answers.push(answerUpper);

                    const qIdx = fs[pKey].answers.length - 1;
                    const points = finalQuestions[qIdx].answers[answerUpper] || 0;
                    fs[pKey].points.push(points);

                    console.log(`Pytanie ${qIdx + 1}, Gracz ${player}: ${answerUpper} (${points} pkt)`);
                }
                break;

            case 'reveal-ans':
                fs[pKey].revealed[index] = true;
                break;

            case 'reveal-pts':
                fs[pKey].pointsRevealed[index] = true;
                break;

            case 'switch-player':
                fs.currentPlayer = 2;
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