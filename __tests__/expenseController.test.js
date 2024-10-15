const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');

describe('Expense API', () => {
    let user;
    let token;
    let expenseId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        user = new User({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'testpassword',
        });
        await user.save();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: 'testpassword',
            });
        token = response.body.token;
    });

    afterAll(async () => {
        await Expense.deleteMany({ user: user._id });
        await User.deleteMany({ _id: user._id });
        await mongoose.connection.close();
        server.close();
    });

    describe('GET /api/expenses', () => {
        it('should return expenses for the user', async () => {
            const expense = new Expense({
                title: 'Test Expense',
                amount: 100,
                date: new Date(),
                category: 'Food',
                notes: 'Test note',
                user: user._id,
            });
            await expense.save();

            const response = await request(app)
                .get('/api/expenses')
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Test Expense');
            expenseId = response.body[0].id;
        });
    });

    describe('POST /api/expenses', () => {
        it('should add an expense', async () => {
            const response = await request(app)
                .post('/api/expenses')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Test Expense',
                    amount: 150,
                    date: new Date(),
                    category: 'Transport',
                    notes: 'Test note for transport',
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.title).toBe('New Test Expense');
        }, 10000);
    });

    describe('PATCH /api/expenses/:id', () => {
        beforeEach(async () => {
            const expense = new Expense({
                title: 'Old Expense',
                amount: 200,
                date: new Date(),
                category: 'Utilities',
                notes: 'Old expense note',
                user: user._id,
            });
            const savedExpense = await expense.save();
            expenseId = savedExpense._id;
        });

        it('should update an expense', async () => {
            const response = await request(app)
                .patch(`/api/expenses/${expenseId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Expense',
                    amount: 250,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe('Updated Expense');
            expect(response.body.amount).toBe(250);
        });

        it('should return 404 for non-existing expense', async () => {
            const response = await request(app)
                .patch('/api/expenses/invalidID')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'This should not work',
                });

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('Expense not found');
        });
    });

    describe('DELETE /api/expenses/:id', () => {
        let expenseId;

        beforeEach(async () => {
            const expense = new Expense({
                title: 'Expense to be deleted',
                amount: 300,
                date: new Date(),
                category: 'Miscellaneous',
                notes: 'This expense will be deleted',
                user: user._id,
            });
            const savedExpense = await expense.save();
            expenseId = savedExpense._id;
        });

        it('should delete an expense', async () => {
            const response = await request(app)
                .delete(`/api/expenses/${expenseId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Expense deleted successfully');
        });

        it('should return 404 for non-existing expense', async () => {
            const response = await request(app)
                .delete('/api/expenses/invalidID')
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('Expense not found');
        });
    });

    describe('GET /api/expenses/reports', () => {

        it('should return a report of total expenses per category and overall total', async () => {
            const mockReport = [
                {
                    categories: [
                        { category: '1111', totalAmount: 111222.5, totalCount: 2 },
                        { category: 'Groceries', totalAmount: 1613.25, totalCount: 2 },
                    ],
                    overallTotal: 112835.75,
                    overallCount: 4, 
                }
            ];
        
            jest.spyOn(Expense, 'aggregate').mockResolvedValue(mockReport);
        
            const response = await request(app)
                .get('/api/expenses/reports')
                .query({ startDate: '2024-10-01', endDate: '2024-10-31' })
                .set('Authorization', `Bearer ${token}`);
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(response.body).toHaveProperty('overallTotal');
            expect(response.body).toHaveProperty('overallCount');
            expect(response.body.categories.length).toBe(2);
            expect(response.body.overallTotal).toBe(112835.75);
            expect(response.body.overallCount).toBe(4);
        
            Expense.aggregate.mockRestore();
        });
        
        it('should return 400 if startDate or endDate is missing', async () => {
            const response = await request(app)
                .get('/api/expenses/reports')
                .query({ startDate: '2024-10-01' })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Please provide both startDate and endDate');
        });
    });
});
