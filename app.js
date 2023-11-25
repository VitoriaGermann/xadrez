document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.querySelector("#gameboard");
    const playerDisplay = document.querySelector("#player");
    const infoDisplay = document.querySelector("#info-display");

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
    ];

    //função para inicializar o tabuleiro
    function createBoard() {
        startPieces.forEach((startPiece, i) => {

            const square = document.createElement('div');
            square.classList.add('square');
            square.innerHTML = startPiece
            square.firstChild?.setAttribute('draggable', true)
            square.setAttribute('square-id', i)
            const row = Math.floor((63 - i) / 8) + 1

            //condicional para colorir de forma correta o tabuleiro
            if(row % 2 === 0){
                square.classList.add(i % 2 === 0 ? "brown" : "beige")
            } else{
                square.classList.add(i % 2 === 0 ? "beige" : "bronw")
            }
            
            //condicional para colorir de forma correta as peças
            if(i <= 15){
                square.firstChild.firstChild.classList.add('black')
            }
            if(i >= 48){
                square.firstChild.firstChild.classList.add('white')
            }
            gameBoard.append(square);
        });
    }

    createBoard();

    const allSquares = document.querySelectorAll("#gameboard .square")

    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart)
        square.addEventListener('dragover', dragOver)
        square.addEventListener('drop', dragDrop)
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
    }

    function dragDrop (e){
        e.stopPropagation()
        const taken = e.target.classList.contains('piece')
        //e.target.parentNode.append(draggedElement)
        //e.target.remove()

        changePlayer()
    }

    //função para alternar a vez dos jogadores
    function changePlayer(){
        if(playerGo === "white"){
            playerGo = "black"
            playerDisplay.textContent = "black"
        } else{
            playerGo = "white"
            playerDisplay.textContent = "white"
        }
    }
});
