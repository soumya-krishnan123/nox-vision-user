-- Create contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  company VARCHAR(150),
  services TEXT[] DEFAULT '{}', -- e.g. ['s1', 's2']
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);

-- Add comment to table
COMMENT ON TABLE contact_requests IS 'Stores contact form submissions from users';
COMMENT ON COLUMN contact_requests.services IS 'Array of service names the user is interested in';
COMMENT ON COLUMN contact_requests.status IS 'Whether the contact request has been processed (true) or pending (false)'; 