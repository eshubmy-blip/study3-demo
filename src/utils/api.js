/**
 * API接口（当前为mock实现）
 * 后续替换为真实的后端API地址
 */

const API_BASE_URL = 'https://your-api-endpoint.com/api'; // 后续替换

/**
 * 提交实验数据（行为数据 + 问卷数据）
 */
export async function submitExperimentData(data) {
  // Mock实现：打印数据到控制台
  console.log('=== 提交实验数据 ===');
  console.log('User ID:', data.user_id);
  console.log('Video ID:', data.video_id);
  console.log('行为数据:', {
    like: data.like,
    cart: data.cart,
    watch_duration: data.watch_duration,
    completed: data.completed
  });
  console.log('问卷数据:', data.questionnaire);
  console.log('完整数据:', JSON.stringify(data, null, 2));
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 真实实现示例（取消注释并替换URL）：
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('提交失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('提交数据失败:', error);
    throw error;
  }
  */
  
  return { success: true, message: '数据已记录（Mock模式）' };
}

