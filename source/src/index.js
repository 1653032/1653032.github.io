import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick= {props.onClick} style={{background: props.color}}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderBoard(){
        const board = [];
        for(let i = 0; i < this.props.settings.size;i++){
            board.push(
                <div className="board-row">
                    {this.renderRow(this.props.settings.size,i)}
                </div>
            )
        }
        return board;
    }

    renderRow(size,line){
        const row = [];
        for(let i = 0; i < size;i++){
            row.push(this.renderSquare((size*line)+i))
        }

        return row;
    }

    renderSquare(i) {
        return <Square color={this.props.history.colors[i]} value={this.props.history.squares[i]} onClick={() => this.props.onClick(i)}/>;
    }

    render() {
        return (
            <div>
                {this.renderBoard()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          size: 20, //any more than 50 will make the board misaligns.
          xNext: true, // who goes first
          winCond: 5, // <= size of course
          winner: null,
          stepNum: 0,
        };
        this.state.history = [{
            squares: Array(this.state.size*this.state.size).fill(null),
            colors: Array(this.state.size*this.state.size).fill("white")
        }];
        this.state.colors =  Array(this.state.size*this.state.size).fill("white");
        // this.state.horizontal = Array(this.state.size).fill(0);
        // this.state.vertical = Array(this.state.size).fill(0);
    }

    jumpTo(step){
        console.log("ok");
        this.setState({
            stepNum: step,
            xIsNext: (step % 2) === 0,
          });
    }

    newGame(){
        this.setState({
            history: [{
                squares: Array(this.state.size*this.state.size).fill(null),
                colors: Array(this.state.size*this.state.size).fill("white")
            }],
            stepNum: 0,
            winner: null,
            xNext: true,
            colors: Array(this.state.size*this.state.size).fill("white")
        })
    }
    
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNum];
        
        let status = 0;
        if(this.state.winner)
            if(this.state.winner !== 'None')
                status = 'Winner: ' + this.state.winner;
            else status = 'Draw!'
        else status = 'Next player: ' + (this.state.xNext ? 'X' : 'O');

        const moves = history.map((step, move) => {
        const desc = move ?
            'Go to move #' + move :
            'Go to game start';
        return (
            <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
        );
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board settings={this.state} history={current} onClick={(i) => this.handleClick(i)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{this.state.winner && <button onClick={()=> this.newGame()}>Start a new game</button>}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    // find longest horizontal sequence of current player from current move.
    checkRow(squares, size, winCond,hori,vert,player){
        let start = Math.max(0,hori-(winCond-1));
        let end = Math.min(hori+(winCond-1),size-1);
        let count = 0;
        let winningSquares = [];
        let line = vert*size;
        let max = 1;

        for(start;start <= end;start++){
            if(squares[line + start] === player){
                count++;
                winningSquares.push(line + start);
            } else {
                if(count > max)
                    max = count;
                count = 0;
                
            }
        }

        if(count > max)
            max = count;

        if(max === winCond){
            let newColor = this.state.colors.slice();
            winningSquares.forEach(element => {
                newColor[element] = "yellow";
            });
            this.setState((prevState) => ({
                colors: this.updateColorArray(prevState.colors,newColor),
              }));
            return 1;
        }
        else return 0;
    }

    // find longest vertical sequence of current player from current move.
    checkCol(squares, size, winCond, hori,vert,player){
        let start = Math.max(0,vert-(winCond-1));
        let end = Math.min(vert+(winCond-1),size-1);
        let count = 0;
        let winningSquares = [];
        let col = hori;
        let max = 1;

        for(start;start <= end;start++){
            if(squares[start*size + col] === player){
                count++;
                winningSquares.push(start*size + col);
            } else {
                if(count > max)
                    max = count;
                count = 0;
            }
        }

        if(count > max)
            max = count;

            if(max === winCond){
                let newColor = this.state.colors.slice();
                winningSquares.forEach(element => {
                    newColor[element] = "yellow";
                });
                this.setState((prevState) => ({
                    colors: this.updateColorArray(prevState.colors,newColor),
                  }));
                return 1;
            }
            else return 0;
    }

    // check 2 halves of the diagonal sequence of current player from current move.
    checkDiag(squares, size, winCond, hori,vert,player){
        let count = 1;
        let i = 1,curVert = vert, curHori = hori;
        let winningSquares = [];

        while (i < winCond){
            curVert = vert + i;
            curHori = hori + i;

            if(curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } 
            }

            curVert = vert - i;
            curHori = hori - i;

            if(curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } 
            }

            i++;
        }

        if(count === winCond){
            let newColor = this.state.colors.slice();
            winningSquares.forEach(element => {
                newColor[vert*size + hori] = "yellow";
                newColor[element] = "yellow";
            });
            this.setState((prevState) => ({
                colors: this.updateColorArray(prevState.colors,newColor),
              }));
            return 1;
        }
        else return 0;
    }

    // check 2 halves of the antidiagonal sequence of current player from current move.
    checkAntiDiag(squares, size, winCond,hori,vert,player){
        let count = 1;
        let i = 1,curVert = vert, curHori = hori;
        let winningSquares = [];

        while (i < winCond){
            curVert = vert + i;
            curHori = hori - i;

            if(curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } 
            }

            curVert = vert - i;
            curHori = hori + i;

            if(curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } 
            }

            i++;
        }
        
        if(count === winCond){
            let newColor = this.state.colors.slice();
            winningSquares.forEach(element => {
                newColor[element] = "yellow";
                newColor[vert*size + hori] = "yellow";
            });
            this.setState((prevState) => ({
                colors: this.updateColorArray(prevState.colors,newColor),
              }));
            return 1;
        }
        else return 0;
    }

    updateColorArray(oldColor,newColor){
        newColor.forEach((element,index) => {
            if(element === 'yellow')
                oldColor[index] = 'yellow';            
        });

        return oldColor;
    }

    handleClick(i) {
        const history = this.state.history.slice(0,this.state.stepNum +1);
        let vert = Math.floor(i / this.state.size);
        let hori = i % this.state.size;
        let player = this.state.xNext ? 'X' : 'O';
        const squares = history[history.length-1].squares.slice();
        const colors = this.state.colors.slice();
        
        
        //someone won or the square's already been occupied
        if(squares[i] !== null || this.state.winner !== null) return;
        console.log(history)
        squares[i] = player;

        if(this.checkCol(squares,this.state.size,this.state.winCond,hori,vert,player) 
        || this.checkRow(squares,this.state.size,this.state.winCond,hori,vert,player)
        || this.checkDiag(squares,this.state.size,this.state.winCond,hori,vert,player)
        || this.checkAntiDiag(squares,this.state.size,this.state.winCond,hori,vert,player)
        ){
            this.checkCol(squares,this.state.size,this.state.winCond,hori,vert,player); 
            this.checkRow(squares,this.state.size,this.state.winCond,hori,vert,player);
            this.checkDiag(squares,this.state.size,this.state.winCond,hori,vert,player);
            this.checkAntiDiag(squares,this.state.size,this.state.winCond,hori,vert,player);

            this.setState((prevState) => ({
                history: history.concat([{
                    squares: squares,
                    colors: prevState.colors
                }]),
                stepNum: history.length,
                squares: squares,
                xNext: !this.state.xNext,
                winner: player,
            }));
            return;
        }
        
        console.log(history)
        this.setState({
            history: history.concat([{
                squares: squares,
                colors: colors,
            }]),
            stepNum: history.length,
            xNext: !this.state.xNext,
        });
        console.log(history)

        if(!squares.includes(null)){
            this.setState({
                winner: 'None',
            })
            return;
        }
    }


}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);