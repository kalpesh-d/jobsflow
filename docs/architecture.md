# System Architecture: Scalable Job Importer

## 1. Overview

This document outlines the architecture of the Scalable Job Importer system, designed to efficiently fetch job listings from various external APIs, process them in a background queue, and store them in a MongoDB database, while maintaining a comprehensive history of all import operations.

## 2. Technology Stack

*   **Frontend**: Next.js (React Framework)
*   **Backend**: Node.js with Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Queue**: BullMQ (built on Redis)
*   **Queue Store**: Redis
*   **API Communication**: Axios
*   **XML Parsing**: `fast-xml-parser`

## 3. High-Level Architecture Diagram

```mermaid
graph TD
    A[External Job APIs] --> B{Node.js Backend}
    B --> C(Redis Queue - BullMQ)
    C --> D[Node.js Workers]
    D --> E[MongoDB]
    B ---"Writes Import Logs"---> E
    F[Next.js Frontend] --> B
    E ---"Reads Import Logs"---> B
```

## 4. Component Breakdown and Design Decisions

### 4.1. Node.js Backend (`/server`)

**Purpose**: The central hub for API exposure, job fetching initiation, and communication with the queue and database.

**Components**:

*   **`app.js`**: The main entry point for the Express.js application. It handles middleware (CORS, JSON parsing), sets up API routes, connects to MongoDB, and initiates the hourly job fetching process.
    *   **Decision**: Using Express.js for its simplicity and flexibility in building RESTful APIs. `dotenv` is used for environment variable management, ensuring sensitive information is not hardcoded.
*   **`routes/importRoutes.js`**: Defines the API endpoints related to job imports and history.
    *   **Decision**: Separate route definitions enhance modularity and organization.
*   **`controllers/importController.js`**: Contains the logic for handling requests to the import-related API endpoints. This includes triggering manual imports and fetching import logs.
    *   **Decision**: Controllers abstract business logic from route definitions, making routes cleaner and controllers more focused on request handling.
*   **`services/fetchJobs.service.js`**: Responsible for fetching job data from external XML APIs, parsing the XML response into JSON, and adding these jobs to the Redis queue.
    *   **Decision**: This service encapsulates the external API integration and data transformation logic. Using `axios` for HTTP requests and `fast-xml-parser` for efficient XML parsing, chosen for its performance and handling of various XML structures, including attributes and namespaces. The `urls` array is hardcoded for simplicity, but in a production environment, this would likely be configurable or fetched from a database.
*   **`queues/jobQueue.js`**: Initializes and exports the BullMQ queue instance.
    *   **Decision**: BullMQ was chosen for its robust features for background job processing, including persistence (via Redis), retries, and concurrency control, which are crucial for a scalable importer. Separating the queue definition ensures consistent access across the application.
*   **`workers/jobWorker.js`**: Contains the logic for processing jobs from the BullMQ queue. This worker is responsible for importing (upserting) job data into MongoDB and logging the import results.
    *   **Decision**: Workers handle the heavy lifting of data processing off the main thread, preventing blocking and improving responsiveness. The worker includes logic for upserting jobs (finding existing by `sourceId` and updating, or creating new ones) and comprehensively logging success, new, updated, and failed jobs with reasons. Concurrency is set to 5, which can be configured via environment variables for optimal performance based on resource availability and external API rate limits.
*   **`models/job.model.js`**: Mongoose schema definition for individual job entries.
    *   **Decision**: MongoDB is ideal for flexible schema data like job listings. `sourceId` is set as unique to prevent duplicate job entries from different API feeds or re-imports. `createdAt` and `updatedAt` timestamps are automatically managed.
*   **`models/importLog.model.js`**: Mongoose schema definition for tracking import history.
    *   **Decision**: A separate collection for import logs ensures that historical data is isolated and easily queryable. It captures all required metrics: `timestamp`, `totalFetched`, `totalImported`, `newJobs`, `updatedJobs`, and `failedJobs` with their reasons for detailed auditing.
*   **`config/redis.js`**: Handles the Redis connection configuration.
    *   **Decision**: Centralizing Redis connection settings ensures consistency and easy modification. `ioredis` is used for connecting to Redis due to its performance and feature set.

### 4.2. Next.js Frontend (`/client`)

**Purpose**: Provides an intuitive administrative interface for viewing import history and triggering manual imports.

**Components**:

