# Contact Us API Documentation

## Overview
The Contact Us API allows users to submit contact requests and administrators to manage them.

## Database Schema
```sql
CREATE TABLE contact_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  company VARCHAR(150),
  services TEXT[] DEFAULT '{}', -- e.g. ['s1', 's2']
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Public Endpoints

### 1. Submit Contact Request
**POST** `/user/contact-us`

Submit a new contact request.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "services": ["web-development", "consulting"]
}
```

#### Field Validation
- `name`: Required, 2-100 characters
- `email`: Required, valid email format, max 150 characters
- `company`: Optional, max 150 characters
- `services`: Optional, array of strings

#### Response (Success - 201)
```json
{
  "status": true,
  "status_code": 201,
  "message": "Contact request submitted successfully. We will get back to you soon.",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "services": ["web-development", "consulting"],
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Response (Validation Error - 400)
```json
{
  "status": false,
  "errors": {
    "name": "Name is required",
    "email": "Email must be a valid email address"
  }
}
```

## Admin Endpoints (Require Authentication)

### 1. Get All Contact Requests
**GET** `/admin/contact-requests`

Retrieve all contact requests (admin only).

#### Headers
```
Authorization: Bearer <token>
```

#### Response (Success - 200)
```json
{
  "status": true,
  "status_code": 200,
  "message": "Contact requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "services": ["web-development", "consulting"],
      "status": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Contact Request by ID
**GET** `/admin/contact-requests/:id`

Retrieve a specific contact request by ID (admin only).

#### Response (Success - 200)
```json
{
  "status": true,
  "status_code": 200,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "services": ["web-development", "consulting"],
    "status": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Update Contact Request Status
**PUT** `/admin/contact-requests/:id/status`

Update the status of a contact request (admin only).

#### Request Body
```json
{
  "status": true
}
```

#### Response (Success - 200)
```json
{
  "status": true,
  "status_code": 200,
  "message": "Contact request status updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "services": ["web-development", "consulting"],
    "status": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### 4. Delete Contact Request
**DELETE** `/admin/contact-requests/:id`

Delete a contact request (admin only).

#### Response (Success - 200)
```json
{
  "status": true,
  "status_code": 200,
  "message": "Contact request deleted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "services": ["web-development", "consulting"],
    "status": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Get Contact Requests by Email
**GET** `/admin/contact-requests/email/:email`

Retrieve all contact requests from a specific email (admin only).

#### Response (Success - 200)
```json
{
  "status": true,
  "status_code": 200,
  "message": "Contact requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "services": ["web-development", "consulting"],
      "status": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Error Responses

### 404 - Not Found
```json
{
  "status": false,
  "status_code": 404,
  "message": "Contact request not found"
}
```

### 401 - Unauthorized
```json
{
  "status": false,
  "status_code": 401,
  "message": "Access token is missing or invalid"
}
```

### 403 - Forbidden
```json
{
  "status": false,
  "status_code": 403,
  "message": "Access denied. Admin privileges required."
}
```

### 500 - Internal Server Error
```json
{
  "status": false,
  "status_code": 500,
  "message": "Internal server error"
}
```

## Features

1. **Email Notification**: When a contact request is submitted, an email notification is sent to the admin email (configured via `ADMIN_EMAIL` environment variable).

2. **Validation**: Comprehensive input validation for all fields.

3. **Status Tracking**: Contact requests have a status field to track whether they've been processed.

4. **Search by Email**: Admin can search for all contact requests from a specific email address.

5. **Audit Trail**: All records include created_at and updated_at timestamps.

## Environment Variables

- `ADMIN_EMAIL`: Email address where contact request notifications will be sent (optional, defaults to 'admin@example.com')

## Database Indexes

The following indexes are created for optimal performance:
- `idx_contact_requests_email`: For email-based lookups
- `idx_contact_requests_status`: For status-based filtering
- `idx_contact_requests_created_at`: For date-based sorting 