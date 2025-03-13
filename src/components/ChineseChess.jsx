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
        console.log(`设置最后移动的棋子位置: (${row}, ${col})`);
        setLastMove({ row, col });
        
        // 记录历史
        const newHistory = [...gameHistory.slice(0, historyIndex + 1), newBoard];
        setGameHistory(newHistory);
        setHistoryIndex(historyIndex + 1);
        
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
      <div className="chess-board" onClick={handleBoardClick}>
        <div className="board-grid">
          {/* 渲染横线 */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className={`horizontal-line middle ${i === 4 || i === 5 ? 'river' : ''}`}
              style={{ top: `${i * (760/9)}px` }}
            />
          ))}
          <div className="horizontal-line upper" />
          <div className="horizontal-line lower" />
          
          {/* 渲染竖线 */}
          {[...Array(9)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="vertical-line"
              style={{ left: `${i * (680/8)}px` }}
            />
          ))}

          {/* 九宫格 */}
          <div className="palace-cross top"></div>
          <div className="palace-cross bottom"></div>

          {/* 河界区域 - 放在竖线之后，确保覆盖竖线 */}
          <div className="river-area" />
          <div className="river-text">
            <span>楚</span>
            <span>河</span>
            <span>汉</span>
            <span>界</span>
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
    const initialBoard = initializeBoard();
    setBoard(initialBoard);
    setSelectedPiece(null);
    setCurrentPlayer('red');
    setGameOver(false);
    setLastMove(null);
    setGameHistory([initialBoard]);
    setHistoryIndex(0);
  };

  // 增强AI评估函数，使其更全面
  const evaluateBoard = (board) => {
    let score = 0;
    
    // 基本棋子价值
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
    
    // 计算棋子价值和位置价值
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece) {
          // 基本棋子价值
          let pieceValue = PIECE_VALUES[piece.type];
          
          // 位置价值
          if (POSITION_BONUS[piece.type]) {
            // 黑方棋子需要翻转位置评估
            const posRow = piece.color === 'red' ? row : 9 - row;
            const posCol = piece.color === 'red' ? col : 8 - col;
            
            if (POSITION_BONUS[piece.type][posRow] && 
                POSITION_BONUS[piece.type][posRow][posCol] !== undefined) {
              pieceValue += POSITION_BONUS[piece.type][posRow][posCol];
            }
          }
          
          // 特殊棋子的额外评估
          if (piece.type === '车') {
            // 车在开阔的行或列上更有价值
            const openRows = countOpenSquares(board, row, col, true);
            const openCols = countOpenSquares(board, row, col, false);
            pieceValue += (openRows + openCols) * 0.5;
            
            // 车控制中路加分
            if (col >= 3 && col <= 5) {
              pieceValue += 5;
            }
          } else if (piece.type === '马') {
            // 马在中心位置加分
            if (row >= 3 && row <= 6 && col >= 2 && col <= 6) {
              pieceValue += 5;
            }
            
            // 马的机动性加分
            const mobilityScore = countValidMoves(board, row, col);
            pieceValue += mobilityScore * 0.5;
          } else if (piece.type === '炮') {
            // 炮的攻击目标数量加分
            const attackTargets = countAttackTargets(board, row, col, piece.color);
            pieceValue += attackTargets * 3;
          } else if (piece.type === '兵' || piece.type === '卒') {
            // 兵/卒过河加分
            const isAdvanced = (piece.type === '兵' && row > 4) || (piece.type === '卒' && row < 5);
            if (isAdvanced) {
              pieceValue += 5;
              
              // 越靠近对方将/帅加分越多
              const distToKing = piece.type === '兵' ? 
                (9 - row) : row;
              pieceValue += (5 - distToKing) * 2;
              
              // 兵/卒在中路加分
              if (col >= 3 && col <= 5) {
                pieceValue += 3;
              }
            }
          } else if (piece.type === '帅' || piece.type === '将') {
            // 将/帅的安全性评估
            const kingProtection = countProtectingPieces(board, row, col, piece.color);
            pieceValue += kingProtection * 5;
          }
          
          // 将分数添加到总分
          score += piece.color === 'black' ? pieceValue : -pieceValue;
        }
      }
    }
    
    // 战术评估
    
    // 检查将军状态
    if (isCheck(board, 'red')) {
      score += 50; // 黑方将军加分
    }
    if (isCheck(board, 'black')) {
      score -= 50; // 红方将军减分
    }
    
    // 控制力评估
    const blackControlScore = evaluateControlScore(board, 'black');
    const redControlScore = evaluateControlScore(board, 'red');
    score += (blackControlScore - redControlScore) * 0.3;
    
    // 机动性评估
    const blackMobility = countTotalMobility(board, 'black');
    const redMobility = countTotalMobility(board, 'red');
    score += (blackMobility - redMobility) * 0.2;
    
    return score;
  };

  // 计算开阔的行或列上的空格数
  const countOpenSquares = (board, row, col, isRow) => {
    let count = 0;
    
    if (isRow) {
      for (let c = 0; c < 9; c++) {
        if (!board[row][c]) count++;
      }
    } else {
      for (let r = 0; r < 10; r++) {
        if (!board[r][col]) count++;
      }
    }
    
    return count;
  };

  // 计算棋子的有效移动数量
  const countValidMoves = (board, row, col) => {
    let count = 0;
    const piece = board[row][col];
    
    if (!piece) return 0;
    
    for (let toRow = 0; toRow < 10; toRow++) {
      for (let toCol = 0; toCol < 9; toCol++) {
        if (isValidMove(row, col, toRow, toCol, board)) {
          count++;
        }
      }
    }
    
    return count;
  };

  // 计算保护指定棋子的己方棋子数量
  const countProtectingPieces = (board, kingRow, kingCol, color) => {
    let count = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color && (row !== kingRow || col !== kingCol)) {
          // 检查是否在将/帅周围
          const rowDiff = Math.abs(row - kingRow);
          const colDiff = Math.abs(col - kingCol);
          
          if (rowDiff <= 1 && colDiff <= 1) {
            count++;
          }
        }
      }
    }
    
    return count;
  };

  // 计算一方的总机动性
  const countTotalMobility = (board, color) => {
    let mobility = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          mobility += countValidMoves(board, row, col);
        }
      }
    }
    
    return mobility;
  };

  // 评估一方对棋盘的控制力
  const evaluateControlScore = (board, color) => {
    let controlScore = 0;
    
    // 中心区域的权重
    const centerWeights = [
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 1, 2, 3, 2, 1, 0, 0],
      [0, 0, 1, 2, 3, 2, 1, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0]
    ];
    
    // 计算对每个格子的控制
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (isSquareControlledBy(board, row, col, color)) {
          controlScore += centerWeights[row][col];
        }
      }
    }
    
    return controlScore;
  };

  // 检查一个格子是否被某方控制
  const isSquareControlledBy = (board, row, col, color) => {
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 9; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && piece.color === color) {
          if (isValidMove(fromRow, fromCol, row, col, board)) {
            return true;
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
        console.log(`AI设置最后移动的棋子位置: (${toRow}, ${toCol})`);
        setLastMove({ row: toRow, col: toCol });
        
        setBoard(newBoard);
        setCurrentPlayer('red');
        validMoveFound = true;
      }
    }
  };

  // 改进悔棋功能中更新最后移动棋子的部分
  const undoMove = () => {
    // 如果没有历史记录或只有初始状态，无法悔棋
    if (historyIndex <= 0) {
      return;
    }
    
    // 如果游戏已结束，重新设置为未结束
    if (gameOver) {
      setGameOver(false);
    }
    
    // 确定要回退的步数
    // 如果是AI模式且当前是红方回合(即刚刚是AI走的)，回退两步
    const stepsToUndo = playWithAI && currentPlayer === 'red' ? 2 : 1;
    
    // 确保不会回退到负数索引
    const newIndex = Math.max(0, historyIndex - stepsToUndo);
    
    setHistoryIndex(newIndex);
    setBoard(gameHistory[newIndex]);
    
    // 设置当前玩家
    // 如果回退到初始状态或偶数步，应该是红方回合
    setCurrentPlayer(newIndex % 2 === 0 ? 'red' : 'black');
    
    // 清除选中状态
    setSelectedPiece(null);
    
    // 更新最后移动的棋子
    if (newIndex > 0) {
      // 找出最后一步移动的棋子位置
      const currentBoard = gameHistory[newIndex];
      const previousBoard = gameHistory[newIndex - 1];
      
      // 创建一个函数来比较两个棋子是否相同
      const isSamePiece = (piece1, piece2) => {
        if (!piece1 && !piece2) return true;
        if (!piece1 || !piece2) return false;
        return piece1.type === piece2.type && piece1.color === piece2.color;
      };
      
      // 寻找两个棋盘之间的差异来确定最后移动的棋子
      let lastMoveRow = -1;
      let lastMoveCol = -1;
      
      // 首先找出哪里有新增的棋子（目标位置）
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
          if (!isSamePiece(currentBoard[row][col], previousBoard[row][col])) {
            // 如果当前位置有棋子，而之前位置没有相同的棋子，这可能是移动的目标位置
            if (currentBoard[row][col]) {
              lastMoveRow = row;
              lastMoveCol = col;
            }
          }
        }
      }
      
      // 如果找到了可能的移动位置
      if (lastMoveRow !== -1 && lastMoveCol !== -1) {
        console.log(`找到最后移动的棋子位置: (${lastMoveRow}, ${lastMoveCol})`);
        setLastMove({ row: lastMoveRow, col: lastMoveCol });
      } else {
        console.log('未找到最后移动的棋子位置');
        setLastMove(null);
      }
    } else {
      // 如果回到初始状态，清除最后移动的棋子
      setLastMove(null);
    }
  };

  // 在renderBoard函数中添加调试代码
  useEffect(() => {
    console.log("当前lastMove:", lastMove);
  }, [lastMove]);

  // 添加检查将军状态的函数
  const isCheck = (board, color) => {
    // 找到将/帅的位置
    let kingRow = -1;
    let kingCol = -1;
    const kingType = color === 'red' ? '帅' : '将';
    
    // 寻找将/帅
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
    
    if (kingRow === -1) return false; // 没有找到将/帅
    
    // 检查对方的每个棋子是否可以吃掉将/帅
    const opponentColor = color === 'red' ? 'black' : 'red';
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece && piece.color === opponentColor) {
          if (isValidMove(row, col, kingRow, kingCol, board)) {
            return true; // 将军
          }
        }
      }
    }
    
    return false; // 没有将军
  };

  // 添加计算炮的攻击目标数量的函数
  const countAttackTargets = (board, row, col, color) => {
    let count = 0;
    const opponentColor = color === 'red' ? 'black' : 'red';
    
    // 检查行方向
    for (let c = 0; c < 9; c++) {
      if (c === col) continue;
      
      let hasPlatform = false;
      let minCol = Math.min(col, c);
      let maxCol = Math.max(col, c);
      
      for (let i = minCol + 1; i < maxCol; i++) {
        if (board[row][i]) {
          if (!hasPlatform) {
            hasPlatform = true;
          } else {
            // 超过一个棋子，不能攻击
            hasPlatform = false;
            break;
          }
        }
      }
      
      if (hasPlatform && board[row][c] && board[row][c].color === opponentColor) {
        count++;
      }
    }
    
    // 检查列方向
    for (let r = 0; r < 10; r++) {
      if (r === row) continue;
      
      let hasPlatform = false;
      let minRow = Math.min(row, r);
      let maxRow = Math.max(row, r);
      
      for (let i = minRow + 1; i < maxRow; i++) {
        if (board[i][col]) {
          if (!hasPlatform) {
            hasPlatform = true;
          } else {
            // 超过一个棋子，不能攻击
            hasPlatform = false;
            break;
          }
        }
      }
      
      if (hasPlatform && board[r][col] && board[r][col].color === opponentColor) {
        count++;
      }
    }
    
    return count;
  };

  // 添加寻找进攻性移动的函数
  const findAttackMove = (board) => {
    // 生成所有可能的移动
    const allMoves = generateAllMoves(board, 'black');
    
    // 首先检查是否可以将军
    for (const move of allMoves) {
      const { fromRow, fromCol, toRow, toCol } = move;
      const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
      
      // 检查移动后是否将军
      if (isCheck(newBoard, 'red')) {
        return move;
      }
    }
    
    // 然后检查是否可以吃子，按价值排序
    const captureMoves = allMoves.filter(move => 
      board[move.toRow][move.toCol] && board[move.toRow][move.toCol].color === 'red'
    );
    
    if (captureMoves.length > 0) {
      // 按被吃子的价值排序
      captureMoves.sort((a, b) => {
        const aValue = PIECE_VALUES[board[a.toRow][a.toCol].type];
        const bValue = PIECE_VALUES[board[b.toRow][b.toCol].type];
        return bValue - aValue;
      });
      
      // 返回价值最高的吃子移动
      return captureMoves[0];
    }
    
    return null;
  };

  // 添加寻找防守性移动的函数
  const findDefendMove = (board) => {
    // 检查将/帅是否被将军
    if (isCheck(board, 'black')) {
      // 生成所有可能的移动
      const allMoves = generateAllMoves(board, 'black');
      
      // 找出能解除将军的移动
      for (const move of allMoves) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
        
        if (!isCheck(newBoard, 'black')) {
          return move;
        }
      }
    }
    
    // 检查是否有高价值棋子被威胁
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = board[row][col];
        if (piece && piece.color === 'black' && PIECE_VALUES[piece.type] >= 40) {
          if (isPieceUnderThreat(board, row, col)) {
            // 生成该棋子的所有可能移动
            const moves = [];
            for (let toRow = 0; toRow < 10; toRow++) {
              for (let toCol = 0; toCol < 9; toCol++) {
                if (isValidMove(row, col, toRow, toCol, board)) {
                  const newBoard = simulateMove(board, row, col, toRow, toCol);
                  if (!isKingFaceToFace(newBoard)) {
                    moves.push({
                      fromRow: row,
                      fromCol: col,
                      toRow,
                      toCol
                    });
                  }
                }
              }
            }
            
            // 如果有可能的移动，返回第一个
            if (moves.length > 0) {
              return moves[0];
            }
          }
        }
      }
    }
    
    return null;
  };

  // 添加生成所有可能移动的函数
  const generateAllMoves = (board, color) => {
    const moves = [];
    
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 9; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && piece.color === color) {
          for (let toRow = 0; toRow < 10; toRow++) {
            for (let toCol = 0; toCol < 9; toCol++) {
              if (isValidMove(fromRow, fromCol, toRow, toCol, board)) {
                // 检查移动后是否会导致将帅相对
                const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
                
                if (!isKingFaceToFace(newBoard)) {
                  moves.push({
                    fromRow,
                    fromCol,
                    toRow,
                    toCol
                  });
                }
              }
            }
          }
        }
      }
    }
    
    return moves;
  };

  // 添加模拟移动的函数
  const simulateMove = (board, fromRow, fromCol, toRow, toCol) => {
    const newBoard = [...board.map(r => [...r])];
    newBoard[toRow][toCol] = board[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    return newBoard;
  };

  // 添加随机打乱数组的函数
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // 添加检查棋子是否受到威胁的函数
  const isPieceUnderThreat = (board, row, col) => {
    const piece = board[row][col];
    if (!piece) return false;
    
    const opponentColor = piece.color === 'red' ? 'black' : 'red';
    
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 9; fromCol++) {
        const attackerPiece = board[fromRow][fromCol];
        if (attackerPiece && attackerPiece.color === opponentColor) {
          if (isValidMove(fromRow, fromCol, row, col, board)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // 添加AI移动函数
  const makeAIMove = () => {
    if (gameOver || currentPlayer === 'red' || !playWithAI) return;
    
    setAiThinking(true);
    
    // 使用setTimeout来避免UI阻塞
    setTimeout(() => {
      try {
        // 使用智能策略选择移动
        const bestMove = findSmartMove(board);
        
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
          console.log(`AI设置最后移动的棋子位置: (${toRow}, ${toCol})`);
          setLastMove({ row: toRow, col: toCol });
          
          // 记录历史
          const newHistory = [...gameHistory.slice(0, historyIndex + 1), newBoard];
          setGameHistory(newHistory);
          setHistoryIndex(historyIndex + 1);
          
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
    }, 500); // 增加延迟时间，给AI更多思考时间
  };

  // 修改findSmartMove函数，增加搜索深度
  const findSmartMove = (board) => {
    // 1. 检查是否可以将军或吃子
    const attackMove = findAttackMove(board);
    if (attackMove) return attackMove;
    
    // 2. 检查是否需要防守
    const defendMove = findDefendMove(board);
    if (defendMove) return defendMove;
    
    // 3. 使用增强版minimax算法，增加搜索深度
    return findBestMoveWithMinimax(board, 3); // 增加搜索深度到3
  };

  // 修改findBestMoveWithMinimax函数，增加搜索深度
  const findBestMoveWithMinimax = (board, depth) => {
    const moves = generateAllMoves(board, 'black');
    
    if (moves.length === 0) return null;
    
    // 随机打乱移动顺序，增加变化性
    shuffleArray(moves);
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 使用迭代加深搜索
    for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
      let currentBestMove = null;
      let currentBestScore = -Infinity;
      
      for (const move of moves) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
        
        const score = minimax(newBoard, currentDepth - 1, -Infinity, Infinity, false);
        
        if (score > currentBestScore) {
          currentBestScore = score;
          currentBestMove = move;
        }
      }
      
      // 更新最佳移动
      if (currentBestMove) {
        bestMove = currentBestMove;
        bestScore = currentBestScore;
      }
      
      // 如果找到了必胜移动，提前结束搜索
      if (bestScore > 5000) break;
    }
    
    return bestMove;
  };

  // 修改minimax算法，增加评估的复杂性
  const minimax = (board, depth, alpha, beta, isMaximizing) => {
    // 达到搜索深度或游戏结束
    if (depth === 0) {
      return evaluateBoard(board);
    }
    
    // 检查是否有一方被将死
    if (isMaximizing) {
      if (isCheckmate(board, 'black')) {
        return -10000; // 黑方被将死
      }
    } else {
      if (isCheckmate(board, 'red')) {
        return 10000; // 红方被将死
      }
    }
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      const moves = generateAllMoves(board, 'black');
      
      // 按照启发式规则排序移动
      sortMovesByHeuristic(moves, board, true);
      
      // 限制考虑的移动数量，提高性能
      const limitedMoves = depth >= 3 ? moves.slice(0, 10) : moves;
      
      for (const move of limitedMoves) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
        
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Alpha-Beta剪枝
      }
      
      return maxEval;
    } else {
      let minEval = Infinity;
      const moves = generateAllMoves(board, 'red');
      
      // 按照启发式规则排序移动
      sortMovesByHeuristic(moves, board, false);
      
      // 限制考虑的移动数量，提高性能
      const limitedMoves = depth >= 3 ? moves.slice(0, 10) : moves;
      
      for (const move of limitedMoves) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
        
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha-Beta剪枝
      }
      
      return minEval;
    }
  };

  // 检查是否被将死
  const isCheckmate = (board, color) => {
    // 如果不是被将军，就不可能被将死
    if (!isCheck(board, color)) {
      return false;
    }
    
    // 生成所有可能的移动
    const moves = generateAllMoves(board, color);
    
    // 检查是否有任何移动可以解除将军
    for (const move of moves) {
      const { fromRow, fromCol, toRow, toCol } = move;
      const newBoard = simulateMove(board, fromRow, fromCol, toRow, toCol);
      
      if (!isCheck(newBoard, color)) {
        return false; // 找到了可以解除将军的移动
      }
    }
    
    return true; // 没有移动可以解除将军，被将死
  };

  // 按照启发式规则排序移动
  const sortMovesByHeuristic = (moves, board, isMaximizing) => {
    const color = isMaximizing ? 'black' : 'red';
    
    moves.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      
      // 吃子的价值
      const aTarget = board[a.toRow][a.toCol];
      const bTarget = board[b.toRow][b.toCol];
      
      if (aTarget) {
        aScore += PIECE_VALUES[aTarget.type];
      }
      
      if (bTarget) {
        bScore += PIECE_VALUES[bTarget.type];
      }
      
      // 移动后是否将军
      const aNewBoard = simulateMove(board, a.fromRow, a.fromCol, a.toRow, a.toCol);
      const bNewBoard = simulateMove(board, b.fromRow, b.fromCol, b.toRow, b.toCol);
      
      if (isCheck(aNewBoard, color === 'red' ? 'black' : 'red')) {
        aScore += 30;
      }
      
      if (isCheck(bNewBoard, color === 'red' ? 'black' : 'red')) {
        bScore += 30;
      }
      
      // 移动的棋子价值（优先移动低价值棋子）
      const aPiece = board[a.fromRow][a.fromCol];
      const bPiece = board[b.fromRow][b.fromCol];
      
      aScore -= PIECE_VALUES[aPiece.type] / 100;
      bScore -= PIECE_VALUES[bPiece.type] / 100;
      
      return isMaximizing ? bScore - aScore : aScore - bScore;
    });
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
            className="undo-button" 
            onClick={undoMove}
            disabled={historyIndex <= 0 || (currentPlayer === 'black' && playWithAI)}
          >
            悔棋
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