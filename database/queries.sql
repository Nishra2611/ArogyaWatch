-- ===============================================================================
-- ArogyaStock Sentinel - Example Queries
-- ===============================================================================

-- 1. View Current Stock Levels Across All PHCs (with Minimum Threshold Warning)
SELECT 
    p.name AS PHC_Name,
    m.name AS Medicine_Name,
    m.min_stock_threshold,
    s.quantity AS Current_Stock,
    CASE 
        WHEN s.quantity <= m.min_stock_threshold THEN 'LOW STOCK WARNING'
        ELSE 'SAFE'
    END AS Stock_Status
FROM stock s
JOIN phc_centers p ON s.phc_id = p.phc_id
JOIN medicines m ON s.medicine_id = m.medicine_id
ORDER BY p.name, m.name;


-- 2. Calculate Average Daily Consumption over the last 30 days
-- This logic helps power the "Days of Stock Remaining" early warning system
SELECT 
    p.name AS PHC_Name,
    m.name AS Medicine,
    SUM(t.quantity) AS Total_Consumed_30_Days,
    ROUND(SUM(t.quantity) / 30, 2) AS Avg_Daily_Consumption
FROM stock_transactions t
JOIN phc_centers p ON t.phc_id = p.phc_id
JOIN medicines m ON t.medicine_id = m.medicine_id
WHERE t.transaction_type = 'OUT'
  AND t.transaction_date >= SYSDATE - 30
GROUP BY p.name, m.name;


-- 3. View All Active Critical Alerts
SELECT 
    a.alert_id,
    p.name AS PHC_Name,
    m.name AS Medicine_Name,
    a.alert_type,
    a.alert_message,
    a.severity,
    a.created_at
FROM alerts a
JOIN phc_centers p ON a.phc_id = p.phc_id
JOIN medicines m ON a.medicine_id = m.medicine_id
WHERE a.status = 'ACTIVE' 
  AND a.severity IN ('HIGH', 'CRITICAL')
ORDER BY a.created_at DESC;


-- 4. Expiry Tracking: Medicines Expiring in the Next 90 Days
SELECT 
    p.name AS PHC_Name,
    m.name AS Medicine_Name,
    s.batch_number,
    s.quantity,
    s.expiry_date,
    TRUNC(s.expiry_date - SYSDATE) AS Days_To_Expiry
FROM stock s
JOIN phc_centers p ON s.phc_id = p.phc_id
JOIN medicines m ON s.medicine_id = m.medicine_id
WHERE s.expiry_date BETWEEN SYSDATE AND SYSDATE + 90
ORDER BY s.expiry_date ASC;
