import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Board, Column, Card } from './models/index.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskboard.com',
      password: 'admin123',
      role: 'admin',
    });

    const dev1 = await User.create({
      name: 'John Developer',
      email: 'john@taskboard.com',
      password: 'john123',
      role: 'user',
    });

    const dev2 = await User.create({
      name: 'Sarah Engineer',
      email: 'sarah@taskboard.com',
      password: 'sarah123',
      role: 'user',
    });

    const dev3 = await User.create({
      name: 'Mike Designer',
      email: 'mike@taskboard.com',
      password: 'mike123',
      role: 'user',
    });

    console.log('Created users');

    // Create boards
    const board1 = await Board.create({
      title: 'Sprint Board - Q3',
      owner: admin._id,
      members: [dev1._id, dev2._id, dev3._id],
    });

    const board2 = await Board.create({
      title: 'Backend Refactor',
      owner: admin._id,
      members: [dev1._id, dev2._id],
    });

    console.log('Created boards');

    // Create columns for Board 1
    const col1 = await Column.create({ title: 'To Do', board: board1._id, position: 0 });
    const col2 = await Column.create({ title: 'In Progress', board: board1._id, position: 1 });
    const col3 = await Column.create({ title: 'Done', board: board1._id, position: 2 });

    // Create columns for Board 2
    const col6 = await Column.create({ title: 'To Do', board: board2._id, position: 0 });
    const col7 = await Column.create({ title: 'In Progress', board: board2._id, position: 1 });
    const col8 = await Column.create({ title: 'Done', board: board2._id, position: 2 });

    console.log('Created columns');

    // Create cards for Board 1
    const cards = [
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated builds and deployments', priority: 'high', column: col1._id, board: board1._id, assignee: dev1._id, position: 0 },
      { title: 'Design system audit', description: 'Review and document current component library', priority: 'medium', column: col1._id, board: board1._id, assignee: dev3._id, position: 1 },
      { title: 'Database migration script', description: 'Write migration for new user preferences table', priority: 'urgent', column: col1._id, board: board1._id, assignee: dev2._id, position: 2 },
      { title: 'Fix login page validation', description: 'Email field allows invalid format on mobile', priority: 'low', column: col1._id, board: board1._id, assignee: dev3._id, position: 3 },
      { title: 'Implement user authentication', description: 'JWT-based login and registration flow', priority: 'high', column: col2._id, board: board1._id, assignee: dev1._id, position: 0, dueDate: new Date('2026-08-20') },
      { title: 'Create dashboard layout', description: 'Responsive grid layout for the main dashboard', priority: 'medium', column: col2._id, board: board1._id, assignee: dev3._id, position: 1, dueDate: new Date('2026-08-22') },
      { title: 'API rate limiting', description: 'Implement express-rate-limit on sensitive endpoints', priority: 'high', column: col2._id, board: board1._id, assignee: dev2._id, position: 2 },
      { title: 'WebSocket integration', description: 'Set up Socket.io for real-time board updates', priority: 'medium', column: col2._id, board: board1._id, assignee: dev1._id, position: 3 },
      { title: 'Write unit tests for auth', description: 'Cover registration, login, and token refresh', priority: 'medium', column: col3._id, board: board1._id, assignee: dev1._id, position: 0 },
      { title: 'Set up project structure', description: 'Initialize monorepo with proper folder layout', priority: 'low', column: col3._id, board: board1._id, assignee: dev2._id, position: 1 },
    ];

    // Cards for Board 2
    const cards2 = [
      { title: 'Refactor user service', description: 'Split monolithic user service into smaller modules', priority: 'high', column: col6._id, board: board2._id, assignee: dev1._id, position: 0 },
      { title: 'Add error boundary', description: 'Implement React error boundaries for graceful failures', priority: 'medium', column: col6._id, board: board2._id, assignee: dev2._id, position: 1 },
      { title: 'Optimize database queries', description: 'Add proper indexes and review N+1 queries', priority: 'urgent', column: col7._id, board: board2._id, assignee: dev1._id, position: 0 },
    ];

    await Card.insertMany([...cards, ...cards2]);
    console.log('Created cards');

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@taskboard.com / admin123');
    console.log('Dev 1: john@taskboard.com / john123');
    console.log('Dev 2: sarah@taskboard.com / sarah123');
    console.log('Dev 3: mike@taskboard.com / mike123');
    console.log('---');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
