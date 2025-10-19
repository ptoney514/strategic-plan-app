# Component Tests

This directory contains unit tests for React components using Vitest and React Testing Library.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- **LikertScaleChart.test.tsx**: Tests for the Likert scale visualization component
  - Rendering with valid data
  - Empty state handling
  - Average calculation accuracy
  - Title and description display
  - Target value rendering
  - Custom scale ranges
  - Edge cases (single data point, etc.)

## Writing New Tests

1. Create a new file with `.test.tsx` extension
2. Import necessary testing utilities from `@testing-library/react`
3. Use `describe` blocks to group related tests
4. Use `it` or `test` for individual test cases
5. Follow the Arrange-Act-Assert pattern

### Example:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- Aim for >80% code coverage on business logic components
- Focus on testing behavior, not implementation details
- Test edge cases and error states
