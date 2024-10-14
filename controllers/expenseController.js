const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addExpense = async (req, res) => {
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
