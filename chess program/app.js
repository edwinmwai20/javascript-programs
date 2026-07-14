const gameboard = document.querySelector('#gameboard')
const playerDisplay = document.querySelector('#player')
const infoDisplay = document.querySelector('#info-diplay')
const width = 8

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
]

let currentPlayer = 'white'
let startPositionId = null
let draggedElement = null

function createBoard() {
    startPieces.forEach((piece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = piece
        square.setAttribute('square-id', i)

        if (square.firstChild) {
            square.firstChild.setAttribute('draggable', true)
        }

        const row = Math.floor(i / width)
        const col = i % width
        square.classList.add((row + col) % 2 === 0 ? 'beige' : 'brown')

        // Colour the piece based on which side of the board it started on.
        const path = square.querySelector('path')
        if (path) {
            if (i <= 15) {
                path.classList.add('black')
            } else if (i >= 48) {
                path.classList.add('white')
            }
        }

        gameboard.append(square)
    })
}

createBoard()

const allSquares = document.querySelectorAll('#gameboard .square')

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('drop', dragDrop)
})

playerDisplay.textContent = currentPlayer

function getSquare(id) {
    return gameboard.children[id]
}

function getPieceInfo(square) {
    const pieceDiv = square.querySelector(':scope > .piece')
    if (!pieceDiv) return null
    const path = pieceDiv.querySelector('path')
    const color = path && path.classList.contains('white') ? 'white' : 'black'
    return { type: pieceDiv.id, color, pieceDiv }
}

function dragStart(e) {
    const pieceDiv = e.target.closest('.piece')
    if (!pieceDiv) return
    draggedElement = pieceDiv
    startPositionId = Number(pieceDiv.parentNode.getAttribute('square-id'))
}

function dragOver(e) {
    e.preventDefault()
}

function dragDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    if (draggedElement === null || startPositionId === null) return

    const targetSquare = e.target.closest('.square')
    if (!targetSquare) return

    const targetId = Number(targetSquare.getAttribute('square-id'))
    if (targetId === startPositionId) return

    const startSquare = getSquare(startPositionId)
    const pieceInfo = getPieceInfo(startSquare)

    if (!pieceInfo) return

    if (pieceInfo.color !== currentPlayer) {
        infoDisplay.textContent = `It's ${currentPlayer}'s turn`
        return
    }

    const targetInfo = getPieceInfo(targetSquare)

    if (targetInfo && targetInfo.color === currentPlayer) {
        infoDisplay.textContent = "You can't capture your own piece"
        return
    }

    if (!isValidMove(pieceInfo.type, pieceInfo.color, startPositionId, targetId, !!targetInfo)) {
        infoDisplay.textContent = 'Invalid move'
        return
    }

    // Capture: clear whatever is on the target square first.
    targetSquare.innerHTML = ''
    targetSquare.appendChild(draggedElement)
    draggedElement.setAttribute('draggable', true)

    infoDisplay.textContent = ''
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white'
    playerDisplay.textContent = currentPlayer

    draggedElement = null
    startPositionId = null
}

function isPathClear(startId, targetId) {
    const startRow = Math.floor(startId / width)
    const startCol = startId % width
    const targetRow = Math.floor(targetId / width)
    const targetCol = targetId % width

    const rowStep = Math.sign(targetRow - startRow)
    const colStep = Math.sign(targetCol - startCol)

    let r = startRow + rowStep
    let c = startCol + colStep

    while (r !== targetRow || c !== targetCol) {
        const id = r * width + c
        if (getPieceInfo(getSquare(id))) return false
        r += rowStep
        c += colStep
    }

    return true
}

function isValidMove(type, color, startId, targetId, isCapture) {
    const startRow = Math.floor(startId / width)
    const startCol = startId % width
    const targetRow = Math.floor(targetId / width)
    const targetCol = targetId % width

    const rowDiff = targetRow - startRow
    const colDiff = targetCol - startCol
    const absRow = Math.abs(rowDiff)
    const absCol = Math.abs(colDiff)

    switch (type) {
        case 'pawn': {
            const direction = color === 'white' ? -1 : 1
            const startingRow = color === 'white' ? 6 : 1

            if (colDiff === 0 && !isCapture) {
                if (rowDiff === direction) return true
                if (
                    rowDiff === 2 * direction &&
                    startRow === startingRow &&
                    isPathClear(startId, targetId)
                ) return true
                return false
            }

            if (absCol === 1 && rowDiff === direction && isCapture) return true

            return false
        }

        case 'knight':
            return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2)

        case 'bishop':
            return absRow === absCol && absRow !== 0 && isPathClear(startId, targetId)

        case 'rook':
            return (
                (rowDiff === 0 || colDiff === 0) &&
                !(rowDiff === 0 && colDiff === 0) &&
                isPathClear(startId, targetId)
            )

        case 'queen':
            return (
                (absRow === absCol || rowDiff === 0 || colDiff === 0) &&
                !(rowDiff === 0 && colDiff === 0) &&
                isPathClear(startId, targetId)
            )

        case 'king':
            return absRow <= 1 && absCol <= 1 && !(rowDiff === 0 && colDiff === 0)

        default:
            return false
    }
}