INSERT INTO "User" (id, email, password, role, first_name, last_name, status)
VALUES (
    gen_random_uuid(),
    'admin@gmail.com', 
    '$2b$10$76Y1vE1.eG6/HBPInpGvO.NfG78vG7m5Vp6G.vG5vG5vG5vG5vG5v', -- Hash de Admin@123456
    'admin', 
    'Super', 
    'Admin', 
    'active'
)
ON CONFLICT (email) DO NOTHING;