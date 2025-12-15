-- ============================================
-- 修复 study3_sessions 表的唯一约束
-- ============================================
-- 问题：当前表以 user_id 作为唯一主键，但前端需要 (user_id, video_id) 的复合唯一约束
-- 解决方案：添加复合唯一约束，支持 ON CONFLICT (user_id, video_id)
-- ============================================

-- 步骤 1: 检查是否有重复的 (user_id, video_id) 数据
-- 如果有重复，需要先清理（保留最新的记录）
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, video_id, COUNT(*) as cnt
        FROM study3_sessions
        WHERE video_id IS NOT NULL
        GROUP BY user_id, video_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE '发现 % 组重复的 (user_id, video_id) 数据，正在清理...', duplicate_count;
        
        -- 删除重复数据，保留最新的记录（基于 updated_at 或 created_at）
        DELETE FROM study3_sessions s1
        USING study3_sessions s2
        WHERE s1.user_id = s2.user_id 
          AND s1.video_id = s2.video_id
          AND s1.video_id IS NOT NULL
          AND s2.video_id IS NOT NULL
          AND (
              (s1.updated_at < s2.updated_at) OR
              (s1.updated_at IS NULL AND s2.updated_at IS NOT NULL) OR
              (s1.updated_at = s2.updated_at AND s1.created_at < s2.created_at)
          );
    END IF;
END $$;

-- 步骤 2: 确保 video_id 列存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'study3_sessions' 
        AND column_name = 'video_id'
    ) THEN
        RAISE NOTICE '添加 video_id 列...';
        ALTER TABLE study3_sessions 
        ADD COLUMN video_id TEXT;
    ELSE
        RAISE NOTICE 'video_id 列已存在';
    END IF;
END $$;

-- 步骤 3: 删除旧的 user_id 唯一约束（如果不是主键）
-- 注意：如果 user_id 是主键，我们保留主键，只添加唯一约束
DO $$
DECLARE
    constraint_name TEXT;
    is_primary_key BOOLEAN;
BEGIN
    -- 检查 user_id 是否是主键
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'study3_sessions'
        AND c.contype = 'p'
        AND c.conkey::text LIKE '%' || (
            SELECT attnum::text
            FROM pg_attribute
            WHERE attrelid = t.oid
            AND attname = 'user_id'
        ) || '%'
    ) INTO is_primary_key;
    
    IF NOT is_primary_key THEN
        -- 查找 user_id 的唯一约束
        SELECT conname INTO constraint_name
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'study3_sessions'
        AND c.contype = 'u'
        AND array_length(c.conkey, 1) = 1
        AND (
            SELECT attname
            FROM pg_attribute
            WHERE attrelid = t.oid
            AND attnum = c.conkey[1]
        ) = 'user_id'
        LIMIT 1;
        
        IF constraint_name IS NOT NULL THEN
            RAISE NOTICE '删除旧的 user_id 唯一约束: %', constraint_name;
            EXECUTE format('ALTER TABLE study3_sessions DROP CONSTRAINT IF EXISTS %I', constraint_name);
        END IF;
    ELSE
        RAISE NOTICE 'user_id 是主键，保留主键约束';
    END IF;
END $$;

-- 步骤 4: 删除可能已存在的复合唯一约束（如果存在）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'study3_sessions'
        AND c.conname = 'study3_sessions_user_id_video_id_key'
    ) THEN
        RAISE NOTICE '删除已存在的复合唯一约束...';
        ALTER TABLE study3_sessions 
        DROP CONSTRAINT study3_sessions_user_id_video_id_key;
    END IF;
END $$;

-- 步骤 5: 创建复合唯一约束 (user_id, video_id)
DO $$
BEGIN
    RAISE NOTICE '创建复合唯一约束 (user_id, video_id)...';
    ALTER TABLE study3_sessions 
    ADD CONSTRAINT study3_sessions_user_id_video_id_key 
    UNIQUE (user_id, video_id);
    
    RAISE NOTICE '✅ 复合唯一约束创建成功！';
END $$;

-- ============================================
-- 验证约束
-- ============================================
-- 取消下面的注释来验证约束是否已创建：
/*
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'study3_sessions'::regclass
  AND conname = 'study3_sessions_user_id_video_id_key';
*/

-- ============================================
-- 迁移完成
-- ============================================
-- 现在前端代码中的 upsert 可以使用：
-- onConflict: 'user_id,video_id'
-- ============================================

