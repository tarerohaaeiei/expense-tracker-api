const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.getExpenses = async (req, res) => {
  const { startDate, endDate, category } = req.query;
  const query = { user: req.userId };

  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (category) {
    query.category = category;
  }

  try {
    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.addExpense = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, amount, date, category, notes } = req.body;
  try {
    const expense = new Expense({
      title,
      amount,
      date,
      category,
      notes,
      user: req.userId,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.updateExpense = async (req, res) => {
  const { title, amount, date, category, notes } = req.body;
  const expenseId = req.params.id;


  try {

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });

    if (title) expense.title = title;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;
    if (category) expense.category = category;
    if (notes) expense.notes = notes;

    await expense.save();
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.id;

  try {

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });

    res.status(200).json({ msg: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.getExpenseReport = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const userId = new ObjectId(req.userId);

    const report = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: start, $lte: end } 
        }
      },
      {
        $group: {
          _id: '$category', 
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 } 
        }
      },
      {
        $group: {
          _id: null, 
          categories: { $push: { category: '$_id', totalAmount: '$totalAmount', totalCount: '$totalCount' } }, 
          overallTotal: { $sum: '$totalAmount' },
          overallCount: { $sum: '$totalCount' }
        }
      }
    ]);

    if (!report || report.length === 0) {
      return res.status(200).json({
        categories: [],
        overallTotal: 0,
        overallCount: 0
      });
    }

  
    res.status(200).json({
      categories: report[0].categories,
      overallTotal: report[0].overallTotal,
      overallCount: report[0].overallCount
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};