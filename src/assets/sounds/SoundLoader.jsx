import React, { useEffect } from 'react';

// 创建一个组件来预加载音效
const SoundLoader = () => {
  useEffect(() => {
    // 使用 Web Audio API 创建音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 创建移动音效
    const createMoveSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      return { oscillator, gainNode };
    };
    
    // 创建吃子音效
    const createCaptureSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.2;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      return { oscillator, gainNode };
    };
    
    // 创建将军音效
    const createCheckSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 400;
      gainNode.gain.value = 0.3;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      return { oscillator, gainNode };
    };
    
    // 将音效函数挂载到window对象上，以便在其他组件中使用
    window.playMoveSound = () => {
      const { oscillator, gainNode } = createMoveSound();
      oscillator.start();
      
      // 设置音效持续时间
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      // 0.2秒后停止
      setTimeout(() => {
        oscillator.stop();
      }, 200);
    };
    
    window.playCaptureSound = () => {
      const { oscillator, gainNode } = createCaptureSound();
      oscillator.start();
      
      // 设置音效持续时间
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      // 0.3秒后停止
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    };
    
    window.playCheckSound = () => {
      const { oscillator, gainNode } = createCheckSound();
      oscillator.start();
      
      // 设置音效持续时间
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      // 0.5秒后停止
      setTimeout(() => {
        oscillator.stop();
      }, 500);
    };
    
    // 组件卸载时清理
    return () => {
      delete window.playMoveSound;
      delete window.playCaptureSound;
      delete window.playCheckSound;
    };
  }, []);
  
  return null; // 这个组件不渲染任何内容
};

export default SoundLoader; 