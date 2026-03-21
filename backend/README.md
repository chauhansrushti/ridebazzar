# RideBazzar Backend API

A Node.js backend API for the RideBazzar car marketplace application.

## Features

- **User Authentication**: Registration, login, JWT-based authentication
- **Car Management**: CRUD operations for car listings with advanced filtering
- **Booking System**: Car booking with status management
- **Payment Processing**: Multi-method payment simulation (Card, UPI, Net Banking, Wallet)
- **Transaction Management**: Payment tracking and refund processing
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MySQL with proper relationships and indexing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Environment**: dotenv

## BASIC MODULES

### User Module

The User Module handles all customer-facing functionality for the RideBazzar platform. It provides comprehensive features for car buyers and sellers to interact with the marketplace.

#### Core Features

**Authentication & Profile Management**

- User registration with email verification
- Secure login/logout with JWT tokens
- Profile management (update personal info, contact details, location)
- Password change functionality
- Account security with bcrypt hashing

**Car Browsing & Discovery**

- Browse all available car listings
- Advanced filtering (make, model, year, price range, fuel type, transmission)
- Search functionality with keywords
- Car detail views with complete specifications
- Image galleries and car condition status
- Location-based car discovery

**Car Listing Management** (For Sellers)

- Create new car listings with detailed information
- Upload and manage car images
- Edit existing car listings
- Delete/deactivate car listings
- View listing performance and inquiries
- Manage pricing and availability

**Booking & Purchase Process**

- Book cars for viewing/purchase
- Booking status tracking (pending, confirmed, completed, cancelled)
- Communication with sellers through booking system
- Booking history and management
- Cancellation handling

**Payment Integration**

- Multiple payment methods (Credit/Debit Card, UPI, Net Banking, Wallet)
- Secure payment processing
- Transaction history tracking
- Payment status monitoring
- Refund processing for cancelled bookings

**Dashboard Features**

- Personal dashboard with activity overview
- My bookings (as buyer)
- My car listings (as seller)
- Sales tracking (for sellers)
- Transaction history
- Profile completion status

#### API Endpoints Used

- `/api/auth/*` - Authentication operations
- `/api/cars/*` - Car browsing and management
- `/api/bookings/*` - Booking operations
- `/api/payments/*` - Payment processing

#### User Workflow

1. **Registration/Login** → User creates account or logs in
2. **Browse Cars** → User searches and filters available cars
3. **View Details** → User examines specific car information
4. **Book Car** → User initiates booking process
5. **Payment** → User completes payment transaction
6. **Manage Activity** → User tracks bookings and manages listings

### Admin Module

The Admin Module provides comprehensive administrative control over the RideBazzar platform. It includes user management, content moderation, transaction oversight, and system analytics.

#### Core Features

**User Management**

- View all registered users with detailed profiles
- User account status management (active, suspended, banned)
- User verification and document approval
- Monitor user activity and behavior
- Handle user complaints and disputes
- Mass communication with users

**Car Listing Oversight**

- Review and approve new car listings
- Content moderation for car descriptions and images
- Pricing validation and market analysis
- Featured listings management
- Remove inappropriate or fraudulent listings
- Car listing analytics and reporting

**Booking Management**

- Monitor all booking activities across the platform
- Resolve booking disputes between buyers and sellers
- Track booking conversion rates
- Manage booking status updates
- Handle cancellations and refund requests
- Booking trend analysis

**Transaction Monitoring**

- Real-time transaction monitoring and alerts
- Payment verification and fraud detection
- Refund processing and approval
- Transaction dispute resolution
- Financial reporting and analytics
- Payment gateway management

**Platform Analytics**

- User registration and activity statistics
- Car listing performance metrics
- Booking and conversion analytics
- Revenue tracking and financial reports
- Popular car models and pricing trends
- Geographic usage patterns

**System Configuration**

- Platform settings and configuration management
- Fee structure and commission management
- Email template customization
- Notification settings and alerts
- API rate limiting and security settings
- Database backup and maintenance scheduling

#### Admin Dashboard Features

- **Overview Metrics** - Key performance indicators and real-time stats
- **User Analytics** - User growth, activity, and demographic insights
- **Sales Reports** - Revenue, transaction volumes, and payment methods
- **Content Management** - Bulk operations for cars and user content
- **Security Monitoring** - Suspicious activity alerts and security logs
- **System Health** - Server performance, API response times, error rates

