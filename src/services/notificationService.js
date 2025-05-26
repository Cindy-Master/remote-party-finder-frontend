// 声音提示服务 - 用于管理声音提醒

// 播放铃声
export const playAlarmSound = () => {
  try {
    const audio = new Audio('/sounds/FFXIV_Full_Party.mp3');
    audio.loop = false;
    
    // 尝试播放声音
    const playPromise = audio.play();
    
    // 处理自动播放策略可能阻止播放的情况
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('播放声音失败:', error);
        // 尝试通过用户交互触发播放
        console.log('尝试通过用户交互触发声音播放...');
        const playButton = document.createElement('button');
        playButton.style.display = 'none';
        playButton.innerText = '播放提示音';
        document.body.appendChild(playButton);
        
        playButton.onclick = () => {
          audio.play().catch(e => console.error('二次尝试播放失败:', e));
          document.body.removeChild(playButton);
        };
        
        playButton.click();
      });
    }
    
    return audio;
  } catch (error) {
    console.error('播放声音失败:', error);
    return null;
  }
};

// 停止铃声
export const stopAlarmSound = (audioElement) => {
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
};

// 检测操作系统类型（用于可能的平台特定音频处理）
export const getOSType = () => {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf('Windows') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1) return 'Mac';
  if (userAgent.indexOf('Linux') !== -1) return 'Linux';
  if (userAgent.indexOf('Android') !== -1) return 'Android';
  if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
  return 'Unknown';
}; 