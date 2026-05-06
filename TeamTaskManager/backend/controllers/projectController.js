const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
    });

    // Populate members for response
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project.',
    });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach task stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]);

        const stats = {
          total: 0,
          todo: 0,
          'in-progress': 0,
          review: 0,
          done: 0,
        };
        taskStats.forEach((s) => {
          stats[s._id] = s.count;
          stats.total += s.count;
        });

        return {
          ...project.toObject(),
          taskStats: stats,
        };
      })
    );

    res.json({
      success: true,
      data: { projects: projectsWithStats },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects.',
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (project member)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Get tasks
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    // Task stats
    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };

    res.json({
      success: true,
      data: {
        project,
        tasks,
        taskStats: stats,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project.',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (admin only)
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project.',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (admin only)
const deleteProject = async (req, res) => {
  try {
    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project.',
    });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (admin only)
const addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, role = 'member' } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email.',
      });
    }

    const project = req.project;

    // Check if user is already a member
    const existingMember = project.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project.',
      });
    }

    // Add member
    project.members.push({ user: user._id, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: `${user.name} added as ${role}`,
      data: { project },
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding member.',
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (admin only)
const removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    // Cannot remove the project creator
    if (project.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project creator.',
      });
    }

    // Find and remove member
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === userId
    );
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project.',
      });
    }

    project.members.splice(memberIndex, 1);

    // Unassign tasks that were assigned to the removed member
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: null }
    );

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing member.',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
