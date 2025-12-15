-- ============================================
-- 简化版：修复 study3_sessions 表的唯一约束
-- ============================================
-- 如果上面的完整版脚本执行失败，可以使用这个简化版本
-- ============================================

-- 步骤 1: 确保 video_id 列存在
ALTER TABLE study3_sessions 
ADD COLUMN IF NOT EXISTS video_id TEXT;

-- 步骤 2: 清理重复数据（如果有）
-- 注意：执行前请先备份数据！
DELETE FROM study3_sessions s1
USING study3_sessions s2
WHERE s1.user_id = s2.user_id 
  AND s1.video_id = s2.video_id
  AND s1.video_id IS NOT NULL
  AND s1.ctid < s2.ctid; -- 保留第一个出现的记录

-- 步骤 3: 删除旧的 user_id 唯一约束（如果不是主键）
-- 如果 user_id 是主键，跳过此步骤，直接执行步骤 4
ALTER TABLE study3_sessions 
DROP CONSTRAINT IF EXISTS study3_sessions_user_id_key;

-- 步骤 4: 删除可能已存在的复合唯一约束
ALTER TABLE study3_sessions 
DROP CONSTRAINT IF EXISTS study3_sessions_user_id_video_id_key;

-- 步骤 5: 创建复合唯一约束
ALTER TABLE study3_sessions 
ADD CONSTRAINT study3_sessions_user_id_video_id_key 
UNIQUE (user_id, video_id);

-- ============================================
-- 完成！
-- ============================================


