# Scalable Job Importer with Queue Processing & History Tracking

This project implements a scalable job import system that pulls data from external APIs, queues jobs using Redis, imports them into MongoDB using worker processes, and provides a UI to view import history.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Assumptions](#assumptions)
- [Future Enhancements](#future-enhancements)

## Features

*   **Job Source API Integration**: Fetches job data from various XML-based job feed APIs, converts XML to JSON, and processes them.
*   **Queue-Based Background Processing**: Utilizes Redis with BullMQ for robust, scalable background job processing with configurable concurrency.
*   **Import History Tracking**: Logs detailed import runs including timestamps, total fetched, new jobs, updated jobs, and failed jobs with reasons.
*   **Admin UI (Next.js)**: A user-friendly interface to view import history with pagination and manually trigger imports.
*   **Scalable Design**: Modular codebase with clear separation of concerns, designed for future expansion and potential microservices architecture.

## Architecture

For a detailed explanation of the system design and architectural decisions, please refer to the [Architecture Document](./docs/architecture.md).

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm or yarn
*   MongoDB (local or cloud-based, e.g., MongoDB Atlas)
*   Redis (local or cloud-based, e.g., Redis Cloud)

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `server` directory and add your environment variables:
    ```
    MONGODB_URI=your_mongodb_connection_string
    REDIS_URL=your_redis_connection_string
    PORT=3000
    ```
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/jobsflow` or your MongoDB Atlas connection string).
    *   `REDIS_URL`: Your Redis connection string (e.g., `redis://localhost:6379`).
    *   `PORT`: The port the server will run on (default is `3000`).

### Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `client` directory and add your environment variables:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
    ```
    *   `NEXT_PUBLIC_API_BASE_URL`: The base URL for your backend API (e.g., `http://localhost:3000`).

## Running the Application

1.  **Start the Backend Server**:
    Open a new terminal, navigate to the `server` directory, and run:
    ```bash
    npm run dev
    ```
    This will start the Node.js server, connect to MongoDB and Redis, and automatically begin fetching and queuing jobs hourly.

2.  **Start the Frontend Application**:
    Open another terminal, navigate to the `client` directory, and run:
    ```bash
    npm run dev
    ```
    This will start the Next.js development server.

3.  **Access the Application**:
    Open your browser and navigate to `http://localhost:3000`. You should see the Import History Tracking dashboard.

## API Endpoints

*   **`GET /api/logs`**: Fetches import history logs with pagination.
    *   Query parameters: `page` (default: 1), `limit` (default: 10)
*   **`POST /api/trigger-import`**: Manually triggers a job import process.

## Assumptions

*   **API Stability**: Assumes the external job APIs are stable and return XML in a consistent format.
*   **Job Uniqueness**: Jobs are considered unique based on `sourceId` (derived from `item.id`, `item.guid`, or `item.link`).
*   **Concurrency**: The BullMQ worker is configured with a default concurrency of 5, which can be adjusted based on system resources and API rate limits.
*   **MongoDB Upsert**: Jobs are upserted into MongoDB based on `sourceId`, ensuring no duplicate entries and efficient updates.

## Future Enhancements

*   **Real-time Updates**: Implement Socket.IO or Server-Sent Events for real-time updates on import progress and history.
*   **Retry Logic and Exponential Backoff**: Enhance job worker with robust retry mechanisms for transient failures.
*   **Configurable Batch Size**: Allow batch size for job processing to be environment-configurable.
*   **Dockerization**: Provide Dockerfiles and Docker Compose for easier deployment and environment consistency.
*   **Deployment**: Deploy to cloud platforms like Render/Vercel with MongoDB Atlas and Redis Cloud for a production-ready setup.
*   **Error Reporting**: Integrate with an error tracking service (e.g., Sentry).
*   **More comprehensive logging**: Improve logging for better debugging and monitoring.
*   **API Rate Limiting**: Implement client-side rate limiting for external job APIs to prevent abuse and ensure fair usage.
*   **Dynamic API Sources**: Allow job API URLs to be configured dynamically. 