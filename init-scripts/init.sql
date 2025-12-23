-- Create databases for all services
CREATE DATABASE auth_db;
CREATE DATABASE academic_db;
CREATE DATABASE syllabus_db;
CREATE DATABASE workflow_db;
CREATE DATABASE public_db;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE academic_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE syllabus_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workflow_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE public_db TO postgres;
