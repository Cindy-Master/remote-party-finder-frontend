// 声音提示服务 - 用于管理声音提醒

// 缓存的音频对象
let cachedAudio = null;

// 预加载音频资源
export const preloadAlarmSound = () => {
  if (!cachedAudio) {
    try {
      cachedAudio = new Audio('/sounds/FFXIV_Full_Party.mp3');
      cachedAudio.load(); // 预加载音频资源
      console.log('音频文件已预加载到缓存');
      
      // 添加结束事件监听器，重置音频以便下次播放
      cachedAudio.addEventListener('ended', () => {
        cachedAudio.currentTime = 0;
      });
      
      return true;
    } catch (error) {
      console.error('预加载音频失败:', error);
      return false;
    }
  }
  return true;
};

// 播放铃声
export const playAlarmSound = () => {
  try {
    // 如果没有缓存的音频对象，创建一个
    if (!cachedAudio) {
      preloadAlarmSound();
    }
    
    // 如果音频正在播放，先重置
    if (cachedAudio && !cachedAudio.paused) {
      cachedAudio.currentTime = 0;
    } else if (cachedAudio) {
      // 尝试播放声音
      const playPromise = cachedAudio.play();
      
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
            cachedAudio.play().catch(e => console.error('二次尝试播放失败:', e));
            document.body.removeChild(playButton);
          };
          
          playButton.click();
        });
      }
    }
    
    return cachedAudio;
  } catch (error) {
    console.error('播放声音失败:', error);
    return null;
  }
};

// 停止铃声
export const stopAlarmSound = (audioElement = cachedAudio) => {
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