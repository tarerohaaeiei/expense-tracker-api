const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseReport } = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const { check } = require('express-validator');

// Validation rules
const expenseValidation = [
    check('title', 'Title is required').not().isEmpty(),
    check('amount', 'Amount must be a valid number').isFloat({ gt: 0 }),
    check('date', 'Date must be a valid date').optional().isISO8601(),
    check('category', 'Category is required').not().isEmpty(),
];
const reportValidation = [
    check('startDate', 'Start date is required').not().isEmpty().isISO8601(),
    check('endDate', 'End date is required').not().isEmpty().isISO8601(),
];

//Router
router.get('/', auth, getExpenses);
router.post('/', auth, expenseValidation, addExpense);
router.patch('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

router.get('/reports', auth, reportValidation, getExpenseReport);

module.exports = router;
