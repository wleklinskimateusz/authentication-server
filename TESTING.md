# Testing Guide

This document explains the testing strategy for the authentication system, focusing on proper separation of concerns between different layers.

## Test Structure

### 🏗️ Domain Layer Tests (`src/domain/user.test.ts`)
**Focus**: Business logic and domain rules
- User entity creation and validation
- Password hashing and verification
- DTO transformations
- Domain-specific business rules

### 📋 Service Layer Tests (`src/application/user.service.test.ts`)
**Focus**: Business logic, orchestration, and error handling
- User registration and login workflows
- Repository interactions
- Error handling and custom exceptions
- Password validation logic
- Business rule enforcement

### 🎮 Controller Layer Tests (`src/interfaces/user.controller.test.ts`)
**Focus**: HTTP concerns, request/response handling
- Request body validation and parsing
- HTTP status code responses
- Error response formatting
- Content-Type headers
- Input sanitization

## Running Tests

### All Tests
```bash
bun test
```

### Specific Layer Tests
```bash
# Service layer tests (business logic)
bun run test:service

# Controller layer tests (HTTP handling)
bun run test:controller

# Domain layer tests (entity logic)
bun run test:domain
```

### Test Runner
```bash
bun run test:all
```

## Test Philosophy

### Service Tests (Main Business Logic)
The service layer tests focus on:
- ✅ **Business Logic**: Registration, login, password validation
- ✅ **Error Handling**: Custom exceptions and error propagation
- ✅ **Repository Integration**: Mock repository interactions
- ✅ **Data Transformation**: Converting between domain objects and DTOs
- ✅ **Security**: Password hashing and validation
- ✅ **Edge Cases**: Duplicate users, invalid credentials, etc.

### Controller Tests (HTTP Layer)
The controller tests focus on:
- ✅ **Request Validation**: JSON parsing, schema validation
- ✅ **HTTP Responses**: Status codes, headers, response format
- ✅ **Error Handling**: Converting domain errors to HTTP responses
- ✅ **Input Sanitization**: Handling malformed requests
- ✅ **Content-Type**: Proper response headers
- ❌ **NOT Business Logic**: This is tested in service layer

## Mock Strategy

### Service Tests
- **Mock Repository**: In-memory implementation for testing
- **Real Domain Logic**: Use actual UserAuth entities
- **Real Password Hashing**: Test actual bcrypt functionality

### Controller Tests
- **Mock Service**: Simple mock functions
- **Real HTTP Objects**: Use actual Request/Response objects
- **Real Validation**: Test actual Zod schema validation

## Test Coverage Areas

### Service Layer Coverage
- [x] User registration with password hashing
- [x] User login with password verification
- [x] Duplicate user detection
- [x] Invalid credentials handling
- [x] Repository error propagation
- [x] Password validation with special characters
- [x] Case-sensitive username matching
- [x] Unique ID generation
- [x] Email format generation

### Controller Layer Coverage
- [x] Valid JSON request parsing
- [x] Invalid JSON error handling
- [x] Missing required fields validation
- [x] Wrong field types validation
- [x] HTTP status code responses
- [x] Error response formatting
- [x] Content-Type header setting
- [x] Empty request body handling
- [x] Malformed JSON handling

## Best Practices

### ✅ Do's
- Test business logic in service layer
- Test HTTP concerns in controller layer
- Use real domain objects in service tests
- Mock external dependencies
- Test error scenarios
- Validate input/output formats

### ❌ Don'ts
- Don't test business logic in controller tests
- Don't test HTTP concerns in service tests
- Don't use complex mocks for simple scenarios
- Don't skip error case testing
- Don't test implementation details

## Example Test Scenarios

### Service Test Example
```typescript
it("should successfully register a new user", async () => {
  const username = "testuser";
  const password = "password123";

  await userService.register(username, password);

  const createdUser = await mockRepository.findByUsername(username);
  expect(createdUser).not.toBeNull();
  expect(createdUser?.username).toBe(username);
  
  // Verify password was hashed
  const isValidPassword = await createdUser!.validatePassword(password);
  expect(isValidPassword).toBe(true);
});
```

### Controller Test Example
```typescript
it("should return 400 for invalid request body", async () => {
  const request = new Request("http://localhost/login", {
    method: "POST",
    body: JSON.stringify({ username: "testuser" }), // missing password
    headers: { "Content-Type": "application/json" },
  });

  const response = await userController.login(request);
  const body = await response.json() as { error: string };

  expect(response.status).toBe(400);
  expect(body.error).toContain("Invalid request body");
});
```

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:
- Fast execution with Bun
- Clear separation of concerns
- Comprehensive coverage
- Reliable mocking strategy
- No external dependencies

## Debugging Tests

### Service Tests
```bash
# Run with verbose output
bun test src/application/user.service.test.ts --verbose

# Run specific test
bun test src/application/user.service.test.ts --grep "should successfully register"
```

### Controller Tests
```bash
# Run with verbose output
bun test src/interfaces/user.controller.test.ts --verbose

# Run specific test
bun test src/interfaces/user.controller.test.ts --grep "should return 400"
```

This testing strategy ensures that each layer is properly tested for its specific responsibilities while maintaining clear boundaries between concerns. 