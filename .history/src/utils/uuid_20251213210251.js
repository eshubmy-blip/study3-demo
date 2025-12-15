/**
 * 生成唯一用户ID（UUID v4简化版）
 */
export function generateUserId() {
  // 检查localStorage是否已有user_id
  const existingId = localStorage.getItem('study3_user_id');
  if (existingId) {
    return existingId;
  }

  // 生成新的UUID
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  // 保存到localStorage
  localStorage.setItem('study3_user_id', uuid);
  return uuid;
}

