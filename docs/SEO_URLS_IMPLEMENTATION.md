# SEO-Friendly URLs Implementation Guide

This document outlines the implementation of SEO-friendly URLs with slug-based routing for the Tuskers Blog Backend.

## Overview

The implementation adds slug-based URLs to both Articles and Tuskers while maintaining backward compatibility with existing ID-based endpoints.

### New Endpoints

#### Articles
- **GET** `/articles/slug/:slug` - Fetch article by slug
- **GET** `/articles/:id` - Fetch article by ID (existing, backward compatible)

#### Tuskers
- **GET** `/tuskers/slug/:slug` - Fetch tusker by slug  
- **GET** `/tuskers/:id` - Fetch tusker by ID (existing, backward compatible)

## Implementation Details

### 1. Schema Changes

Both `Article` and `Tusker` schemas now include a required, unique `slug` field:

```typescript
@Prop({ required: true, unique: true })
slug: string;
```

### 2. Slug Generation

The `SlugUtil` class provides utilities for:
- Converting text to URL-friendly slugs
- Ensuring slug uniqueness
- Validating slug format

**Features:**
- Converts to lowercase
- Replaces spaces and special characters with hyphens
- Removes leading/trailing hyphens
- Limits length to 100 characters
- Handles duplicate slugs with numbering (e.g., "title-1", "title-2")

### 3. Auto-Generation

Slugs are automatically generated when:
- Creating new articles/tuskers without a provided slug
- Updating articles/tuskers with a new title/name

### 4. Service Methods

New service methods added:
- `ArticleService.findBySlug(slug: string)`
- `TuskerService.getTuskerBySlug(slug: string)`

### 5. Migration Script

A safe migration script (`scripts/migrate-slugs.ts`) that:
- Generates slugs for existing records
- Handles duplicate slugs automatically
- Includes comprehensive error handling and logging
- Safe to run multiple times

## Usage

### Running the Migration

```bash
# Install dependencies if not already done
npm install

# Run the migration script
npm run migrate:slugs
```

### Creating Content with Custom Slugs

#### Articles
```typescript
// Auto-generated slug from title
const article = {
  title: "Understanding React Hooks",
  content: "...",
  // slug will be auto-generated as "understanding-react-hooks"
};

// Custom slug
const articleWithCustomSlug = {
  title: "Understanding React Hooks",
  slug: "react-hooks-guide",
  content: "...",
};
```

#### Tuskers
```typescript
// Auto-generated slug from name
const tusker = {
  name: "John Doe",
  // slug will be auto-generated as "john-doe"
};

// Custom slug
const tuskerWithCustomSlug = {
  name: "John Doe", 
  slug: "john-doe-developer",
};
```

### Frontend Integration

#### Using New Slug Endpoints
```javascript
// Fetch article by slug
const response = await fetch('http://localhost:3000/articles/slug/understanding-react-hooks');

// Fetch tusker by slug  
const response = await fetch('http://localhost:3000/tuskers/slug/john-doe');
```

#### Implementing 301 Redirects (Frontend)
```javascript
// Example React Router setup for SEO-friendly redirects
import { Navigate } from 'react-router-dom';

// Old ID-based route redirects to new slug-based route
<Route 
  path="/articles/:id" 
  element={<RedirectToSlug type="article" />} 
/>

function RedirectToSlug({ type }) {
  const { id } = useParams();
  const [slug, setSlug] = useState(null);
  
  useEffect(() => {
    // Fetch the item by ID to get its slug
    fetch(`/api/${type}s/${id}`)
      .then(res => res.json())
      .then(data => setSlug(data.slug));
  }, [id, type]);
  
  if (slug) {
    return <Navigate to={`/${type}s/${slug}`} replace />;
  }
  
  return <div>Loading...</div>;
}
```

## Error Handling

### Validation Errors
- **400 Bad Request**: Invalid slug format
- **409 Conflict**: Slug already exists
- **404 Not Found**: Article/Tusker not found

### Slug Format Requirements
- Lowercase letters and numbers only
- Hyphens as separators
- No leading or trailing hyphens
- Maximum 100 characters
- Pattern: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`

## SEO Benefits

1. **URL Structure**: Clean, descriptive URLs improve search rankings
2. **Keyword Optimization**: Slugs can include relevant keywords
3. **User Experience**: Readable URLs are more trustworthy
4. **Social Sharing**: Better appearance when shared on social media
5. **Backward Compatibility**: Existing URLs continue to work

## Database Indexes

Consider adding database indexes for optimal performance:

```javascript
// MongoDB indexes
db.articles.createIndex({ "slug": 1 }, { unique: true });
db.tuskers.createIndex({ "slug": 1 }, { unique: true });
```

## Best Practices

1. **Slug Length**: Keep slugs concise but descriptive
2. **Keywords**: Include primary keywords in slugs
3. **Consistency**: Use consistent naming conventions
4. **Uniqueness**: Always ensure slug uniqueness
5. **Redirects**: Implement 301 redirects from old URLs
6. **Testing**: Test slug generation with various inputs
7. **Monitoring**: Monitor for duplicate slug attempts

## Testing

### Manual Testing
```bash
# Start the development server
npm run start:dev

# Test slug endpoints
curl http://localhost:3000/articles/slug/test-slug
curl http://localhost:3000/tuskers/slug/test-slug

# Test backward compatibility
curl http://localhost:3000/articles/ARTICLE_ID
curl http://localhost:3000/tuskers/TUSKER_ID
```

### Unit Tests
Add tests for:
- Slug generation utility functions
- Service methods for slug-based retrieval
- Controller endpoints
- Migration script functions

## Troubleshooting

### Common Issues

1. **Duplicate Slug Error**
   - Check for existing slugs in database
   - Ensure unique slug generation is working

2. **Migration Fails**
   - Verify database connection
   - Check for records with empty titles/names
   - Review migration logs for specific errors

3. **Routing Conflicts**
   - Ensure slug routes are defined before generic :id routes
   - Check for conflicting route patterns

### Debug Commands
```bash
# Check for articles without slugs
db.articles.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] });

# Check for duplicate slugs
db.articles.aggregate([
  { $group: { _id: "$slug", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
```

## Future Enhancements

1. **Slug History**: Track slug changes for better SEO
2. **Bulk Operations**: Bulk slug updates via admin interface
3. **Analytics**: Track which URLs are being used
4. **A/B Testing**: Test different slug formats
5. **Localization**: Multi-language slug support
