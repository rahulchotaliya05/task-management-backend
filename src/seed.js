import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Board, Column, Card, RefreshToken } from './models/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});
    await RefreshToken.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskboard.com',
      password: 'admin123',
      role: 'admin',
    });

    const users = [];
    const userList = [
      { name: 'John Developer', email: 'john@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Sarah Engineer', email: 'sarah@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Mike Designer', email: 'mike@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Alice Frontend', email: 'alice@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Bob Backend', email: 'bob@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Charlie DevOps', email: 'charlie@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Diana QA', email: 'diana@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Evan Architect', email: 'evan@taskboard.com', password: 'user123', role: 'user' },
      { name: 'Fiona PM', email: 'fiona@taskboard.com', password: 'user123', role: 'user' },
    ];

    for (const u of userList) {
      const created = await User.create(u);
      users.push(created);
    }

    console.log('Created 10 users (1 admin + 9 developers)');

    const board1 = await Board.create({
      title: 'E-Commerce Platform',
      owner: admin._id,
      members: [users[0]._id, users[1]._id, users[2]._id, users[3]._id],
    });

    const board2 = await Board.create({
      title: 'Mobile App Redesign',
      owner: admin._id,
      members: [users[1]._id, users[2]._id, users[4]._id, users[5]._id],
    });

    const board3 = await Board.create({
      title: 'Backend Microservices',
      owner: admin._id,
      members: [users[0]._id, users[4]._id, users[5]._id, users[7]._id],
    });

    const board4 = await Board.create({
      title: 'DevOps Pipeline',
      owner: admin._id,
      members: [users[5]._id, users[6]._id, users[7]._id, users[8]._id],
    });

    console.log('Created 4 boards');

    const b1c1 = await Column.create({ title: 'To Do', board: board1._id, position: 0 });
    const b1c2 = await Column.create({ title: 'In Progress', board: board1._id, position: 1 });
    const b1c3 = await Column.create({ title: 'Done', board: board1._id, position: 2 });

    const b2c1 = await Column.create({ title: 'To Do', board: board2._id, position: 0 });
    const b2c2 = await Column.create({ title: 'In Progress', board: board2._id, position: 1 });
    const b2c3 = await Column.create({ title: 'Done', board: board2._id, position: 2 });

    const b3c1 = await Column.create({ title: 'To Do', board: board3._id, position: 0 });
    const b3c2 = await Column.create({ title: 'In Progress', board: board3._id, position: 1 });
    const b3c3 = await Column.create({ title: 'Done', board: board3._id, position: 2 });

    const b4c1 = await Column.create({ title: 'To Do', board: board4._id, position: 0 });
    const b4c2 = await Column.create({ title: 'In Progress', board: board4._id, position: 1 });
    const b4c3 = await Column.create({ title: 'Done', board: board4._id, position: 2 });

    console.log('Created columns for all boards');

    const board1Cards = [
      { title: 'Design product listing page', description: 'Create responsive grid layout for products with filters and sorting', priority: 'high', column: b1c1._id, board: board1._id, assignee: users[2]._id, position: 0 },
      { title: 'Implement shopping cart', description: 'Add to cart, remove from cart, update quantity functionality', priority: 'urgent', column: b1c1._id, board: board1._id, assignee: users[0]._id, position: 1 },
      { title: 'Payment gateway integration', description: 'Integrate Stripe for credit card and UPI payments', priority: 'high', column: b1c1._id, board: board1._id, assignee: users[1]._id, position: 2 },
      { title: 'User reviews and ratings', description: 'Allow users to leave star ratings and text reviews on products', priority: 'medium', column: b1c1._id, board: board1._id, assignee: users[3]._id, position: 3 },
      { title: 'Product search with autocomplete', description: 'Elasticsearch-powered search with suggestions', priority: 'medium', column: b1c2._id, board: board1._id, assignee: users[0]._id, position: 0, dueDate: new Date('2026-08-25') },
      { title: 'Order tracking system', description: 'Real-time order status updates with timeline view', priority: 'high', column: b1c2._id, board: board1._id, assignee: users[1]._id, position: 1, dueDate: new Date('2026-08-28') },
      { title: 'Email notification service', description: 'Send order confirmations and shipping updates', priority: 'medium', column: b1c2._id, board: board1._id, assignee: users[3]._id, position: 2 },
      { title: 'Wishlist feature', description: 'Save products to wishlist for later purchase', priority: 'low', column: b1c2._id, board: board1._id, assignee: users[2]._id, position: 3, dueDate: new Date('2026-09-01') },
      { title: 'Setup project boilerplate', description: 'Initialize Next.js app with TypeScript and Tailwind', priority: 'low', column: b1c3._id, board: board1._id, assignee: users[0]._id, position: 0 },
      { title: 'Database schema design', description: 'Design MongoDB schemas for products, orders, and users', priority: 'medium', column: b1c3._id, board: board1._id, assignee: users[1]._id, position: 1 },
    ];

    const board2Cards = [
      { title: 'Redesign onboarding flow', description: 'New 3-step onboarding with animations and skip option', priority: 'high', column: b2c1._id, board: board2._id, assignee: users[2]._id, position: 0 },
      { title: 'Dark mode implementation', description: 'Add system-aware and manual dark mode toggle', priority: 'medium', column: b2c1._id, board: board2._id, assignee: users[1]._id, position: 1 },
      { title: 'Push notification system', description: 'Firebase Cloud Messaging for Android and iOS', priority: 'high', column: b2c1._id, board: board2._id, assignee: users[4]._id, position: 2 },
      { title: 'Biometric authentication', description: 'Face ID and fingerprint login support', priority: 'urgent', column: b2c1._id, board: board2._id, assignee: users[5]._id, position: 3 },
      { title: 'Offline data sync', description: 'Cache critical data locally and sync when online', priority: 'high', column: b2c2._id, board: board2._id, assignee: users[4]._id, position: 0, dueDate: new Date('2026-08-22') },
      { title: 'App performance audit', description: 'Profile and fix jank, reduce bundle size', priority: 'medium', column: b2c2._id, board: board2._id, assignee: users[1]._id, position: 1 },
      { title: 'Accessibility improvements', description: 'Screen reader support and contrast fixes', priority: 'medium', column: b2c2._id, board: board2._id, assignee: users[2]._id, position: 2, dueDate: new Date('2026-09-05') },
      { title: 'Design system components', description: 'Build reusable UI kit with Storybook docs', priority: 'low', column: b2c3._id, board: board2._id, assignee: users[2]._id, position: 0 },
      { title: 'Setup React Native project', description: 'Initialize project with navigation and state management', priority: 'low', column: b2c3._id, board: board2._id, assignee: users[1]._id, position: 1 },
      { title: 'CI/CD for mobile builds', description: 'Fastlane + GitHub Actions for automated builds', priority: 'medium', column: b2c3._id, board: board2._id, assignee: users[5]._id, position: 2 },
    ];

    const board3Cards = [
      { title: 'User service extraction', description: 'Extract user management into standalone microservice', priority: 'high', column: b3c1._id, board: board3._id, assignee: users[0]._id, position: 0 },
      { title: 'API Gateway setup', description: 'Kong or Express gateway for routing and rate limiting', priority: 'urgent', column: b3c1._id, board: board3._id, assignee: users[7]._id, position: 1 },
      { title: 'Event-driven messaging', description: 'RabbitMQ for async communication between services', priority: 'high', column: b3c1._id, board: board3._id, assignee: users[4]._id, position: 2 },
      { title: 'Database per service', description: 'Migrate from shared DB to isolated databases', priority: 'medium', column: b3c1._id, board: board3._id, assignee: users[5]._id, position: 3 },
      { title: 'Service discovery', description: 'Implement Consul for service registration', priority: 'medium', column: b3c2._id, board: board3._id, assignee: users[7]._id, position: 0, dueDate: new Date('2026-08-30') },
      { title: 'Distributed tracing', description: 'Jaeger integration for request tracking across services', priority: 'medium', column: b3c2._id, board: board3._id, assignee: users[0]._id, position: 1 },
      { title: 'Health check endpoints', description: 'Standard /health and /ready for each service', priority: 'low', column: b3c2._id, board: board3._id, assignee: users[4]._id, position: 2, dueDate: new Date('2026-09-03') },
      { title: 'Circuit breaker pattern', description: 'Implement resilience4j for fault tolerance', priority: 'high', column: b3c2._id, board: board3._id, assignee: users[5]._id, position: 3 },
      { title: 'Auth service completed', description: 'JWT-based auth service with Redis session store', priority: 'high', column: b3c3._id, board: board3._id, assignee: users[0]._id, position: 0 },
      { title: 'Docker containerization', description: 'Dockerfiles for all services with compose setup', priority: 'medium', column: b3c3._id, board: board3._id, assignee: users[7]._id, position: 1 },
    ];

    const board4Cards = [
      { title: 'Terraform infrastructure', description: 'IaC for AWS resources - VPC, ECS, RDS, S3', priority: 'high', column: b4c1._id, board: board4._id, assignee: users[5]._id, position: 0 },
      { title: 'Kubernetes cluster setup', description: 'EKS cluster with node groups and autoscaling', priority: 'urgent', column: b4c1._id, board: board4._id, assignee: users[7]._id, position: 1 },
      { title: 'Monitoring stack', description: 'Prometheus + Grafana dashboards for all services', priority: 'high', column: b4c1._id, board: board4._id, assignee: users[6]._id, position: 2 },
      { title: 'Log aggregation', description: 'ELK stack for centralized logging', priority: 'medium', column: b4c1._id, board: board4._id, assignee: users[8]._id, position: 3 },
      { title: 'GitOps workflow', description: 'ArgoCD for declarative deployments from Git', priority: 'high', column: b4c2._id, board: board4._id, assignee: users[5]._id, position: 0, dueDate: new Date('2026-08-27') },
      { title: 'Secret management', description: 'HashiCorp Vault for storing credentials and certs', priority: 'urgent', column: b4c2._id, board: board4._id, assignee: users[7]._id, position: 1 },
      { title: 'Backup and disaster recovery', description: 'Automated DB backups with cross-region replication', priority: 'medium', column: b4c2._id, board: board4._id, assignee: users[6]._id, position: 2, dueDate: new Date('2026-09-10') },
      { title: 'Cost optimization audit', description: 'Review and optimize AWS spend, remove unused resources', priority: 'low', column: b4c2._id, board: board4._id, assignee: users[8]._id, position: 3 },
      { title: 'CI pipeline for backend', description: 'GitHub Actions with lint, test, build stages', priority: 'medium', column: b4c3._id, board: board4._id, assignee: users[5]._id, position: 0 },
      { title: 'SSL certificate automation', description: 'Let\'s Encrypt with auto-renewal via cert-manager', priority: 'low', column: b4c3._id, board: board4._id, assignee: users[6]._id, position: 1 },
    ];

    await Card.insertMany([...board1Cards, ...board2Cards, ...board3Cards, ...board4Cards]);
    console.log('Created 40 cards (10 per board)');

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@taskboard.com / admin123');
    console.log('Users (password for all: user123):');
    console.log('  john@taskboard.com');
    console.log('  sarah@taskboard.com');
    console.log('  mike@taskboard.com');
    console.log('  alice@taskboard.com');
    console.log('  bob@taskboard.com');
    console.log('  charlie@taskboard.com');
    console.log('  diana@taskboard.com');
    console.log('  evan@taskboard.com');
    console.log('  fiona@taskboard.com');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
