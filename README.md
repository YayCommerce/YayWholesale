# Yay Wholesale B2B for WooCommerce

WooCommerce wholesale plugin for serving wholesale & B2B customers.

## Getting Started

```bash
# Install PHP dependencies
composer install

# Install JS dependencies
pnpm install
```

## Development

```bash
# Build assets (watch mode)
pnpm dev

# Build assets (production)
pnpm build
```

## Testing

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
pnpm test:e2e:install

# Start test environment (single site)
pnpm env:start:single

# Run all e2e tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Stop test environment
pnpm env:stop:single
```

## Release

```bash
# Build & package both Pro and Lite
pnpm release

# Pro only
pnpm release:pro

# Lite only
pnpm release:lite
```

## Internationalization

```bash
pnpm makepot
```
