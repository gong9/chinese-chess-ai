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

  // 添加棋子价值常量
  const PIECE_VALUES = {
    '兵': 10,
    '卒': 10,
    '炮': 45,
    '车': 90,
    '马': 40,
    '相': 20,
    '象': 20,
    '仕': 20,
    '士': 20,
    '帅': 10000,
    '将': 10000
  };

  // 位置加成表 - 每种棋子在不同位置的额外价值
  const POSITION_BONUS = {
    '兵': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 4, 6, 6, 6, 6, 6, 4, 2],
      [4, 6, 8, 10, 12, 10, 8, 6, 4],
      [6, 8, 10, 12, 14, 12, 10, 8, 6],
      [8, 10, 12, 14, 16, 14, 12, 10, 8],
      [10, 12, 14, 16, 18, 16, 14, 12, 10],
      [12, 14, 16, 18, 20, 18, 16, 14, 12],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    '卒': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [12, 14, 16, 18, 20, 18, 16, 14, 12],
      [10, 12, 14, 16, 18, 16, 14, 12, 10],
      [8, 10, 12, 14, 16, 14, 12, 10, 8],
      [6, 8, 10, 12, 14, 12, 10, 8, 6],
      [4, 6, 8, 10, 12, 10, 8, 6, 4],
      [2, 4, 6, 6, 6, 6, 6, 4, 2],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    '车': [
      [14, 14, 12, 18, 16, 18, 12, 14, 14],
      [16, 20, 18, 24, 26, 24, 18, 20, 16],
      [12, 12, 12, 18, 18, 18, 12, 12, 12],
      [12, 18, 16, 22, 22, 22, 16, 18, 12],
      [12, 14, 12, 18, 18, 18, 12, 14, 12],
      [12, 16, 14, 20, 20, 20, 14, 16, 12],
      [6, 10, 8, 14, 14, 14, 8, 10, 6],
      [4, 8, 6, 14, 12, 14, 6, 8, 4],
      [8, 4, 8, 16, 8, 16, 8, 4, 8],
      [6, 8, 6, 14, 12, 14, 6, 8, 6]
    ],
    '马': [
      [4, 8, 16, 12, 4, 12, 16, 8, 4],
      [4, 10, 28, 16, 8, 16, 28, 10, 4],
      [12, 14, 16, 20, 18, 20, 16, 14, 12],
      [8, 24, 18, 24, 20, 24, 18, 24, 8],
      [6, 16, 14, 18, 16, 18, 14, 16, 6],
      [4, 12, 16, 14, 12, 14, 16, 12, 4],
      [2, 6, 8, 6, 10, 6, 8, 6, 2],
      [4, 2, 8, 8, 4, 8, 8, 2, 4],
      [0, 2, 4, 4, -2, 4, 4, 2, 0],
      [0, -4, 0, 0, 0, 0, 0, -4, 0]
    ],
    '炮': [
      [6, 4, 0, -10, -12, -10, 0, 4, 6],
      [2, 2, 0, -4, -14, -4, 0, 2, 2],
      [2, 2, 0, -10, -8, -10, 0, 2, 2],
      [0, 0, -2, 4, 10, 4, -2, 0, 0],
      [0, 0, 0, 2, 8, 2, 0, 0, 0],
      [-2, 0, 4, 2, 6, 2, 4, 0, -2],
      [0, 0, 0, 2, 4, 2, 0, 0, 0],
      [4, 0, 8, 6, 10, 6, 8, 0, 4],
      [0, 2, 4, 6, 6, 6, 4, 2, 0],
      [0, 0, 2, 6, 6, 6, 2, 0, 0]
    ]
  };

  // 添加最后移动的棋子状态
  const [lastMove, setLastMove] = useState(null);

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
        
        // 记录最后移动的棋子
        setLastMove({ row, col });
        
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
  const isValidMove = (fromRow, fromCol, toRow, toCol, customBoard = null) => {
    const currentBoard = customBoard || board;
    
    // 检查坐标是否在棋盘范围内
    if (fromRow < 0 || fromRow >= 10 || fromCol < 0 || fromCol >= 9 ||
        toRow < 0 || toRow >= 10 || toCol < 0 || toCol >= 9) {
      return false;
    }
    
    const fromPiece = currentBoard[fromRow][fromCol];
    
    // 检查起始位置是否有棋子
    if (!fromPiece) {
      return false;
    }
    
    const toPiece = currentBoard[toRow][toCol];
    
    // 不能吃自己的子
    if (toPiece && toPiece.color === fromPiece.color) {
      return false;
    }

    // 根据不同的棋子类型判断走法是否合法
    switch (fromPiece.type) {
      case '车':
        return isValidRookMove(fromRow, fromCol, toRow, toCol, currentBoard);
      case '马':
        return isValidKnightMove(fromRow, fromCol, toRow, toCol, currentBoard);
      case '象':
      case '相':
        return isValidBishopMove(fromRow, fromCol, toRow, toCol, fromPiece.color, currentBoard);
      case '士':
      case '仕':
        return isValidAdvisorMove(fromRow, fromCol, toRow, toCol, fromPiece.color, currentBoard);
      case '将':
      case '帅':
        return isValidKingMove(fromRow, fromCol, toRow, toCol, fromPiece.color, currentBoard);
      case '炮':
        return isValidCannonMove(fromRow, fromCol, toRow, toCol, currentBoard);
      case '兵':
      case '卒':
        return isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece.color, currentBoard);
      default:
        return false;
    }
  };

  // 车的走法
  const isValidRookMove = (fromRow, fromCol, toRow, toCol, customBoard = null) => {
    const currentBoard = customBoard || board;
    
    // 车走直线
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    // 检查路径上是否有其他棋子
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol);
      const end = Math.max(fromCol, toCol);
      for (let col = start + 1; col < end; col++) {
        if (currentBoard[fromRow][col]) return false;
      }
    } else {
      const start = Math.min(fromRow, toRow);
      const end = Math.max(fromRow, toRow);
      for (let row = start + 1; row < end; row++) {
        if (currentBoard[row][fromCol]) return false;
      }
    }
    return true;
  };

  // 马的走法
  const isValidKnightMove = (fromRow, fromCol, toRow, toCol, board) => {
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
  const isValidBishopMove = (fromRow, fromCol, toRow, toCol, color, board) => {
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
  const isValidAdvisorMove = (fromRow, fromCol, toRow, toCol, color, board) => {
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
  const isValidKingMove = (fromRow, fromCol, toRow, toCol, color, board) => {
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
  const isValidCannonMove = (fromRow, fromCol, toRow, toCol, board) => {
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
  const isValidPawnMove = (fromRow, fromCol, toRow, toCol, color, board) => {
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
                      : lastMove?.row === rowIndex && lastMove?.col === colIndex
                      ? 'last-move'
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
    setLastMove(null);
    setGameHistory([initializeBoard()]);
    setHistoryIndex(0);
  };

  // 改进AI移动函数
  const makeAIMove = () => {
    if (gameOver || currentPlayer === 'red' || !playWithAI) return;
    
    setAiThinking(true);
    
    // 使用setTimeout来避免UI阻塞
    setTimeout(() => {
      try {
        // 降低搜索深度以提高性能
        const bestMove = findBestMove(board, 2); // 搜索深度为2
        
        if (bestMove) {
          const { fromRow, fromCol, toRow, toCol } = bestMove;
          
          // 执行最佳移动
          const newBoard = [...board.map(r => [...r])];
          const targetPiece = board[toRow][toCol];
          
          newBoard[toRow][toCol] = board[fromRow][fromCol];
          newBoard[fromRow][fromCol] = null;
          
          // 检查是否吃掉对方将帅
          if (targetPiece && targetPiece.type === '帅') {
            setGameOver(true);
          }
          
          // 记录最后移动的棋子
          setLastMove({ row: toRow, col: toCol });
          
          setBoard(newBoard);
          setCurrentPlayer('red');
        } else {
          // 如果找不到最佳移动，使用随机移动
          makeRandomMove();
        }
      } catch (error) {
        console.error("Error in makeAIMove:", error);
        // 出错时使用随机移动
        makeRandomMove();
      }
      
      setAiThinking(false);
    }, 500);
  };

  // 寻找最佳移动
  const findBestMove = (board, depth) => {
    let bestScore = -Infinity;
    let bestMove = null;
    
    // 收集所有黑方棋子的位置
    const blackPieces = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] && board[row][col].color === 'black') {
          blackPieces.push({ row, col, piece: board[row][col] });
        }
      }
    }
    
    // 评估每个可能的移动
    for (const { row: fromRow, col: fromCol } of blackPieces) {
      for (let toRow = 0; toRow < 10; toRow++) {
        for (let toCol = 0; toCol < 9; toCol++) {
          if (isValidMove(fromRow, fromCol, toRow, toCol)) {
            // 模拟移动
            const newBoard = [...board.map(r => [...r])];
            const capturedPiece = newBoard[toRow][toCol];
            newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
            newBoard[fromRow][fromCol] = null;
            
            // 检查移动后是否导致将帅相对
            if (isKingFaceToFace(newBoard)) {
              continue; // 跳过非法移动
            }
            
            // 评估移动
            const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false);
            
            if (score > bestScore) {
              bestScore = score;
              bestMove = { fromRow, fromCol, toRow, toCol };
            }
          }
        }
      }
    }
    
    return bestMove;
  };

  // Minimax算法带Alpha-Beta剪枝
  const minimax = (board, depth, alpha, beta, isMaximizing) => {
    try {
      // 到达叶子节点或游戏结束
      if (depth === 0) {
        return evaluateBoard(board);
      }
      
      if (isMaximizing) { // 黑方（AI）回合，最大化分数
        let maxScore = -Infinity;
        
        // 收集所有黑方棋子
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 9; col++) {
            if (board[row][col] && board[row][col].color === 'black') {
              // 尝试所有可能的移动
              for (let toRow = 0; toRow < 10; toRow++) {
                for (let toCol = 0; toCol < 9; toCol++) {
                  try {
                    if (isValidMove(row, col, toRow, toCol, board)) {
                      // 模拟移动
                      const newBoard = [...board.map(r => [...r])];
                      newBoard[toRow][toCol] = newBoard[row][col];
                      newBoard[row][col] = null;
                      
                      // 检查移动后是否导致将帅相对
                      if (isKingFaceToFace(newBoard)) {
                        continue;
                      }
                      
                      const score = minimax(newBoard, depth - 1, alpha, beta, false);
                      maxScore = Math.max(maxScore, score);
                      alpha = Math.max(alpha, score);
                      
                      // Alpha-Beta剪枝
                      if (beta <= alpha) {
                        break;
                      }
                    }
                  } catch (error) {
                    console.error("Error in minimax (max):", error);
                    // 出错时继续检查其他移动
                  }
                }
              }
            }
          }
        }
        
        return maxScore === -Infinity ? evaluateBoard(board) : maxScore;
      } else { // 红方回合，最小化分数
        let minScore = Infinity;
        
        // 收集所有红方棋子
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 9; col++) {
            if (board[row][col] && board[row][col].color === 'red') {
              // 尝试所有可能的移动
              for (let toRow = 0; toRow < 10; toRow++) {
                for (let toCol = 0; toCol < 9; toCol++) {
                  try {
                    if (isValidMove(row, col, toRow, toCol, board)) {
                      // 模拟移动
                      const newBoard = [...board.map(r => [...r])];
                      newBoard[toRow][toCol] = newBoard[row][col];
                      newBoard[row][col] = null;
                      
                      // 检查移动后是否导致将帅相对
                      if (isKingFaceToFace(newBoard)) {
                        continue;
                      }
                      
                      const score = minimax(newBoard, depth - 1, alpha, beta, true);
                      minScore = Math.min(minScore, score);
                      beta = Math.min(beta, score);
                      
                      // Alpha-Beta剪枝
                      if (beta <= alpha) {
                        break;
                      }
                    }
                  } catch (error) {
                    console.error("Error in minimax (min):", error);
                    // 出错时继续检查其他移动
                  }
                }
              }
            }
          }
        }
        
        return minScore === Infinity ? evaluateBoard(board) : minScore;
      }
    } catch (error) {
      console.error("Error in minimax:", error);
      return evaluateBoard(board);
    }
  };

  // 评估棋盘状态
  const evaluateBoard = (board) => {
    let score = 0;
    
    // 计算每个棋子的价值
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece) {
          // 基础棋子价值
          let pieceValue = PIECE_VALUES[piece.type] || 0;
          
          // 位置加成
          if (POSITION_BONUS[piece.type]) {
            pieceValue += POSITION_BONUS[piece.type][row][col] || 0;
          }
          
          // 黑方加分，红方减分
          score += piece.color === 'black' ? pieceValue : -pieceValue;
        }
      }
    }
    
    // 检查将军状态
    if (isCheck(board, 'red')) {
      score += 50; // 黑方将军加分
    }
    if (isCheck(board, 'black')) {
      score -= 50; // 红方将军减分
    }
    
    return score;
  };

  // 检查是否将军
  const isCheck = (board, color) => {
    // 找到对方的将/帅
    let kingRow = -1;
    let kingCol = -1;
    const kingType = color === 'red' ? '帅' : '将';
    
    // 寻找将/帅位置
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] && board[row][col].type === kingType && board[row][col].color === color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    // 如果找不到将/帅，返回false
    if (kingRow === -1 || kingCol === -1) {
      return false;
    }
    
    // 检查对方的每个棋子是否可以吃掉将/帅
    const opponentColor = color === 'red' ? 'black' : 'red';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece && piece.color === opponentColor) {
          try {
            if (isValidMove(row, col, kingRow, kingCol, board)) {
              return true;
            }
          } catch (error) {
            console.error("Error in isCheck:", error);
            // 出错时继续检查其他棋子
          }
        }
      }
    }
    
    return false;
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

  // 添加随机移动函数作为备选
  const makeRandomMove = () => {
    // 收集所有黑方棋子的位置
    const blackPieces = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] && board[row][col].color === 'black') {
          blackPieces.push({ row, col });
        }
      }
    }
    
    if (blackPieces.length === 0) return;
    
    let validMoveFound = false;
    let attempts = 0;
    const maxAttempts = 100;
    
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
        const newBoard = [...board.map(r => [...r])];
        const targetPiece = board[toRow][toCol];
        
        newBoard[toRow][toCol] = board[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;
        
        // 检查是否吃掉对方将帅
        if (targetPiece && targetPiece.type === '帅') {
          setGameOver(true);
        }
        
        // 记录最后移动的棋子
        setLastMove({ row: toRow, col: toCol });
        
        setBoard(newBoard);
        setCurrentPlayer('red');
        validMoveFound = true;
      }
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