#### Administrative Workflows

1. **User Oversight** → Monitor registrations, verify accounts, handle issues
2. **Content Review** → Approve car listings, moderate content quality
3. **Transaction Control** → Monitor payments, handle disputes, process refunds
4. **Analytics Review** → Generate reports, analyze trends, make decisions
5. **System Maintenance** → Configure settings, manage security, optimize performance

#### Security & Permissions

- Role-based access control for different admin levels
- Audit logging for all administrative actions
- Two-factor authentication for admin accounts
- IP restrictions and session management
- Encrypted sensitive data handling
- Regular security assessments and updates

## Database Schema

### Tables

- `users` - User accounts and profiles
- `cars` - Car listings with details
- `bookings` - Booking records between buyers and sellers
- `transactions` - Payment and refund transactions
- `messages` - Future messaging system

### 4.2.1 Data Files

The RideBazzar system utilizes various data files for configuration, initialization, and storage management. These files ensure proper system setup, data integrity, and seamless operation.

#### Database Files

**Schema Files**

- **`database/schema.sql`** - Complete database schema definition
  - Contains CREATE TABLE statements for all database tables
  - Includes indexes, foreign key constraints, and relationships
  - Defines data types, constraints, and default values
  - Used for initial database setup and migrations

**Seed Data Files**

- **`database/seeds/users.sql`** - Sample user data for testing

  - Demo user accounts with various roles (admin, regular users)
  - Pre-configured profiles for development environment
  - Test authentication credentials

- **`database/seeds/cars.sql`** - Sample car listings

  - Diverse car inventory with different makes, models, and years
  - Various price ranges and conditions for testing filters
  - Sample images and descriptions

- **`database/seeds/bookings.sql`** - Sample booking records

  - Test booking scenarios with different statuses
  - Relationships between users and cars
  - Historical booking data for analytics testing

- **`database/seeds/transactions.sql`** - Sample payment data
  - Test transaction records for different payment methods
  - Success and failure scenarios for testing
  - Refund and cancellation examples

#### Configuration Files

**Environment Configuration**

- **`.env`** - Environment variables and secrets

  - Database connection parameters
  - JWT secret keys and authentication settings
  - API keys for external services
  - Server configuration (port, environment mode)
  - Email service configuration

- **`.env.example`** - Template for environment setup
  - Sample configuration values
  - Documentation for required variables
  - Security guidelines for production

**Application Configuration**

- **`config/database.js`** - Database connection configuration

  - Connection pool settings
  - Query timeout configurations
  - SSL settings for production
  - Migration and seeding configurations

- **`config/auth.js`** - Authentication configuration
  - JWT token expiration settings
  - Password hashing parameters
  - Session management configuration
  - Security policy definitions

#### Log Files

**Application Logs**

- **`logs/app.log`** - General application logs

  - Server startup and shutdown events
  - API request/response logs
  - Error tracking and debugging information
  - Performance metrics

- **`logs/error.log`** - Error-specific logs

  - Database connection errors
  - Authentication failures
  - Payment processing errors
  - System exceptions and stack traces

- **`logs/access.log`** - HTTP access logs
  - Request timestamps and user agents
  - IP addresses and request methods
  - Response status codes and processing times
  - Security monitoring data

#### Static Data Files

**Car Data References**

- **`data/car-makes.json`** - Standardized car manufacturer list

  - Complete list of supported car brands
  - Brand logos and metadata
  - Regional availability information

- **`data/car-models.json`** - Model information by manufacturer

  - Model names organized by make
  - Year ranges for each model
  - Engine specifications and variants

- **`data/locations.json`** - Supported cities and regions
  - City names with coordinates
  - State and country information
  - Service area definitions

**Validation Data**

- **`data/validation-rules.json`** - Input validation schemas
  - Field validation rules for forms
  - Data format requirements
  - Business logic constraints
  - Error message templates

#### Upload Storage

**User Uploads**

- **`uploads/profiles/`** - User profile pictures

  - Organized by user ID subdirectories
  - Multiple image formats supported
  - Automatic resizing and optimization

- **`uploads/cars/`** - Car listing images

  - Multiple images per car listing
  - Thumbnail generation for performance
  - Image metadata and alt text storage

