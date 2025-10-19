# Service Tests

This directory contains unit tests for service layer modules using Vitest.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- **metrics.service.test.ts**: Tests for the MetricsService
  - `getByDistrict()`: District-level metric queries with JOIN
  - Proper data filtering and transformation
  - Error handling
  - Edge cases (empty results, null data, etc.)

## Mocking Strategy

Services that interact with Supabase use mocked imports:

```typescript
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));
```

This allows us to test service logic without making actual database calls.

## Writing Service Tests

1. Create a new file with `.test.ts` extension
2. Mock external dependencies (Supabase, external APIs, etc.)
3. Test both success and failure paths
4. Verify correct parameters are passed to external services
5. Test data transformation logic

### Example:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyService } from '../my.service';

vi.mock('../../supabase', () => ({
  supabase: { /* mock implementation */ }
}));

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data correctly', async () => {
    // Arrange: Set up mocks
    // Act: Call service method
    // Assert: Verify results
  });
});
```

## Testing Database Queries

When testing methods that query the database:

1. Mock the Supabase query chain (`from().select().eq().order()`)
2. Verify each method is called with correct parameters
3. Test data transformation (e.g., removing joined data)
4. Test error scenarios
