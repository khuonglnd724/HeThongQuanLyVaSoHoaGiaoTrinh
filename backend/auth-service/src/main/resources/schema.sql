-- Schema initialization for Auth Service
-- This file defines sequences and base schema before data.sql is loaded

-- Create sequence for user_id if it doesn't exist
-- PostgreSQL will use this sequence for @GeneratedValue(strategy = GenerationType.SEQUENCE)
DO $$
BEGIN
    CREATE SEQUENCE IF NOT EXISTS user_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create sequence for role_id if it doesn't exist
DO $$
BEGIN
    CREATE SEQUENCE IF NOT EXISTS role_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create sequence for permission_id if it doesn't exist
DO $$
BEGIN
    CREATE SEQUENCE IF NOT EXISTS permission_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
