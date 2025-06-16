INSERT INTO school_erp.classes (class_name, section, class_teacher_id, created_at, academic_year)
SELECT * FROM (
  SELECT 'Class 1', 'A', NULL, NOW(), '2024-2025'
  UNION ALL
  SELECT 'Class 1', 'B', NULL, NOW(), '2024-2025'
  UNION ALL
  SELECT 'Class 1', 'C', NULL, NOW(), '2024-2025'
  UNION ALL
  SELECT 'Class 1', 'D', NULL, NOW(), '2024-2025'
) AS new_sections (class_name, section, class_teacher_id, created_at, academic_year)
WHERE NOT EXISTS (
  SELECT 1 FROM school_erp.classes c
  WHERE c.class_name = new_sections.class_name AND c.section = new_sections.section
);
	