*   **`app/page.js`**: The main page component that orchestrates the display of import logs. It fetches data from the backend, manages pagination, and integrates with other UI components.
    *   **Decision**: Next.js was chosen for its excellent developer experience, performance optimizations (like server-side rendering and static site generation, though client-side fetching is used here for dynamic data), and routing capabilities. React hooks (`useState`, `useEffect`) are used for state management and side effects.
*   **`components/logs/LogHeader.jsx`**: Displays the title, description, and a button to manually trigger a job import.
    *   **Decision**: Reusable component for the header section, encapsulating the import trigger functionality and loading states.
*   **`components/logs/LogTable.jsx`**: Renders the import history logs in a tabular format, showing details like file name, timestamp, and counts of fetched, new, updated, and failed jobs. It also includes expandable details for failed jobs.
    *   **Decision**: A dedicated component for the table ensures clean rendering and separation of concerns. Conditional rendering for empty states and loading indicators provides a better user experience. Failed jobs are displayed with a `details`/`summary` tag for a compact yet informative view.
*   **`components/logs/LogPagination.jsx`**: Provides pagination controls for navigating through the import history logs.
    *   **Decision**: Standard pagination component for navigating large datasets efficiently.
*   **`lib/utils.js`**: Contains utility functions (e.g., `cn` for Tailwind CSS class merging).
*   **`components/ui/*`**: Reusable UI components (e.g., Button, Card, Table, Badge) for consistent design and faster development.
    *   **Decision**: Utilizes a component library (likely Shadcn UI or similar) for pre-built, accessible, and themeable UI elements, accelerating frontend development.

## 5. Data Flow

1.  **Job Fetching**: The `fetchJobs.service.js` initiates an HTTP GET request to external job APIs (e.g., Jobicy). The response (XML) is then parsed into JSON.
2.  **Queueing**: The parsed JSON job items are added as a job to the `jobQueue` (BullMQ/Redis).
3.  **Job Processing**: `jobWorker.js` picks up jobs from the `jobQueue`. For each job item:
    *   It attempts to find an existing job in MongoDB using `sourceId`.
    *   If found, the existing job is updated (upserted); otherwise, a new job document is created.
    *   Counts for `newJobs`, `updatedJobs`, and `failedJobs` are incremented.
4.  **Import Logging**: After processing all items from a single API source, `jobWorker.js` creates an `ImportLog` entry in MongoDB, summarizing the import run.
5.  **Frontend Display**: The Next.js frontend makes a `GET` request to `/api/logs` on the Node.js backend to fetch paginated import history. The backend queries the `import_logs` collection in MongoDB, sorts by timestamp, and returns the data to the frontend.
6.  **Manual Trigger**: The frontend can also send a `POST` request to `/api/trigger-import` to manually initiate the job fetching and queuing process.

## 6. Scalability Considerations

*   **Queue-Based Processing**: BullMQ and Redis enable highly scalable background job processing. Additional workers can be easily spun up to increase processing throughput without affecting the main API server.
*   **Microservices Potential**: The clear separation of concerns (fetching, queuing, working, logging) lays a solid foundation for breaking down the system into independent microservices if needed in the future.
*   **Database**: MongoDB's flexible schema and horizontal scalability support handling a growing volume of job data and import logs.
*   **Concurrency**: The worker concurrency (`concurrency: 5`) is configurable and can be adjusted to optimize resource utilization and avoid overloading external APIs or the database.

## 7. Error Handling and Logging

*   **Backend**: `try-catch` blocks are used in asynchronous operations (e.g., API calls, database operations, worker processing) to gracefully handle errors. Errors are logged to the console.
*   **Worker**: Failed job items are captured within the `failedJobs` array in the `ImportLog` document, providing detailed reasons for failures. The BullMQ worker also has an `on('failed')` event listener for general worker errors.
*   **Frontend**: Displays user-friendly messages for import triggers and loading states. Console logs are used for development debugging.

## 8. Areas for Improvement (Future Enhancements)

As mentioned in the main `README.md`, potential future enhancements include:

*   Real-time updates using WebSockets (Socket.IO/SSE).
*   More sophisticated retry mechanisms and exponential backoff for failed jobs.
*   Externalizing configuration for API URLs, concurrency, and batch sizes.
*   Dockerization for simplified deployment.
*   Comprehensive error reporting and monitoring.

This architecture provides a robust and extensible foundation for a scalable job importing system. 