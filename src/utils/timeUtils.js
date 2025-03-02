// 将秒转换为人类可读的时间格式
export const formatTimeLeft = (timeInSeconds) => {
  // 将秒转换为毫秒
  const milliseconds = timeInSeconds * 1000;
  
  // 计算小时、分钟和秒
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  // 根据时间长短返回适当的格式
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};

// 检查是否为紧急时间（少于5分钟）
export const isUrgentTime = (timeInSeconds) => {
  return timeInSeconds < 300; // 5分钟 = 300秒
}; 