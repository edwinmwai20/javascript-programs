const gameboard = document.querySelector('#gameboard')
const playerDisplay = document.querySelector('#player')
const infoDisplay = document.querySelector("#info-diplay")
const width = 8
const startPieces = [
    rook,knight,bishop,queen,king,bishop,knight,rook,
    pawn,pawn,pawn,pawn,pawn,pawn,pawn,pawn,
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    rook,knight,bishop,queen,king,bishop,knight,rook,
    pawn,pawn,pawn,pawn,pawn,pawn,pawn,pawn,
]



function creatBoard(){
    startPieces.forEach((startPieces) =>{
        const square = document.createElement('div')
        square.classList.add('square')
        square.classList.add('beige')
        gameboard.append(square)
    })
}