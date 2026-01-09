# Contributing to Okada Admin Dashboard

First off, thank you for considering contributing to Okada Admin Dashboard! It's people like you that make this project such a great tool for Cameroon's delivery ecosystem.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@okada-admin.com](mailto:conduct@okada-admin.com).

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 9.x or higher
- MySQL 8.x or TiDB
- Git

### Development Setup

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/okada-mobile.git
   cd okada-mobile
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kimhons/okada-mobile.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Set up database**
   ```bash
   pnpm db:push
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the expected behavior**
- **Include your environment details** (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues for newcomers
- `help wanted` - Issues that need attention
- `documentation` - Documentation improvements

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Run quality checks**
   ```bash
   pnpm lint        # Check code style
   pnpm check       # TypeScript check
   pnpm test        # Run tests
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Fill in the PR template
   - Link any related issues
   - Request review from maintainers

### PR Requirements

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description clearly explains changes

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type - use proper typing
- Use interfaces for object shapes

```typescript
// Good
interface User {
  id: number;
  name: string;
  email: string;
}

// Avoid
const user: any = { ... };
```

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing

```tsx
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### CSS/Tailwind

- Use Tailwind CSS utilities
- Follow mobile-first approach
- Use CSS variables for theming

### File Organization

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
└── contexts/       # React contexts
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(orders): add order status history tracking
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
test(riders): add unit tests for earnings calculation
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/__tests__/orders.test.ts

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Writing Tests

- Write tests for all new features
- Aim for meaningful coverage, not just high numbers
- Test edge cases and error conditions

```typescript
describe('OrderService', () => {
  it('should create a new order', async () => {
    const order = await createOrder({
      customerId: 1,
      items: [{ productId: 1, quantity: 2 }],
    });
    
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
  });

  it('should throw error for invalid customer', async () => {
    await expect(
      createOrder({ customerId: -1, items: [] })
    ).rejects.toThrow('Invalid customer');
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update API documentation for endpoint changes
- Include inline comments for complex logic

```typescript
/**
 * Calculate delivery fee based on distance and zone pricing.
 * @param distance - Distance in kilometers
 * @param zoneId - Delivery zone identifier
 * @returns Calculated fee in FCFA
 */
export function calculateDeliveryFee(distance: number, zoneId: number): number {
  // Implementation
}
```

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/kimhons/okada-mobile/discussions)
- Join our community chat
- Email us at [dev@okada-admin.com](mailto:dev@okada-admin.com)

---

Thank you for contributing! 🎉
