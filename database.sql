-- tài khoản người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ADMIN', 'OPERATOR', 'TECHNICIAN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- thông tin máy chủ
create table servers 
(	
	id SERIAL PRIMARY KEY,
    server_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'UNKNOWN'
        CHECK (status IN ('ONLINE', 'OFFLINE', 'WARNING', 'UNKNOWN')),
    cpu_threshold NUMERIC(5,2) DEFAULT 80,
    ram_threshold NUMERIC(5,2) DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- lịch sử thông số máy chủ
create table history
(  	id BIGSERIAL PRIMARY KEY,
    server_id INT NOT NULL REFERENCES servers(id),
    cpu_usage NUMERIC(5,2),
    ram_usage NUMERIC(5,2),
    network_in BIGINT,
    network_out BIGINT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP	
);

-- cảnh báo 
create table alerts 
( 	id SERIAL PRIMARY KEY,
    server_id INT NOT NULL REFERENCES servers(id),
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'WARNING',
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by INT REFERENCES users(id),
    acknowledged_at TIMESTAMP
);

-- phiếu bảo trì 
create table tickets
(   id SERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    server_id INT NOT NULL REFERENCES servers(id),
    alert_id INT REFERENCES alerts(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    created_by INT REFERENCES users(id),
    assigned_to INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);
-- lịch sử xử lý bảo trì
create table maintenance_logs 
( 	id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(id),
    user_id INT REFERENCES users(id),
    action TEXT NOT NULL,
    root_cause TEXT,
    corrective_action TEXT,
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- nhật ký hoạt động
create table audit_logs 
(
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- index giúp truy vấn nhanh
create index idx_history_server_time
ON history(server_id, recorded_at DESC);

create index idx_alerts_server_status
ON alerts(server_id, status);

create index idx_tickets_assigned_status
ON tickets(assigned_to, status);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- test
-- tài khoản người dùng
INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Admin Demo', 'admin@arimms.local', 'demo_hash', 'ADMIN'),
('Operator Demo', 'operator@arimms.local', 'demo_hash', 'OPERATOR'),
('Technician Demo', 'technician@arimms.local', 'demo_hash', 'TECHNICIAN');

select * from  users;
-- máy chủ
INSERT INTO servers
(server_code, name, description, location, qr_code, status,
 cpu_threshold, ram_threshold)
VALUES
('SRV001', 'Server 01', 'May chu thu nghiem 01',
 'Room A - Rack 01', 'QR-SRV001', 'ONLINE', 80, 80),
('SRV002', 'Server 02', 'May chu thu nghiem 02',
 'Room A - Rack 02', 'QR-SRV002', 'UNKNOWN', 80, 80);

SELECT * FROM servers;
-- lịch sử thông số máy chủ
INSERT INTO history
(server_id, cpu_usage, ram_usage, network_in, network_out)
VALUES
(1, 45.5, 60.2, 1024, 2048),
(1, 92.0, 85.5, 4096, 3072),
(2, 30.0, 40.5, 512, 1024);

SELECT * FROM history;

-- cảnh báo
INSERT INTO alerts
(server_id, alert_type, message, severity, status)
VALUES
(1, 'HIGH_CPU',
 'CPU usage reached 92%, exceeding the 80% threshold',
 'WARNING', 'OPEN');
SELECT * FROM alerts;

-- phiếu bảo trì
INSERT INTO tickets
(ticket_code, server_id, alert_id, title, description,
 status, priority, created_by, assigned_to)
VALUES
(
    'TKT001',
    1,
    1,
    'Xu ly may chu CPU qua tai',
    'Kiem tra CPU 92% va RAM 85.5%',
    'OPEN',
    'HIGH',
    1,
    3
);
SELECT * FROM tickets;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'servers'
ORDER BY ordinal_position;

INSERT INTO users (full_name, email, password_hash, role)
VALUES ('Admin', 'admin@imms.local',
        '$2b$10$FtKos/nLoyXRcf/7Ongpt.Glz.plAb3aAoMLxkxWOGHQU/VNHArhW',
        'ADMIN');

ALTER TABLE servers
  ADD COLUMN manufacturer    VARCHAR(100),
  ADD COLUMN model           VARCHAR(100),
  ADD COLUMN serial_number   VARCHAR(100) UNIQUE,
  ADD COLUMN cpu_model       VARCHAR(100),
  ADD COLUMN ram_gb          INT,
  ADD COLUMN storage_gb      INT,
  ADD COLUMN purchase_date   DATE,
  ADD COLUMN warranty_expiry DATE;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'servers'
ORDER BY ordinal_position;

ALTER TABLE history ADD COLUMN docker_info JSONB;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'history'
ORDER BY ordinal_position;