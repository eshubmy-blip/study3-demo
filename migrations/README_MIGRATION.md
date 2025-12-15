# 数据库迁移说明

## 问题描述

`study3_sessions` 表当前以 `user_id` 作为唯一主键，但前端代码需要 `(user_id, video_id)` 的复合唯一约束来支持 `ON CONFLICT (user_id, video_id)` 的 upsert 操作。

**错误信息**：
```
there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## 解决方案

运行迁移脚本，添加 `(user_id, video_id)` 的复合唯一约束。

### 推荐：使用完整版脚本

**文件**：`fix_study3_sessions_unique_constraint.sql`

该脚本会：
1. ✅ **自动检查并清理重复数据**（如果有）
2. ✅ **智能处理主键约束**（保留主键，添加唯一约束）
3. ✅ **确保 video_id 列存在**
4. ✅ **添加复合唯一约束** `(user_id, video_id)`
5. ✅ **提供详细的执行日志**

### 备选：使用简化版脚本

**文件**：`fix_study3_sessions_unique_constraint_simple.sql`

如果完整版脚本执行失败，可以使用这个简化版本。**注意**：简化版需要手动检查重复数据。

## 执行步骤

### 方法 1：在 Supabase Dashboard 中执行（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. 复制 `fix_study3_sessions_unique_constraint.sql` 的全部内容
6. 粘贴到 SQL Editor
7. 点击 **Run** 执行（或按 `Cmd/Ctrl + Enter`）

### 方法 2：使用 Supabase CLI

```bash
# 如果使用 Supabase CLI
supabase db push
```

## 验证迁移

执行完成后，在 SQL Editor 中运行以下查询验证：

```sql
-- 查看约束是否已创建
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'study3_sessions'::regclass
  AND conname = 'study3_sessions_user_id_video_id_key';
```

**预期结果**：
- `constraint_name`: `study3_sessions_user_id_video_id_key`
- `constraint_type`: `u` (unique)
- `constraint_definition`: `UNIQUE (user_id, video_id)`

## 注意事项

### ⚠️ 执行前必读

1. **数据备份**：执行迁移前，建议先备份 `study3_sessions` 表
   ```sql
   -- 备份数据
   CREATE TABLE study3_sessions_backup AS SELECT * FROM study3_sessions;
   ```

2. **重复数据检查**：如果表中已有重复的 `(user_id, video_id)` 组合，迁移会失败
   ```sql
   -- 检查重复数据
   SELECT user_id, video_id, COUNT(*) 
   FROM study3_sessions 
   WHERE video_id IS NOT NULL
   GROUP BY user_id, video_id 
   HAVING COUNT(*) > 1;
   ```

3. **主键处理**：
   - 如果 `user_id` 是主键，迁移脚本会**保留主键**，同时添加唯一约束
   - 这样既保持了现有结构，又支持了复合唯一性

4. **NULL 值处理**：
   - `video_id` 可以为 NULL（如果实验逻辑允许）
   - 唯一约束允许多个 `(user_id, NULL)` 组合

## 回滚方案

如果需要回滚迁移：

```sql
-- 删除复合唯一约束
ALTER TABLE study3_sessions 
DROP CONSTRAINT IF EXISTS study3_sessions_user_id_video_id_key;

-- 如果需要恢复 user_id 的唯一约束（非主键情况）
-- ALTER TABLE study3_sessions 
-- ADD CONSTRAINT study3_sessions_user_id_key UNIQUE (user_id);
```

## 迁移后的效果

迁移完成后，前端代码中的以下操作将正常工作：

```javascript
// src/utils/insertStudy3Session.js
await insertOrUpdateStudy3Session({
  user_id: userId,
  video_id: videoId,
  completed: 1,
  return_count: returnCount,
  stage: 'done',
  updated_at: new Date().toISOString()
})
// ✅ 现在可以正常使用 onConflict: 'user_id,video_id'
```

**前端代码无需修改**，已经在使用正确的 `onConflict` 参数。

## 故障排查

### 问题 1：迁移失败，提示重复数据

**解决方案**：
```sql
-- 手动清理重复数据（保留最新的记录）
DELETE FROM study3_sessions s1
USING study3_sessions s2
WHERE s1.user_id = s2.user_id 
  AND s1.video_id = s2.video_id
  AND s1.video_id IS NOT NULL
  AND s1.updated_at < s2.updated_at;
```

### 问题 2：user_id 是主键，无法删除

**解决方案**：这是正常的。完整版脚本会检测到主键并保留它，只添加唯一约束。

### 问题 3：迁移后前端仍然报错

**检查清单**：
1. ✅ 确认约束已创建（运行验证查询）
2. ✅ 确认前端代码使用 `onConflict: 'user_id,video_id'`
3. ✅ 检查 Supabase 客户端是否已刷新
4. ✅ 查看浏览器控制台的详细错误信息

## 相关文件

- `src/utils/insertStudy3Session.js` - 前端 upsert 代码
- `src/App.jsx` - 调用 session 更新的地方

