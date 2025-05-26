// 通知服务 - 用于管理系统通知和声音提醒

// 检查浏览器是否支持通知API
export const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知功能');
    return false;
  }

  // 如果已经获得权限
  if (Notification.permission === 'granted') {
    return true;
  }

  // 如果权限未定义，请求权限
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知功能');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
};

// 发送桌面通知
export const sendNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });

    // 点击通知时触发的回调
    notification.onclick = options.onClick || (() => {
      window.focus();
      notification.close();
    });

    return notification;
  } else {
    console.log('通知权限未授予');
    return null;
  }
};

// 播放铃声
export const playAlarmSound = () => {
  const audio = new Audio('/sounds/FFXIV_Full_Party.mp3');
  audio.loop = false;
  
  try {
    // 尝试播放声音
    const playPromise = audio.play();
    
    // 处理自动播放策略可能阻止播放的情况
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('播放声音失败:', error);
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

// 检测操作系统类型
export const getOSType = () => {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf('Windows') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1) return 'Mac';
  if (userAgent.indexOf('Linux') !== -1) return 'Linux';
  if (userAgent.indexOf('Android') !== -1) return 'Android';
  if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
  return 'Unknown';
}; 