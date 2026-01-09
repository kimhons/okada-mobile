# ESLint Configuration

This project uses ESLint to enforce code quality and catch common React pitfalls, particularly around React keys.

## Key Rules

### React Key Rules

The following rules are configured to prevent duplicate key issues:

1. **`react/jsx-key`** (error): Ensures all elements in arrays have keys
   - `checkFragmentShorthand: true` - Checks `<>` fragments
   - `checkKeyMustBeforeSpread: true` - Keys must come before spread props
   - `warnOnDuplicates: true` - Warns when duplicate keys are detected

2. **`react/no-array-index-key`** (warn): Warns against using array indexes as keys
   - Using array indexes can cause issues when items are reordered, added, or removed
   - Always prefer stable, unique identifiers (like database IDs)

### Example: Bad vs Good Keys

❌ **Bad** - Using array index as key:
```tsx
items.map((item, index) => (
  <div key={index}>{item.name}</div>
))
```

✅ **Good** - Using unique ID as key:
```tsx
items.map((item) => (
  <div key={item.id}>{item.name}</div>
))
```

❌ **Bad** - Composite key with index:
```tsx
items.map((item, index) => (
  <div key={`item-${item.id}-${index}`}>{item.name}</div>
))
```

✅ **Good** - Just the unique ID:
```tsx
items.map((item) => (
  <div key={item.id}>{item.name}</div>
))
```

## Running ESLint

### Check for issues:
```bash
pnpm lint
```

### Auto-fix issues:
```bash
pnpm lint:fix
```

### Lint specific files:
```bash
pnpm lint client/src/pages/MyComponent.tsx
```

## Common Warnings

### `react/no-array-index-key`
**Problem**: Using array index as a key can cause rendering bugs.

**Solution**: Use a stable, unique identifier from your data:
- Database IDs (`item.id`)
- UUIDs (`item.uuid`)
- Unique slugs (`item.slug`)

If your data truly has no unique identifier, consider:
1. Adding one to your data model
2. Using a library like `uuid` to generate stable IDs
3. Only as a last resort, using index (and accepting the limitations)

### `@typescript-eslint/no-unused-vars`
**Problem**: Variable declared but never used.

**Solution**: 
- Remove the unused variable
- If it's intentionally unused (like in destructuring), prefix with underscore: `_unusedVar`

### `@typescript-eslint/no-explicit-any`
**Problem**: Using `any` type defeats TypeScript's type safety.

**Solution**:
- Use proper types or interfaces
- Use `unknown` if the type is truly unknown
- Use generics for flexible but type-safe code

## Configuration Files

- `eslint.config.js` - Main ESLint configuration (flat config format)
- `.eslintignore` - Files/folders to ignore (if needed)

## Plugins Used

- `eslint-plugin-react` - React-specific linting rules
- `eslint-plugin-react-hooks` - Enforces Rules of Hooks
- `@typescript-eslint/eslint-plugin` - TypeScript-specific rules
- `@typescript-eslint/parser` - Parses TypeScript code

## Integration with CI/CD

Consider adding ESLint to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Lint code
  run: pnpm lint
```

This ensures all code meets quality standards before merging.

## Disabling Rules

If you need to disable a rule for a specific line or file:

```tsx
// Disable for one line
// eslint-disable-next-line react/no-array-index-key
<div key={index}>...</div>

// Disable for entire file (use sparingly!)
/* eslint-disable react/no-array-index-key */
```

**Note**: Only disable rules when absolutely necessary and document why.

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [eslint-plugin-react Rules](https://github.com/jsx-eslint/eslint-plugin-react#list-of-supported-rules)
- [React Keys Documentation](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
