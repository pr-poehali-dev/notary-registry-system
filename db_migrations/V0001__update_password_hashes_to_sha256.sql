UPDATE t_p91929212_notary_registry_syst.users 
SET password_hash = encode(sha256('password123'::bytea), 'hex')
WHERE email = 'ivanov@example.ru';

UPDATE t_p91929212_notary_registry_syst.users 
SET password_hash = encode(sha256('admin123'::bytea), 'hex')
WHERE email = 'admin@notarinka.ru';