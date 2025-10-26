# Aragon.ai Image Upload System

A comprehensive image upload and validation system built with Next.js, featuring advanced image processing, security measures, and cloud storage integration.

## Features

### 🚀 Core Functionality
- **Chunked Upload**: Support for large file uploads with progress tracking
- **Image Validation**: Comprehensive validation with 6 different rules
- **Format Conversion**: Automatic HEIC to JPEG conversion using Sharp
- **Cloud Storage**: AWS S3 integration for scalable file storage
- **Database**: PostgreSQL with Prisma ORM for metadata storage

### 🔒 Security Features
- **File Type Validation**: Strict MIME type checking
- **Size Limits**: Configurable file size restrictions
- **Rate Limiting**: API rate limiting to prevent abuse
- **Secure Filenames**: Sanitized file naming to prevent path traversal
- **Content Hashing**: SHA-256 hashing for duplicate detection

### 🖼️ Image Validation Rules
1. **Size/Resolution**: Minimum and maximum dimension validation
2. **Format**: Only JPG, PNG, and HEIC formats allowed
3. **Duplicate Detection**: SHA-256 hash-based duplicate prevention
4. **Blur Detection**: Laplacian variance algorithm for blur detection
5. **Face Detection**: AWS Rekognition integration for face validation
6. **Single Face**: Ensures only one face per image

### 🎨 Modern UI
- **Drag & Drop**: Intuitive file upload interface
- **Progress Tracking**: Real-time upload progress with chunked uploads
- **Image Gallery**: Beautiful grid layout with filtering and pagination
- **Responsive Design**: Mobile-first responsive design
- **Error Handling**: Comprehensive error messages and user feedback

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Storage**: AWS S3
- **Image Processing**: Sharp, AWS Rekognition
- **Validation**: Zod, React Hook Form
- **Security**: Custom rate limiting, file sanitization

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS Account with S3 and Rekognition access
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd proto-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/proto_ai?schema=public"
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=proto-ai-images
   
   # Application
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   
   # Image Processing
   MAX_FILE_SIZE=10485760  # 10MB
   MIN_IMAGE_WIDTH=300
   MIN_IMAGE_HEIGHT=300
   MAX_IMAGE_WIDTH=4000
   MAX_IMAGE_HEIGHT=4000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Set up AWS S3**
   - Create an S3 bucket
   - Configure CORS policy for your domain
   - Set up IAM user with S3 and Rekognition permissions

6. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Image Upload
- `POST /api/images/upload` - Upload single image
- `POST /api/images/chunked-upload` - Chunked upload for large files
- `GET /api/images` - List images with pagination and filtering
- `DELETE /api/images?id={id}` - Delete specific image

### Request/Response Examples

**Upload Image:**
```bash
curl -X POST http://localhost:3000/api/images/upload \
  -F "file=@image.jpg"
```

**Chunked Upload:**
```bash
curl -X POST http://localhost:3000/api/images/chunked-upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "large-image.jpg",
    "mimeType": "image/jpeg",
    "totalChunks": 5,
    "chunkIndex": 0,
    "chunkData": "base64-encoded-chunk"
  }'
```

## Database Schema

### Image Model
```prisma
model Image {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  s3Key       String   @unique
  s3Url       String?
  status      ImageStatus @default(PENDING)
  hash        String?  // For duplicate detection
  blurScore   Float?   // Laplacian variance score
  faceCount   Int?     // Number of faces detected
  faceSize    Float?   // Size of largest face relative to image
  validationResults Json? // Store all validation results
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required |
| `AWS_REGION` | AWS region | us-east-1 |
| `AWS_S3_BUCKET` | S3 bucket name | Required |
| `MAX_FILE_SIZE` | Maximum file size in bytes | 10485760 (10MB) |
| `MIN_IMAGE_WIDTH` | Minimum image width | 300 |
| `MIN_IMAGE_HEIGHT` | Minimum image height | 300 |
| `MAX_IMAGE_WIDTH` | Maximum image width | 4000 |
| `MAX_IMAGE_HEIGHT` | Maximum image height | 4000 |

## Security Considerations

1. **File Upload Security**
   - MIME type validation
   - File size limits
   - Filename sanitization
   - Content-based validation

2. **API Security**
   - Rate limiting per IP
   - Input validation with Zod
   - Secure error handling

3. **Data Protection**
   - SHA-256 content hashing
   - Secure S3 key generation
   - Metadata sanitization

## Performance Optimizations

1. **Chunked Uploads**: Large files are uploaded in 1MB chunks
2. **Database Indexing**: Optimized queries with proper indexes
3. **Image Processing**: Efficient Sharp-based processing
4. **Caching**: S3 signed URLs with appropriate expiration
5. **Lazy Loading**: Gallery images loaded on demand

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Logging

- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Upload progress and timing
- **Security Events**: Rate limiting and validation failures
- **Database Queries**: Prisma query logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.