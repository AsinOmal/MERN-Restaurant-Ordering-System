# System Architecture

## Overview
FoodFlow is a full-stack MERN (MongoDB, Express, React, Node.js) application with real-time features powered by WebSockets.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Port 5173]
        A1[Components]
        A2[Pages]
        A3[Context<br/>Auth & Socket]
        A4[Services<br/>API Client]
    end

    subgraph "Server Layer"
        B[Express Backend<br/>Port 5001]
        B1[Routes]
        B2[Controllers]
        B3[Middleware<br/>Auth, Upload]
        B4[Socket.io Server]
    end

    subgraph "Database Layer"
        C[(MongoDB<br/>Port 27017)]
        C1[Users]
        C2[Restaurants]
        C3[Menu Items]
        C4[Orders]
        C5[Reviews]
    end

    A --> |HTTP/REST| B
    A <--> |WebSocket| B4
    A1 --> A4
    A2 --> A3
    A4 --> |Axios| B1
    B1 --> B2
    B2 --> B3
    B2 --> C
    B4 --> C4
```

---

## Component Interaction Flow

### 1. User Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant A as Auth API
    participant DB as MongoDB

    U->>R: Enter credentials
    R->>A: POST /api/auth/login
    A->>DB: Query User collection
    DB-->>A: User data
    A->>A: Verify password (bcrypt)
    A->>A: Generate JWT token
    A-->>R: {token, user data}
    R->>R: Store in AuthContext
    R-->>U: Redirect to dashboard
```

### 2. Order Placement Flow
```mermaid
sequenceDiagram
    participant C as Customer
    participant UI as React UI
    participant API as Order API
    participant WS as WebSocket Server
    participant DB as MongoDB
    participant O as Owner Dashboard

    C->>UI: Place Order
    UI->>API: POST /api/orders
    API->>DB: Create Order document
    DB-->>API: Order created
    API->>WS: Emit 'order:new' event
    WS-->>O: Real-time notification
    API-->>UI: Order confirmation
    UI-->>C: Success message
```

### 3. Real-Time Order Updates
```mermaid
sequenceDiagram
    participant O as Owner
    participant OD as Owner Dashboard
    participant WS as WebSocket
    participant C as Customer App

    O->>OD: Update order status
    OD->>WS: Emit status change
    WS->>WS: Identify customer room
    WS-->>C: Push update via socket
    C->>C: Update UI (no refresh)
    C-->>C: Show notification
```

---

## Data Models

### Core Entities
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ CART : has
    RESTAURANT ||--o{ MENU_ITEM : offers
    RESTAURANT ||--o{ ORDER : receives
    RESTAURANT ||--o{ REVIEW : receives
    ORDER ||--|{ ORDER_ITEM : contains
    MENU_ITEM ||--o{ ORDER_ITEM : included_in
    MENU_ITEM ||--o{ CART_ITEM : added_to

    USER {
        ObjectId _id
        string name
        string email
        string password
        enum role
        ObjectId restaurant
    }

    RESTAURANT {
        ObjectId _id
        string name
        string description
        object address
        array cuisineTypes
        float rating
    }

    MENU_ITEM {
        ObjectId _id
        ObjectId restaurant
        string name
        float price
        string category
        boolean available
    }

    ORDER {
        ObjectId _id
        ObjectId customer
        ObjectId restaurant
        array items
        float totalAmount
        enum status
    }
```

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Charts**: Recharts
- **Styling**: Vanilla CSS with custom variables

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Security**: Helmet, CORS

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Supertest
- **Linting**: ESLint
- **Containerization**: Docker

---

## Deployment Architecture

```mermaid
graph LR
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Application Servers"
            AS1[Node.js Instance 1]
            AS2[Node.js Instance 2]
        end
        
        subgraph "Static Assets"
            CDN[CDN<br/>React Build]
        end
        
        subgraph "Database Cluster"
            DB1[(MongoDB Primary)]
            DB2[(MongoDB Secondary)]
        end
    end

    Client[Client Browser] --> CDN
    Client --> LB
    LB --> AS1
    LB --> AS2
    AS1 --> DB1
    AS2 --> DB1
    DB1 --> DB2
```

---

## Security Measures

### Authentication & Authorization
- JWT tokens with 24h expiration
- HTTP-only cookies for token storage
- Role-based access control (Customer, Staff, Owner, Admin)
- Protected routes with middleware

### Data Protection
- Password hashing with bcrypt (10 rounds)
- Input validation with express-validator
- XSS protection with Helmet
- CORS configuration for trusted origins

### API Security
- Rate limiting (future enhancement)
- Request sanitization
- Secure headers via Helmet
- Environment variable protection

---

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image optimization (WebP format)
- Lazy loading for images
- React Context for state management (avoiding prop drilling)

### Backend
- Database indexing on frequently queried fields
- Mongoose lean queries for read-only operations
- Connection pooling for MongoDB
- Efficient aggregation pipelines for analytics

### Real-Time
- Socket.io rooms for targeted broadcasts
- Event-based architecture (no polling)
- Automatic reconnection handling

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session data in JWT (no server-side sessions)
- Socket.io Redis adapter for multi-instance WebSocket support

### Database Scaling
- MongoDB replica sets for high availability
- Sharding strategy for large datasets
- Read replicas for analytics queries

### Caching Strategy (Future)
- Redis for session storage
- CDN for static assets
- API response caching for public endpoints

---

## Monitoring & Logging

### Application Monitoring
- Morgan for HTTP request logging
- Console logging with color-coded levels
- Error tracking middleware

### Future Enhancements
- Winston for structured logging
- Prometheus for metrics collection
- Grafana for visualization
- Sentry for error tracking
