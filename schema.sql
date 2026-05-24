DROP TABLE IF EXISTS machines;
CREATE TABLE machines (
    hostname TEXT PRIMARY KEY,
    machine_type TEXT,
    os TEXT,
    uptime_seconds INTEGER,
    last_seen INTEGER,
    disks TEXT
);