- **`uploads/documents/`** - User verification documents
  - Identity verification files
  - Car ownership documents
  - Encrypted storage for sensitive data

#### Backup Files

**Database Backups**

- **`backups/daily/`** - Daily database snapshots

  - Automated backup scheduling
  - Compressed SQL dump files
  - Retention policy for storage management

- **`backups/migration/`** - Migration backup files
  - Pre-migration database states
  - Rollback capability for failed migrations
  - Version-controlled schema changes

**Application Backups**

- **`backups/uploads/`** - User-uploaded file backups
  - Regular synchronization of upload directories
  - Cloud storage integration
  - Disaster recovery planning

#### File Management Features

**File Organization**

- Hierarchical directory structure for easy navigation
- Automated file naming conventions
- Metadata tracking for all uploaded files
- File type validation and security scanning

**Storage Optimization**

- Image compression and format optimization
- Lazy loading for large file collections
- CDN integration for global file delivery
- Cache management for frequently accessed files

**Security Measures**

- File access permissions and user authentication
- Virus scanning for uploaded content
- Encrypted storage for sensitive documents
- Audit trails for file access and modifications

**Data Lifecycle Management**

- Automated cleanup of temporary files
- Archival of old transaction records
- Retention policies for log files
- GDPR compliance for user data deletion

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout user

### Cars (`/api/cars`)

- `GET /` - Get all cars with filters and pagination
- `GET /:id` - Get single car details
- `POST /` - Create new car listing (auth required)
- `PUT /:id` - Update car listing (auth required)
- `DELETE /:id` - Delete car listing (auth required)
- `GET /user/my-cars` - Get user's car listings (auth required)

### Bookings (`/api/bookings`)

- `POST /` - Create new booking (auth required)
- `GET /my-bookings` - Get user's bookings as buyer (auth required)
- `GET /my-sales` - Get bookings for user's cars as seller (auth required)
- `GET /:id` - Get booking details (auth required)
- `PUT /:id/status` - Update booking status (auth required)
- `DELETE /:id` - Cancel booking (auth required)

### Payments (`/api/payments`)

- `POST /process` - Process payment (auth required)
- `GET /status/:transactionId` - Get payment status (auth required)
- `GET /history` - Get transaction history (auth required)
- `POST /refund/:transactionId` - Process refund (auth required)

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the backend directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ridebazzar
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Setup MySQL Database**

   - Create a new MySQL database named `ridebazzar`
   - Import the schema:

   ```bash
   mysql -u root -p ridebazzar < database/schema.sql
   ```

5. **Start the server**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify installation**
   - API should be running on `http://localhost:5000`
   - Health check: `http://localhost:5000/api/health`

## Development Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run database initialization
npm run db:init

# Run database seeding
npm run db:seed
```

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123",
    "fullName": "John Doe",
    "phone": "9876543210",
    "location": "Mumbai"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "Password123"
  }'
```

### Create Car Listing

```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "make": "Maruti Suzuki",
    "model": "Swift",
    "year": 2020,
    "price": 650000,
    "mileage": 15000,
    "fuelType": "Petrol",
    "transmission": "Manual",
    "conditionStatus": "Excellent",
    "color": "Red",
    "description": "Well maintained car",
    "location": "Delhi"
  }'
```

### Get Cars with Filters

```bash
curl "http://localhost:5000/api/cars?make=Maruti&priceFrom=500000&priceTo=800000&page=1&limit=10"
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **SQL Injection Prevention**: Parameterized queries

## Database Relationships

- Users can have multiple car listings (1:N)
- Users can make multiple bookings (1:N)
- Cars can have multiple bookings (1:N)
- Bookings have multiple transactions (1:N)
- Foreign key constraints ensure data integrity

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

| Variable       | Description           | Default               |
| -------------- | --------------------- | --------------------- |
| `DB_HOST`      | MySQL host            | localhost             |
| `DB_USER`      | MySQL username        | root                  |
| `DB_PASSWORD`  | MySQL password        | -                     |
| `DB_NAME`      | Database name         | ridebazzar            |
| `DB_PORT`      | MySQL port            | 3306                  |
| `JWT_SECRET`   | JWT signing secret    | -                     |
| `PORT`         | Server port           | 5000                  |
| `NODE_ENV`     | Environment           | development           |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## License

This project is part of the RideBazzar application suite.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository.
