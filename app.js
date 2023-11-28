document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.alert-danger').style.display = 'none'
    document.querySelector('.alert-success').style.display = 'none'

    const gameBoard = document.querySelector("#gameboard");
    const playerDisplay = document.querySelector("#player");
    const infoMove = document.querySelector("#info-move");
    const infoWin = document.querySelector("#info-win");
    const movedPiecesDiv = document.querySelector('.rectangle');

    const width = 8;
    let playerGo = 'white'
    playerDisplay.textContent = 'white'

    const startPieces = [
        rook, knight, bishop, queen, king, bishop, knight, rook,
        pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
        rook, knight, bishop, queen, king, bishop, knight, rook
    ]

    //função para inicializar o tabuleiro
    function createBoard() {
        startPieces.forEach((startPiece, i) => {

            const square = document.createElement('div');
            square.classList.add('square')
            square.innerHTML = startPiece
            square.firstChild?.setAttribute('draggable', true)
            square.setAttribute('square-id', i)
            const row = Math.floor((63 - i) / 8) + 1

            //condicional para colorir de forma correta o tabuleiro
            if(row % 2 === 0){
                square.classList.add(i % 2 === 0 ? "beige" : "brown")
            } else{
                square.classList.add(i % 2 === 0 ? "brown" : "beige")
            }
            
            //condicional para colorir de forma correta as peças
            if(i <= 15){
                square.firstChild.firstChild.classList.add('white')
            }
            if(i >= 48){
                square.firstChild.firstChild.classList.add('black')
            }
            gameBoard.append(square)
        });
    }

    createBoard()

    const allSquares = document.querySelectorAll(".square")

    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart)
        square.addEventListener('dragover', dragOver)
        square.addEventListener('drop', dragDrop)
        square.addEventListener('dragleave', dragLeave)
    })

    let startPositionId
    let draggedElement

    //funções para poder arrastas as peças na tela

    function dragStart (e){
        startPositionId = e.target.parentNode.getAttribute('square-id')
        draggedElement = e.target
    }

    function dragOver (e){
        e.preventDefault()
        const validMove = checkIfValid(e.target)

        if (validMove) {
            e.target.classList.add('valid-move')
            e.target.classList.remove('invalid-move')
            setTimeout(() => e.target.classList.remove('valid-move'), 1000)
        } else{
            e.target.classList.add('invalid-move')
            e.target.classList.remove('valid-move');
            setTimeout(() => e.target.classList.remove('invalid-move'), 1000)
        }

    }

    function dragDrop (e){
        e.stopPropagation()
        const correctGo = draggedElement.firstChild.classList.contains(playerGo)
        const taken = e.target.classList.contains('piece')
        const valid = checkIfValid(e.target)
        const opponentGo = playerGo === 'black' ? 'white' : 'black'
        const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)

        if(correctGo){
            if(takenByOpponent && valid){
                e.target.parentNode.append(draggedElement)
                const capturedPieceType = e.target.firstChild.id
                e.target.remove()

                const startSquare = document.querySelector(`[square-id="${startPositionId}"]`)
                const endSquare = e.target
                const pieceType = draggedElement.id

                const startSquareCoords = getSquareCoordinates(startSquare)
                const endSquareCoords = getSquareCoordinates(endSquare)

                const moveText = `${pieceType.toLowerCase()} from ${startSquareCoords} to ${endSquareCoords}`
                const captureText = ` captured ${capturedPieceType.toLowerCase()}`
                addMoveToLog(moveText + captureText)

                checkForWin()
                changePlayer()
                return
            }
            if(taken && !takenByOpponent){
                document.querySelector('.alert-danger').style.display = 'block'
                infoMove.textContent = "You cannot go here!"
                setTimeout(() => infoMove.textContent = "", 2000)
                setTimeout(() => document.querySelector('.alert-danger').style.display = 'none', 2000)
                return
            }
            if(valid){
                e.target.append(draggedElement)

                const startSquare = document.querySelector(`[square-id="${startPositionId}"]`)
                const endSquare = e.target
                const pieceType = draggedElement.id

                const startSquareCoords = getSquareCoordinates(startSquare)
                const endSquareCoords = getSquareCoordinates(endSquare)

                const moveText = `${pieceType.toLowerCase()} from ${startSquareCoords} to ${endSquareCoords}`
                addMoveToLog(moveText)

                e.target.classList.add('valid-move')
                setTimeout(() => e.target.classList.remove('valid-move'), 1000)

                checkForWin()
                changePlayer()
                return
            }
        }
    }

    function dragLeave(e) {
        e.target.classList.remove('valid-move', 'invalid-move');
    }
    

    function getSquareCoordinates(square) {
        const row = Math.floor(Number(square.getAttribute('square-id')) / width) + 1
        const col = Number(square.getAttribute('square-id')) % width + 1
        return `${String.fromCharCode(96 + col)}${row}`
    }

    function addMoveToLog(moveText) {
        const moveInfo = document.createElement('div')
        moveInfo.textContent = moveText
        movedPiecesDiv.appendChild(moveInfo)
    }

    function checkIfValid(target){
        const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'))
        const startId = Number(startPositionId)
        const piece = draggedElement.id

        console.log('targetId', targetId)
        console.log('startId', startId)
        console.log('piece', piece)
    
        switch(piece){
            case 'pawn' :
                const starterRow = [8, 9, 10, 11, 12, 13, 14, 15]
                if(
                    starterRow.includes(startId) && startId + width * 2 === targetId ||
                    startId + width === targetId ||
                    startId + width - 1 === targetId && document.querySelector(`[square-id="${startId+width-1}"]`).firstChild ||
                    startId + width + 1 === targetId && document.querySelector(`[square-id="${startId+width+1}"]`).firstChild
                )
                {return true} 
            break

            case 'knight' :
                if(
                    startId + width * 2 + 1 === targetId ||
                    startId + width * 2 - 1 === targetId ||
                    startId + width - 2 === targetId ||
                    startId + width + 2 === targetId ||
                    startId - width * 2 + 1 === targetId ||
                    startId - width * 2 - 1 === targetId ||
                    startId - width - 2 === targetId ||
                    startId - width + 2 === targetId
                )
                {return true}
            break

            case 'bishop' : 
                if(
                    //uma direção
                    startId + width + 1 === targetId ||
                    startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild ||
                    startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild ||
                    startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild  ||
                    startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild  ||
                    startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5+5}"]`).firstChild  ||
                    startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5+5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6+6}"]`).firstChild  ||
                    //segunda direção
                    startId - width - 1 === targetId ||
                    startId - width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild ||
                    startId - width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild ||
                    startId - width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild  ||
                    startId - width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild  ||
                    startId - width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5-5}"]`).firstChild  ||
                    startId - width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5-5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6-6}"]`).firstChild  ||
                    //voltando a peça na primeira direção
                    startId - width + 1 === targetId ||
                    startId - width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild ||
                    startId - width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild ||
                    startId - width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild  ||
                    startId - width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild  ||
                    startId - width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5+5}"]`).firstChild  ||
                    startId - width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5+5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6+6}"]`).firstChild  ||
                    //voltando na segunda direção
                    startId + width - 1 === targetId ||
                    startId + width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild ||
                    startId + width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild ||
                    startId + width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild  ||
                    startId + width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild  ||
                    startId + width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5-5}"]`).firstChild  ||
                    startId + width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5-5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6-6}"]`).firstChild 
                )
                {return true}
            break
            
            case 'rook' :
                if(
                    startId + width === targetId ||
                    startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild ||
                    startId + width * 3 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild ||
                    startId + width * 4 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild ||
                    startId + width * 5 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild ||
                    startId + width * 6 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5}"]`).firstChild ||
                    startId + width * 7 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6}"]`).firstChild ||
                    //
                    startId - width === targetId ||
                    startId - width * 2 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild ||
                    startId - width * 3 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild ||
                    startId - width * 4 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild ||
                    startId - width * 5 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild ||
                    startId - width * 6 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5}"]`).firstChild ||
                    startId - width * 7 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6}"]`).firstChild ||
                    //
                    startId + 1 === targetId ||
                    startId + 2 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild ||
                    startId + 3 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild ||
                    startId + 4 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild ||
                    startId + 5 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild ||
                    startId + 6 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+5}"]`).firstChild ||
                    startId + 7 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+5}"]`).firstChild && !document.querySelector(`[square-id="${startId+6}"]`).firstChild ||
                    //
                    startId - 1 === targetId ||
                    startId - 2 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild ||
                    startId - 3 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild ||
                    startId - 4 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild ||
                    startId - 5 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild ||
                    startId - 6 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild && !document.querySelector(`[square-id="${startI-5}"]`).firstChild ||
                    startId - 7 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-5}"]`).firstChild && !document.querySelector(`[square-id="${startId-6}"]`).firstChild
                )
                {return true}
            break

            case 'queen' :
                if(
                    //uma direção
                    startId + width + 1 === targetId ||
                    startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild ||
                    startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild ||
                    startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild  ||
                    startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild  ||
                    startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5+5}"]`).firstChild  ||
                    startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId+width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5+5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6+6}"]`).firstChild  ||
                    //segunda direção
                    startId - width - 1 === targetId ||
                    startId - width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild ||
                    startId - width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild ||
                    startId - width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild  ||
                    startId - width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild  ||
                    startId - width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5-5}"]`).firstChild  ||
                    startId - width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId-width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5-5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6-6}"]`).firstChild  ||
                    //voltando a peça na primeira direção
                    startId - width + 1 === targetId ||
                    startId - width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild ||
                    startId - width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild ||
                    startId - width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild  ||
                    startId - width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild  ||
                    startId - width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5+5}"]`).firstChild  ||
                    startId - width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId-width+1}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2+2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3+3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4+4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5+5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6+6}"]`).firstChild  ||
                    //voltando na segunda direção
                    startId + width - 1 === targetId ||
                    startId + width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild ||
                    startId + width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild ||
                    startId + width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild  ||
                    startId + width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild  ||
                    startId + width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5-5}"]`).firstChild  ||
                    startId + width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId+width-1}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2-2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3-3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4-4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5-5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6-6}"]`).firstChild ||

                    startId + width === targetId ||
                    startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild ||
                    startId + width * 3 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild ||
                    startId + width * 4 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild ||
                    startId + width * 5 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild ||
                    startId + width * 6 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5}"]`).firstChild ||
                    startId + width * 7 === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*5}"]`).firstChild && !document.querySelector(`[square-id="${startId+width*6}"]`).firstChild ||
                    //
                    startId - width === targetId ||
                    startId - width * 2 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild ||
                    startId - width * 3 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild ||
                    startId - width * 4 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild ||
                    startId - width * 5 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild ||
                    startId - width * 6 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5}"]`).firstChild ||
                    startId - width * 7 === targetId && !document.querySelector(`[square-id="${startId-width}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*2}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*3}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*4}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*5}"]`).firstChild && !document.querySelector(`[square-id="${startId-width*6}"]`).firstChild ||
                    //
                    startId + 1 === targetId ||
                    startId + 2 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild ||
                    startId + 3 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild ||
                    startId + 4 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild ||
                    startId + 5 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild ||
                    startId + 6 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+5}"]`).firstChild ||
                    startId + 7 === targetId && !document.querySelector(`[square-id="${startId+1}"]`).firstChild && !document.querySelector(`[square-id="${startId+2}"]`).firstChild && !document.querySelector(`[square-id="${startId+3}"]`).firstChild && !document.querySelector(`[square-id="${startId+4}"]`).firstChild && !document.querySelector(`[square-id="${startId+5}"]`).firstChild && !document.querySelector(`[square-id="${startId+6}"]`).firstChild ||
                    //
                    startId - 1 === targetId ||
                    startId - 2 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild ||
                    startId - 3 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild ||
                    startId - 4 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild ||
                    startId - 5 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild ||
                    startId - 6 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild && !document.querySelector(`[square-id="${startI-5}"]`).firstChild ||
                    startId - 7 === targetId && !document.querySelector(`[square-id="${startId-1}"]`).firstChild && !document.querySelector(`[square-id="${startId-2}"]`).firstChild && !document.querySelector(`[square-id="${startId-3}"]`).firstChild && !document.querySelector(`[square-id="${startId-4}"]`).firstChild && !document.querySelector(`[square-id="${startId-5}"]`).firstChild && !document.querySelector(`[square-id="${startId-6}"]`).firstChild
                )
                {return true}
            break

            case 'king' :
                if(
                    startId + 1 === targetId ||
                    startId - 1 === targetId ||
                    startId + width === targetId ||
                    startId - width === targetId ||
                    startId + width -1 === targetId ||
                    startId + width +1 === targetId ||
                    startId - width -1 === targetId ||
                    startId - width +1 === targetId
                )
                {return true}
            break
        }
    }

    //função para alternar a vez dos jogadores
    function changePlayer(){
        if(playerGo === "white"){
            reverseIds()
            playerGo = "black"
            playerDisplay.textContent = "black"
        } else{
            revertIds()
            playerGo = "white"
            playerDisplay.textContent = "white"
        }
    }

    function reverseIds(){
        const allSquares = document.querySelectorAll(".square")
        allSquares.forEach((square, i) =>
            square.setAttribute('square-id', (width*width-1) -i))
    }

    function revertIds(){
        const allSquares = document.querySelectorAll(".square")
            allSquares.forEach((square, i) => square.setAttribute('square-id', i))
    }

    function checkForWin(){
        const kings = Array.from(document.querySelectorAll('#king'))
        if(!kings.some(king => king.firstChild.classList.contains('white'))){
            document.querySelector('.alert-success').style.display = 'block'
            infoWin.textContent = "Black player wins!"
            const allSquares = document.querySelectorAll('.square')
            allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
        }
        if(!kings.some(king => king.firstChild.classList.contains('black'))){
            document.querySelector('.alert-success').style.display = 'block'
            infoWin.textContent = "White player wins!"
            const allSquares = document.querySelectorAll('.square')
            allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
        }
    }
});
