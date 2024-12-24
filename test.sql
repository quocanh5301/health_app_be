select * from account_login_status;
select * from account;
select * from user_run_data;
select * from account_login_status;

select * from user_heart_rate_data;
select * from user_run_data;
select * from muscle_group;
SELECT 
                user_id, 
                measured_at, 
                heart_rate, 
                stress_level
            FROM 
                user_heart_rate_data
            WHERE 
                user_id = 1
                AND measured_at BETWEEN '2024-11-26 17:00:00' AND '2024-12-03 16:59:59'
            ORDER BY 
                measured_at DESC;
                
               SELECT 
    user_id, 
    measured_at, 
    heart_rate, 
    stress_level
FROM 
    user_heart_rate_data
WHERE 
    --user_id = 1
    --AND 
    measured_at >= '2024-11-30 17:00:00'
    --AND measured_at <= '2024-12-03 16:59:59'
ORDER BY 
    measured_at DESC;
   
   SELECT 
    measured_at
FROM 
    user_heart_rate_data
WHERE 
    measured_at >= '2024-11-26 17:00:00.000'
    AND measured_at <= '2024-12-03 16:59:59.999';

