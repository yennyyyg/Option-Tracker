const express = require('express');
const AssignmentService = require('../services/assignmentService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// POST /api/assignments - Create a new assignment
router.post('/', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const assignmentData = req.body;

    console.log(`Creating assignment for user ${userId}`);

    const assignment = await AssignmentService.createAssignment(userId, assignmentData);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    console.error(`Error in POST /assignments: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/assignments - Get all assignments for the user
router.get('/', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      status: req.query.status,
      symbol: req.query.symbol,
      strategy: req.query.strategy,
    };

    console.log(`Fetching assignments for user ${userId}`);

    const assignments = await AssignmentService.getAssignments(userId, filters);

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error(`Error in GET /assignments: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/assignments/summary - Get assignment summary statistics
router.get('/summary', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`Fetching assignment summary for user ${userId}`);

    const summary = await AssignmentService.getAssignmentSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(`Error in GET /assignments/summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/assignments/:id - Get a specific assignment
router.get('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const assignmentId = req.params.id;

    console.log(`Fetching assignment ${assignmentId} for user ${userId}`);

    const assignment = await AssignmentService.getAssignmentById(assignmentId, userId);

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(`Error in GET /assignments/${req.params.id}: ${error.message}`);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/assignments/:id - Delete an assignment
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const assignmentId = req.params.id;

    console.log(`Deleting assignment ${assignmentId} for user ${userId}`);

    await AssignmentService.deleteAssignment(assignmentId, userId);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error(`Error in DELETE /assignments/${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;