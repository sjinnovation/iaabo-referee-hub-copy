-- ============================================================
-- Initialize progression for existing users
-- Run this AFTER running the 008_member_progression_table.sql migration
-- This script will initialize progression for any existing users
-- ============================================================

-- Initialize progression for all existing users who don't have progression records yet
DO $$
DECLARE
  user_record RECORD;
  progression_count INTEGER;
BEGIN
  -- Loop through all users in profiles
  FOR user_record IN 
    SELECT id, board_id, is_active FROM public.profiles
  LOOP
    -- Check if user already has progression records
    SELECT COUNT(*) INTO progression_count
    FROM public.member_progression
    WHERE user_id = user_record.id;
    
    -- Only initialize if no records exist
    IF progression_count = 0 THEN
      RAISE NOTICE 'Initializing progression for user: %', user_record.id;
      
      -- Initialize base progression
      PERFORM public.initialize_member_progression(user_record.id);
      
      -- If user already has a board assigned, mark board_assignment as completed
      IF user_record.board_id IS NOT NULL THEN
        RAISE NOTICE 'User % has board assigned, marking board_assignment as completed', user_record.id;
        PERFORM public.update_progression_step(
          user_record.id,
          'board_assignment'::progression_step_type,
          'completed'::progression_status,
          'Board assigned before progression system',
          jsonb_build_object('board_id', user_record.board_id, 'migrated', true)
        );
      END IF;
      
      -- If user is already active, mark active_member as completed
      IF user_record.is_active = true THEN
        RAISE NOTICE 'User % is active, marking active_member as completed', user_record.id;
        PERFORM public.update_progression_step(
          user_record.id,
          'active_member'::progression_step_type,
          'completed'::progression_status,
          'Active member before progression system',
          jsonb_build_object('migrated', true)
        );
      END IF;
    ELSE
      RAISE NOTICE 'User % already has % progression records, skipping', user_record.id, progression_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Progression initialization complete!';
END $$;

-- Verify the results
SELECT 
  COUNT(DISTINCT user_id) as total_users_with_progression,
  COUNT(*) as total_progression_records
FROM public.member_progression;

-- Show summary by step
SELECT 
  step_type,
  status,
  COUNT(*) as count
FROM public.member_progression
GROUP BY step_type, status
ORDER BY 
  CASE step_type
    WHEN 'registration' THEN 1
    WHEN 'rules_test' THEN 2
    WHEN 'board_assignment' THEN 3
    WHEN 'mechanics_course' THEN 4
    WHEN 'payment' THEN 5
    WHEN 'active_member' THEN 6
  END,
  CASE status
    WHEN 'completed' THEN 1
    WHEN 'in_progress' THEN 2
    WHEN 'not_started' THEN 3
    WHEN 'waived' THEN 4
    WHEN 'failed' THEN 5
  END;
