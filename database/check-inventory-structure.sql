SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory' 
ORDER BY ordinal_position;
