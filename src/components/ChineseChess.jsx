import React, { useState, useEffect } from 'react';
import '../styles/ChineseChess.css';

const ChineseChess = () => {
  // 初始化棋盘状态
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('red'); // 红方先走
  const [gameOver, setGameOver] = useState(false); // 添加游戏结束状态
  const [gameHistory, setGameHistory] = useState([initializeBoard()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // 在组件顶部添加AI状态
  const [playWithAI, setPlayWithAI] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // 初始化棋盘
  function initializeBoard() {
    const initialBoard = Array(10).fill().map(() => Array(9).fill(null));
    
    // 布置红方棋子
    initialBoard[0][0] = { type: '车', color: 'red' };
    initialBoard[0][1] = { type: '马', color: 'red' };
    initialBoard[0][2] = { type: '相', color: 'red' };
    initialBoard[0][3] = { type: '仕', color: 'red' };
    initialBoard[0][4] = { type: '帅', color: 'red' };
    initialBoard[0][5] = { type: '仕', color: 'red' };
    initialBoard[0][6] = { type: '相', color: 'red' };
    initialBoard[0][7] = { type: '马', color: 'red' };
    initialBoard[0][8] = { type: '车', color: 'red' };
    initialBoard[2][1] = { type: '炮', color: 'red' };
    initialBoard[2][7] = { type: '炮', color: 'red' };
    initialBoard[3][0] = { type: '兵', color: 'red' };
    initialBoard[3][2] = { type: '兵', color: 'red' };
    initialBoard[3][4] = { type: '兵', color: 'red' };
    initialBoard[3][6] = { type: '兵', color: 'red' };
    initialBoard[3][8] = { type: '兵', color: 'red' };

    // 布置黑方棋子
    initialBoard[9][0] = { type: '车', color: 'black' };
    initialBoard[9][1] = { type: '马', color: 'black' };
    initialBoard[9][2] = { type: '象', color: 'black' };
    initialBoard[9][3] = { type: '士', color: 'black' };
    initialBoard[9][4] = { type: '将', color: 'black' };
    initialBoard[9][5] = { type: '士', color: 'black' };
    initialBoard[9][6] = { type: '象', color: 'black' };
    initialBoard[9][7] = { type: '马', color: 'black' };
    initialBoard[9][8] = { type: '车', color: 'black' };
    initialBoard[7][1] = { type: '炮', color: 'black' };
    initialBoard[7][7] = { type: '炮', color: 'black' };
    initialBoard[6][0] = { type: '卒', color: 'black' };
    initialBoard[6][2] = { type: '卒', color: 'black' };
    initialBoard[6][4] = { type: '卒', color: 'black' };
    initialBoard[6][6] = { type: '卒', color: 'black' };
    initialBoard[6][8] = { type: '卒', color: 'black' };

    return initialBoard;
  }

  // 添加一个函数来处理棋盘点击
  const handleBoardClick = (event) => {
    if (gameOver) return;
    
    // 获取点击位置相对于棋盘的坐标
    const boardRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;
    
    // 计算最接近的交叉点
    const cellWidth = 680 / 8;
    const cellHeight = 760 / 9;
    
    const col = Math.round(x / cellWidth);
    const row = Math.round(y / cellHeight);
    
    // 确保坐标在棋盘范围内
    if (row >= 0 && row < 10 && col >= 0 && col < 9) {
      handlePieceMove(row, col);
    }
  };

  // 添加将帅相遇的规则检查
  const isKingFaceToFace = (board) => {
    // 找到将和帅的位置
    let redKingCol = -1;
    let blackKingCol = -1;
    
    // 红方帅在第0行
    for (let col = 3; col <= 5; col++) {
      if (board[0][col] && board[0][col].type === '帅') {
        redKingCol = col;
        break;
      }
    }
    
    // 黑方将在第9行
    for (let col = 3; col <= 5; col++) {
      if (board[9][col] && board[9][col].type === '将') {
        blackKingCol = col;
        break;
      }
    }
    
    // 如果将帅在同一列
    if (redKingCol === blackKingCol && redKingCol !== -1) {
      // 检查中间是否有其他棋子
      let hasPieceBetween = false;
      for (let row = 1; row < 9; row++) {
        if (board[row][redKingCol]) {
          hasPieceBetween = true;
          break;
        }
      }
      
      // 如果中间没有棋子，则将帅相对
      return !hasPieceBetween;
    }
    
    return false;
  };

  // 处理棋子移动逻辑
  const handlePieceMove = (row, col) => {
    const piece = board[row][col];
    
    if (!selectedPiece) {
      // 选择棋子
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col });
      }
    } else {
      // 移动棋子
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        const newBoard = [...board.map(r => [...r])];
        const targetPiece = board[row][col];
        
        // 检查是否吃掉对方将帅
        if (targetPiece && (targetPiece.type === '将' || targetPiece.type === '帅')) {
          setGameOver(true);
        }
        
        newBoard[row][col] = board[selectedPiece.row][selectedPiece.col];
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        
        // 检查移动后是否导致将帅相对
        if (isKingFaceToFace(newBoard)) {
          // 如果移动导致将帅相对，这是一个非法移动
          alert('不能使将帅直接相对！');
          return;
        }
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
      } else if (piece && piece.color === currentPlayer) {
        // 如果点击的是自己的另一个棋子，则选择该棋子
        setSelectedPiece({ row, col });
        return;
      }
      setSelectedPiece(null);
    }
  };

  // 实现具体的走子规则
  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const fromPiece = board[fromRow][fromCol];
    const toPiece = board[toRow][toCol];
    
    // 不能吃自己的子
    if (toPiece && toPiece.color === fromPiece.color) {
      return false;
    }

    // 根据不同的棋子类型判断走法是否合法
    switch (fromPiece.type) {
      case '车':
        return isValidRookMove(fromRow, fromCol, toRow, toCol);
      case '马':
        return isValidKnightMove(fromRow, fromCol, toRow, toCol);
      case '象':
      case '相':
        return isValidBishopMove(fromRow, fromCol, toRow, toCol, fromPiece.color);
      case '士':
      case '仕':
        return isValidAdvisorMove(fromRow, fromCol, toRow, toCol, fromPiece.color);
      case '将':
      case '帅':
        return isValidKingMove(fromRow, fromCol, toRow, toCol, fromPiece.color);
      case '炮':
        return isValidCannonMove(fromRow, fromCol, toRow, toCol);
      case '兵':
      case '卒':
        return isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece.color);
      default:
        return false;
    }
  };

  // 车的走法
  const isValidRookMove = (fromRow, fromCol, toRow, toCol) => {
    // 车走直线
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    // 检查路径上是否有其他棋子
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol);
      const end = Math.max(fromCol, toCol);
      for (let col = start + 1; col < end; col++) {
        if (board[fromRow][col]) return false;
      }
    } else {
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (board[row][fromCol]) return false;
      }
    }
    return true;
  };

  // 马的走法
  const isValidKnightMove = (fromRow, fromCol, toRow, toCol) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // 马走"日"字
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      return false;
    }

    // 检查马脚
    if (rowDiff === 2) {
      const checkRow = fromRow + (toRow > fromRow ? 1 : -1);
      if (board[checkRow][fromCol]) return false;
    } else {
      const checkCol = fromCol + (toCol > fromCol ? 1 : -1);
      if (board[fromRow][checkCol]) return false;
    }
    return true;
  };

  // 象/相的走法
  const isValidBishopMove = (fromRow, fromCol, toRow, toCol, color) => {
    // 象走田字
    if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) {
      return false;
    }

    // 不能过河
    if (color === 'red' && toRow > 4) return false;
    if (color === 'black' && toRow < 5) return false;

    // 检查象心
    const centerRow = (fromRow + toRow) / 2;
    const centerCol = (fromCol + toCol) / 2;
    if (board[centerRow][centerCol]) return false;

    return true;
  };

  // 士/仕的走法
  const isValidAdvisorMove = (fromRow, fromCol, toRow, toCol, color) => {
    // 士走斜线一格
    if (Math.abs(toRow - fromRow) !== 1 || Math.abs(toCol - fromCol) !== 1) {
      return false;
    }

    // 限制在九宫格内
    if (color === 'red') {
      if (toRow > 2 || toCol < 3 || toCol > 5) return false;
    } else {
      if (toRow < 7 || toCol < 3 || toCol > 5) return false;
    }

    return true;
  };

  // 将/帅的走法
  const isValidKingMove = (fromRow, fromCol, toRow, toCol, color) => {
    // 特殊情况：将帅相对时可以直接吃对方
    if (color === 'red' && board[toRow][toCol] && board[toRow][toCol].type === '将' && fromCol === toCol) {
      // 检查中间是否有棋子
      let hasPieceBetween = false;
      for (let row = fromRow + 1; row < toRow; row++) {
        if (board[row][fromCol]) {
          hasPieceBetween = true;
          break;
        }
      }
      return !hasPieceBetween;
    }
    
    if (color === 'black' && board[toRow][toCol] && board[toRow][toCol].type === '帅' && fromCol === toCol) {
      // 检查中间是否有棋子
      let hasPieceBetween = false;
      for (let row = toRow + 1; row < fromRow; row++) {
        if (board[row][fromCol]) {
          hasPieceBetween = true;
          break;
        }
      }
      return !hasPieceBetween;
    }
    
    // 走一格直线
    if (Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol) !== 1) {
      return false;
    }

    // 限制在九宫格内
    if (color === 'red') {
      if (toRow > 2 || toCol < 3 || toCol > 5) return false;
    } else {
      if (toRow < 7 || toCol < 3 || toCol > 5) return false;
    }

    return true;
  };

  // 炮的走法
  const isValidCannonMove = (fromRow, fromCol, toRow, toCol) => {
    // 炮走直线
    if (fromRow !== toRow && fromCol !== toCol) return false;

    let count = 0; // 计算路径上的棋子数
    
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol);
      const end = Math.max(fromCol, toCol);
      for (let col = start + 1; col < end; col++) {
        if (board[fromRow][col]) count++;
      }
    } else {
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (board[row][fromCol]) count++;
      }
    }

    // 吃子时必须翻过一个棋子
    if (board[toRow][toCol]) {
      return count === 1;
    }
    // 不吃子时路径必须为空
    return count === 0;
  };

  // 兵/卒的走法
  const isValidPawnMove = (fromRow, fromCol, toRow, toCol, color) => {
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // 红方兵
    if (color === 'red') {
      // 未过河
      if (fromRow < 5) {
        return rowDiff === 1 && colDiff === 0;
      }
      // 过河后可以横走
      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    // 黑方卒
    else {
      // 未过河
      if (fromRow > 4) {
        return rowDiff === -1 && colDiff === 0;
      }
      // 过河后可以横走
      return (rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
  };

  const renderBoard = () => {
    return (
      <div className="chess-board">
        <div className="board-grid" onClick={handleBoardClick}>
          {/* 渲染横线 */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className={`horizontal-line ${
                i === 0 ? 'upper' : 
                i === 9 ? 'lower' : 
                (i === 4 || i === 5) ? 'river' : 'middle'
              }`}
              style={{ top: `${i * (760/9)}px` }}
            />
          ))}
          
          {/* 渲染竖线 */}
          {[...Array(9)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="vertical-line"
              style={{ left: `${i * (680/8)}px` }}
            />
          ))}

          {/* 添加九宫格斜线 */}
          <div className="palace-cross top"></div>
          <div className="palace-cross bottom"></div>

          {/* 河界区域 - 放在竖线之后，确保覆盖竖线 */}
          <div className="river-area" />

          {/* 楚河汉界 */}
          <div className="river-text">
            <div>楚河</div>
            <div>汉界</div>
          </div>

          {/* 渲染棋子 */}
          {board.map((row, rowIndex) => 
            row.map((piece, colIndex) => 
              piece && (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`piece ${piece.color} ${
                    selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex
                      ? 'selected'
                      : ''
                  }`}
                  style={{
                    left: `${colIndex * (680/8)}px`,
                    top: `${rowIndex * (760/9)}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePieceMove(rowIndex, colIndex);
                  }}
                >
                  {piece.type}
                </div>
              )
            )
          )}
        </div>
      </div>
    );
  };

  const restartGame = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setCurrentPlayer('red');
    setGameOver(false);
    setGameHistory([initializeBoard()]);
    setHistoryIndex(0);
  };

  // 添加AI移动函数
  const makeAIMove = () => {
    if (gameOver || currentPlayer === 'red' || !playWithAI) return;
    
    setAiThinking(true);
    
    // 使用setTimeout来模拟AI思考时间
    setTimeout(() => {
      // 收集所有黑方棋子的位置
      const blackPieces = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] && board[row][col].color === 'black') {
            blackPieces.push({ row, col, piece: board[row][col] });
          }
        }
      }
      
      // 随机选择一个黑方棋子
      if (blackPieces.length === 0) return;
      
      let validMoveFound = false;
      let attempts = 0;
      const maxAttempts = 100; // 防止无限循环
      
      while (!validMoveFound && attempts < maxAttempts) {
        attempts++;
        
        // 随机选择一个棋子
        const randomPieceIndex = Math.floor(Math.random() * blackPieces.length);
        const { row: fromRow, col: fromCol } = blackPieces[randomPieceIndex];
        
        // 尝试所有可能的移动
        const possibleMoves = [];
        for (let toRow = 0; toRow < 10; toRow++) {
          for (let toCol = 0; toCol < 9; toCol++) {
            if (isValidMove(fromRow, fromCol, toRow, toCol)) {
              // 检查移动后是否会导致将帅相对
              const newBoard = [...board.map(r => [...r])];
              newBoard[toRow][toCol] = board[fromRow][fromCol];
              newBoard[fromRow][fromCol] = null;
              
              if (!isKingFaceToFace(newBoard)) {
                possibleMoves.push({ toRow, toCol });
              }
            }
          }
        }
        
        if (possibleMoves.length > 0) {
          // 随机选择一个有效移动
          const randomMoveIndex = Math.floor(Math.random() * possibleMoves.length);
          const { toRow, toCol } = possibleMoves[randomMoveIndex];
          
          // 执行移动
          const targetPiece = board[toRow][toCol];
          
          const newBoard = [...board.map(r => [...r])];
          newBoard[toRow][toCol] = board[fromRow][fromCol];
          newBoard[fromRow][fromCol] = null;
          
          // 检查是否吃掉对方将帅
          if (targetPiece && targetPiece.type === '帅') {
            setGameOver(true);
          }
          
          setBoard(newBoard);
          setCurrentPlayer('red');
          validMoveFound = true;
        }
      }
      
      setAiThinking(false);
    }, 500); // 500毫秒的思考时间
  };

  // 使用useEffect监听玩家回合变化，触发AI移动
  useEffect(() => {
    if (currentPlayer === 'black' && playWithAI && !gameOver) {
      makeAIMove();
    }
  }, [currentPlayer, playWithAI, gameOver]);

  // 添加切换AI对手的函数
  const toggleAI = () => {
    setPlayWithAI(!playWithAI);
    // 如果当前是黑方回合且开启了AI，立即让AI走一步
    if (!playWithAI && currentPlayer === 'black') {
      makeAIMove();
    }
  };

  return (
    <div className="game-container">
      <div className="game-title">中国象棋</div>
      {renderBoard()}
      <div className="game-controls-container">
        {gameOver && (
          <div className="game-over">
            游戏结束！{currentPlayer === 'red' ? '黑' : '红'}方胜利！
          </div>
        )}
        <div className="current-player">
          当前回合：{currentPlayer === 'red' ? '红' : '黑'}方
          {aiThinking && <span className="ai-thinking"> (AI思考中...)</span>}
        </div>
        <div className="game-controls">
          <button className="restart-button" onClick={restartGame}>
            重新开始
          </button>
          <button 
            className={`ai-button ${playWithAI ? 'active' : ''}`} 
            onClick={toggleAI}
          >
            {playWithAI ? '关闭AI对手' : '开启AI对手'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChineseChess; 