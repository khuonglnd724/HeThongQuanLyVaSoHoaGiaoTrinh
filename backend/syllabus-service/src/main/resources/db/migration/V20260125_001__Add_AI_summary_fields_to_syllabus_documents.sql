-- V20260125_001__Add_AI_summary_fields_to_syllabus_documents.sql
-- Add AI ingestion job tracking fields to support document-specific AI summaries

ALTER TABLE syllabus_documents 
ADD COLUMN ai_ingestion_job_id VARCHAR(50),
ADD COLUMN ai_summary_generated_at TIMESTAMP;

-- Create index for efficient job lookup
CREATE INDEX idx_documents_ai_job_id ON syllabus_documents(ai_ingestion_job_id);

-- Add comment
COMMENT ON COLUMN syllabus_documents.ai_ingestion_job_id IS 'Job ID from AI service for document summary generation';
COMMENT ON COLUMN syllabus_documents.ai_summary_generated_at IS 'Timestamp when AI summary was last generated for this document';
