document.addEventListener('DOMContentLoaded', function() {
    //inicia jogo com as mensagens de xeque mate e movimento inválido escondidas
    document.querySelector('.alert-danger').style.display = 'none'
    document.querySelector('.alert-success').style.display = 'none'
    document.querySelector('.alert-warning').style.display = 'none'

    //acessando elementos html a serem manipulados
    const gameBoard = document.querySelector("#gameboard");
    const playerDisplay = document.querySelector("#player");
    const infoMove = document.querySelector("#info-move");
    const infoWin = document.querySelector("#info-win");
    const infoXeque = document.querySelector("#info-xeque");
    const movedPiecesDiv = document.querySelector('.rectangle');

    const width = 8;
    let playerGo = 'white'
    playerDisplay.textContent = 'white'

    let whiteCapturedCount = 0;
    let blackCapturedCount = 0;

    //definindo as posições iniciais das peças no tabuleiro
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
            //valida se o tabuleiro não está bloqueado
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
                square.firstChild.classList.add('white')
                square.firstChild.firstChild.classList.add('white')
            }
            if(i >= 48){
                square.firstChild.classList.add('black')
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

        //condicionais para colorir os quadrados do tabuleiro de acordo com o movimento da peça
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
        //valida se a peça é do jogador atual
        const correctGo = draggedElement.firstChild.classList.contains(playerGo)
        //verifica se existe uma peça no quadrado de destino
        const taken = e.target.classList.contains('piece')
        //chama função de validação do movimento da peça
        const valid = checkIfValid(e.target)
        const opponentGo = playerGo === 'black' ? 'white' : 'black'
        //verifica se a peça no quadrado de destino pertence ao oponente
        const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)

        if(correctGo){
            if(takenByOpponent && valid){
                //se a peça é válida, adiciona ao quadrado
                e.target.parentNode.append(draggedElement)
                const capturedPieceType = e.target.firstChild.id
                //se a peça for capturada, remove ela do tabuleiro
                e.target.remove()

                const startSquare = document.querySelector(`[square-id="${startPositionId}"]`)
                const endSquare = e.target
                const pieceType = draggedElement.id

                const startSquareCoords = getSquareCoordinates(startSquare, playerGo)
                const endSquareCoords = getSquareCoordinates(endSquare, playerGo)

                //cria o texto da listagem do movimento e captura
                const moveText = `${pieceType.toLowerCase()} from ${startSquareCoords} to ${endSquareCoords}`
                const captureText = ` captured ${capturedPieceType.toLowerCase()}`
                addMoveToLog(moveText + captureText)

                //atualiza a contagem de peças capturadas dos jogadores
                if (playerGo === 'white') {
                    whiteCapturedCount++;
                    document.getElementById('white-captured').textContent = `Captured by White: ${whiteCapturedCount}`
                } else {
                    blackCapturedCount++;
                    document.getElementById('black-captured').textContent = `Captured by Black: ${blackCapturedCount}`  
                }

                checkForWin()
                changePlayer()
                return
            }
            if(taken && !takenByOpponent){
                //seta como visível o alert caso o movimento não seja válido
                document.querySelector('.alert-danger').style.display = 'block'
                infoMove.textContent = "You cannot go here!"
                setTimeout(() => infoMove.textContent = "", 2000)
                setTimeout(() => document.querySelector('.alert-danger').style.display = 'none', 2000)
                return
            }
            if(valid){
                //adiciona a peça movida ao quadrado escolhido
                e.target.append(draggedElement)

                //valida se algum rei está em xeque
                isInCheck('white')
                isInCheck('black')

                const startSquare = document.querySelector(`[square-id="${startPositionId}"]`)
                const endSquare = e.target
                const pieceType = draggedElement.id
                const startSquareCoords = getSquareCoordinates(startSquare, playerGo)
                const endSquareCoords = getSquareCoordinates(endSquare, playerGo)

                //cria texto do registro do movimento
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
    

    function getSquareCoordinates(square, playerGo) {
        if(playerGo !== 'white') {
            revertIds();
        }

        const row = Math.floor(Number(square.getAttribute('square-id')) / width) + 1
        const col = Number(square.getAttribute('square-id')) % width + 1

        if(playerGo !== 'white'){
            reverseIds();
        }

        return `${String.fromCharCode(96 + col)}${row}`
    }

    //função para adicionar na div o registro do movimento
    function addMoveToLog(moveText) {
        const moveInfo = document.createElement('div')
        moveInfo.textContent = moveText
        movedPiecesDiv.appendChild(moveInfo)
    }

    function checkIfValid(target, actionPieceSquare){
        const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'))
        const startId = actionPieceSquare ? Number(actionPieceSquare.getAttribute('square-id')) : Number(startPositionId)
        const piece = actionPieceSquare ? actionPieceSquare.firstChild.id : draggedElement.id

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

    //função para validar se o rei está em xeque
    function isInCheck(playerColor) {
        let result = false

        const kings = Array.from(document.querySelectorAll('#king'))
        const kingSquare = kings.find(king => king.firstChild.classList.contains(playerColor));
        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const allSquares = document.querySelectorAll('.square');
    
        // Verifica se há alguma peça do oponente que pode atacar o rei
        for (const square of allSquares) {
            const piece = square.firstChild

            if (piece && piece.classList.contains(opponentColor)) {
                const validMove = checkIfValid(kingSquare, square)

                if (validMove) {
                    result = true
                }
            }
        }

        //coloca na tela o alert que o rei está em xeque durante 2 segundos
        if(result) {
            document.querySelector('.alert-warning').style.display = 'block'
            infoXeque.textContent = `${playerColor} King is in check!`
            setTimeout(() => infoXeque.textContent = "", 2000)
            setTimeout(() => document.querySelector('.alert-warning').style.display = 'none', 2000)
        }
        return result;
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

    //função para validar vitória
    function checkForWin(){

        const kings = Array.from(document.querySelectorAll('#king'))

        if(!kings.some(king => king.firstChild.classList.contains('white'))){
            //coloca na tela o alert de que as brancas venceram
            document.querySelector('.alert-success').style.display = 'block'
            infoWin.textContent = "Black player wins!"
            const allSquares = document.querySelectorAll('.square')
            //trava o tabuleiro
            allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
        }
        if(!kings.some(king => king.firstChild.classList.contains('black'))){
            //coloca na tela o alert de que as pretas venceram
            document.querySelector('.alert-success').style.display = 'block'
            infoWin.textContent = "White player wins!"
            const allSquares = document.querySelectorAll('.square')
            //trava o tabuleiro
            allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
        }
    }
});
