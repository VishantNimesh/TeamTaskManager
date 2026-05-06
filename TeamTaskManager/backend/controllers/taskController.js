const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private (admin only)
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    // If assignedTo is provided, verify user is a project member
    if (assignedTo) {
      const project = req.project;
      const isMember = project.members.some(
        (m) => m.user.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a project member.',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project: req.params.projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task.',
    });
  }
};

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (project member)
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks.',
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (admin: all fields, member: status only for own tasks)
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Check project membership and role
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project.',
      });
    }

    // Members can only update status of tasks assigned to them
    if (member.role === 'member') {
      const isAssigned =
        task.assignedTo &&
        task.assignedTo.toString() === req.user._id.toString();

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update tasks assigned to them.',
        });
      }

      // Only allow status update
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status.',
        });
      }
    } else {
      // Admin can update everything
      const { title, description, status, priority, assignedTo, dueDate } =
        req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task.',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Check project admin
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can delete tasks.',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task.',
    });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
