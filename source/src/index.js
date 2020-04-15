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
          winCond: 5, // number of continuous squares to win 
          winner: null,
          stepNum: 0,
          settingsMsg: null,
          sortOrder: true,
        };
        this.sizeInput= React.createRef();
        this.winCondInput= React.createRef();
        this.state.history = [{
            squares: Array(this.state.size*this.state.size).fill(null),
            colors: Array(this.state.size*this.state.size).fill("white"),
            winner: null
        }];
        this.state.colors =  Array(this.state.size*this.state.size).fill("white");
    }

    jumpTo(step){
        this.setState({
            stepNum: step,
            xNext: (step % 2) === 0,
          });
    }

    newGame(){
        this.setState({
            history: [{
                squares: Array(this.state.size*this.state.size).fill(null),
                colors: Array(this.state.size*this.state.size).fill("white"),
                winner: null,
                hori: null,
                vert: null,
            }],
            stepNum: 0,
            winner: null,
            xNext: true,
            colors: Array(this.state.size*this.state.size).fill("white")
        })
    }

    changeGameSettings(){
        const newSize = parseInt(this.sizeInput.current.value);
        const newWinCond = parseInt(this.winCondInput.current.value);
        if(newSize < 1 || newWinCond > newSize || newWinCond < 1){
            this.setState({
               settingsMsg: 'Invalid settings'
            })
            return;
        }

        this.setState({
            settingsMsg: null,
            size: newSize,
            winCond: newWinCond
        })
        this.newGame();
    }
    
    render() {
        let history = this.state.history;
        const current = history[this.state.stepNum];
        
        let status = 0;
        if(current.winner)
            if(current.winner !== 'None')
                status = 'Winner: ' + current.winner;
            else status = 'Draw!'
        else status = 'Next player: ' + (this.state.xNext ? 'X' : 'O');

        if(this.state.sortOrder){
            history = history.slice().sort();
        } else{
            history = history.slice().sort().reverse();
        }

        const moves = history.map((step, move) => {
        if(!this.state.sortOrder){
            move = history.length - 1 - move;
        }
        const desc = move ?
            'Go to move #' + move + ' (' + (parseInt(step.hori)) + ',' + (parseInt(step.vert)) + ')':
            'Go to game start';
        return (
            <li key={move} style={this.state.stepNum === move? {fontWeight: 'bold'}: {fontWeight: 'normal'}}>
            <button style={this.state.stepNum === move? {fontWeight: 'bold'}: {fontWeight: 'normal'}} onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
        );
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board settings={this.state} history={current} onClick={(i) => this.handleClick(i)} />
                </div>
                <div className="game-info" style={{width: 200}}>
                    <div>{status}</div>
                    <div>{this.state.winner && <button onClick={()=> this.newGame()}>Start a new game</button>}</div>
                    <div>Move List: <button onClick={()=>{this.setState({sortOrder:!this.state.sortOrder})}}>{this.state.sortOrder?'Ascending':'Descending'}</button></div>
                    <ol>{moves}</ol>
                </div>
                <div className="game-info" style={{width: 150}}>
                        <div><label>
                            Board size:<br/>
                            Default: 20 <br/>
                            <input defaultValue={20} type="number" ref={this.sizeInput} name="boardsize" />
                        </label>
                        </div>
                        <div>
                        <label>
                            Winning condition:<br/>
                            Default: 5 <br/>
                            Max: board size <br/>
                            <input defaultValue={5} type="number" ref={this.winCondInput} name="winningcond"></input>
                        </label>
                        </div>
                        <br/>
                        <button onClick={()=> this.changeGameSettings()}>Apply and reset</button>
                    <div style={{color: 'red'}}>{this.state.settingsMsg}</div>
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
                if(count >= winCond)
                    break;
                if(count > max)
                    max = count;
                count = 0;
            }
        }

        if(count > max)
            max = count;

        if(max >= winCond){
            return winningSquares;
        }
        else return null;
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
                if(count >= winCond)
                    break;
                if(count > max)
                    max = count;
                count = 0;
            }
        }

        if(count > max)
            max = count;

            if(max >= winCond){
                return winningSquares;
            }
            else return null;
    }

    // check 2 halves of the diagonal sequence of current player from current move.
    checkDiag(squares, size, winCond, hori,vert,player){
        let count = 1;
        let i = 1,curVert = vert, curHori = hori;
        let forward = true, backward = true;
        let winningSquares = [];

        while (forward || backward){
            curVert = vert + i;
            curHori = hori + i;

            if(forward && curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } else forward = false;
            }

            curVert = vert - i;
            curHori = hori - i;

            if(backward && curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } else backward = false;
            }

            i++;
        }

        if(count >= winCond){
            return winningSquares;
        }
        else return null;
    }

    // check 2 halves of the antidiagonal sequence of current player from current move.
    checkAntiDiag(squares, size, winCond,hori,vert,player){
        let count = 1;
        let i = 1,curVert = vert, curHori = hori;
        let forward = true, backward = true;
        let winningSquares = [];

        while (i < winCond){
            curVert = vert + i;
            curHori = hori - i;

            if(forward && curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } else forward = false;
            }

            curVert = vert - i;
            curHori = hori + i;

            if(backward && curVert >= 0 && curVert < size && curHori >= 0 && curHori < size){      
                if(squares[curVert*size + curHori] === player){
                    count++;
                    winningSquares.push(curVert*size + curHori);
                } else backward = false;
            }

            i++;
        }
        
        if(count >= winCond){
            return winningSquares;
        }
        else return null;
    }

    updateColorArray(winningSquares){
        let newColor = Array(this.state.size*this.state.size).fill("white");
        winningSquares.forEach((element) => {
            newColor[parseInt(element)] = "yellow"    
        });

        return newColor;
    }

    handleClick(i) {
        const history = this.state.history.slice(0,this.state.stepNum +1);
        const vert = Math.floor(i / this.state.size);
        const hori = i % this.state.size;
        const player = this.state.xNext ? 'X' : 'O';
        const squares = history[history.length-1].squares.slice();
        const colors = history[history.length-1].colors.slice();
        let winningSquares = [];

        
        if(history[history.length-1].winner !== null || squares[i] !== null){
            return;
        }
        squares[i] = player;
        
        const winningCol = this.checkCol(squares,this.state.size,this.state.winCond,hori,vert,player)
        const winningRow = this.checkRow(squares,this.state.size,this.state.winCond,hori,vert,player)
        const winningDiag = this.checkDiag(squares,this.state.size,this.state.winCond,hori,vert,player)
        const winningAntiDiag = this.checkAntiDiag(squares,this.state.size,this.state.winCond,hori,vert,player)

        if(winningCol !== null){
            winningSquares= winningSquares.concat(winningCol);
        }
        if(winningRow !== null){
            winningSquares= winningSquares.concat(winningRow);
        }
        if(winningDiag !== null){
            winningSquares= winningSquares.concat(winningDiag);
            winningSquares.push(i);
        }
        if(winningAntiDiag !== null){
            winningSquares= winningSquares.concat(winningAntiDiag);
            winningSquares.push(i);
        }

        if(winningSquares.length > 0){
            this.setState({
                history: history.concat([{
                    squares: squares,
                    colors: this.updateColorArray(winningSquares),
                    winner: player,
                    hori: hori,
                    vert: vert,
                }]),
                stepNum: history.length,
                xNext: !this.state.xNext,
                winner: player,
            });
            return;
        }
        
        this.setState({
            history: history.concat([{
                squares: squares,
                colors: colors,
                winner: null,
                hori: hori,
                vert: vert,
            }]),
            stepNum: history.length,
            xNext: !this.state.xNext,
        });

        if(!squares.includes(null)){
            this.setState({
                history: history.concat([{
                    squares: squares,
                    colors: colors,
                    winner: 'None',
                }]),
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