import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';
import { getAvatarColor, getInitials } from '../components/Navbar';
import {
  HiPlus, HiTrash, HiPencil, HiOutlineUserPlus,
  HiOutlineArrowLeft, HiOutlineCalendar,
  HiXMark, HiOutlineEllipsisVertical,
} from 'react-icons/hi2';
import './ProjectDetail.css';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--status-todo)' },
  { id: 'in-progress', label: 'In Progress', color: 'var(--status-in-progress)' },
  { id: 'review', label: 'Review', color: 'var(--status-review)' },
  { id: 'done', label: 'Done', color: 'var(--status-done)' },
];

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState('member');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditTask, setShowEditTask] = useState(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);

  // Task form
  const emptyTask = { title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '', status: 'todo' };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  // Drag state
  const [draggedTask, setDraggedTask] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await projectAPI.getOne(id);
      setProject(res.data.data.project);
      setTasks(res.data.data.tasks);
      const me = res.data.data.project.members.find(
        (m) => m.user?._id === user?._id
      );
      setMyRole(me?.role || 'member');
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const isAdmin = myRole === 'admin';

  // ============ TASK ACTIONS ============
  const handleCreateTask = async (e) => {
    e?.preventDefault();
    if (!taskForm.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...taskForm };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await taskAPI.create(id, payload);
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm(emptyTask);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally { setSaving(false); }
  };

  const handleUpdateTask = async (e) => {
    e?.preventDefault();
    if (!taskForm.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...taskForm };
      if (!payload.assignedTo) payload.assignedTo = null;
      if (!payload.dueDate) payload.dueDate = null;
      await taskAPI.update(showEditTask, payload);
      toast.success('Task updated!');
      setShowEditTask(null);
      setTaskForm(emptyTask);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot update status');
    }
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowEditTask(task._id);
    setTaskMenuOpen(null);
  };

  // ============ DRAG & DROP ============
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      handleStatusChange(draggedTask._id, columnId);
    }
    setDraggedTask(null);
  };

  // ============ MEMBER ACTIONS ============
  const handleAddMember = async (e) => {
    e?.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      await projectAPI.addMember(id, { email: memberEmail, role: memberRole });
      toast.success('Member added!');
      setMemberEmail('');
      setMemberRole('member');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectAPI.removeMember(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all tasks? This cannot be undone.')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div><p>Loading project...</p></div>;
  }

  if (!project) return null;

  return (
    <div className="project-detail">
      <div className="container">
        {/* Top Bar */}
        <div className="pd-topbar">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} id="back-btn">
            <HiOutlineArrowLeft size={18} /> Back
          </button>
          {isAdmin && (
            <div className="pd-topbar-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)} id="manage-members-btn">
                <HiOutlineUserPlus size={16} /> Members
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject} id="delete-project-btn">
                <HiTrash size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Project Header */}
        <div className="pd-header">
          <div>
            <h1 className="pd-title">{project.name}</h1>
            {project.description && <p className="pd-desc">{project.description}</p>}
          </div>
          <div className="pd-header-meta">
            <div className="pd-members-preview">
              <div className="avatar-stack">
                {project.members?.slice(0, 5).map((m, i) => (
                  <div key={i} className="avatar avatar-sm"
                    style={{ background: getAvatarColor(m.user?.name || 'U') }}
                    title={`${m.user?.name} (${m.role})`}>
                    {getInitials(m.user?.name || 'U')}
                  </div>
                ))}
              </div>
              <span className="pd-member-count">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
            </div>
            <span className={`badge badge-${myRole}`}>{myRole}</span>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="kanban-header">
          <h2>Task Board</h2>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => { setTaskForm(emptyTask); setShowTaskModal(true); }} id="add-task-btn">
              <HiPlus size={16} /> Add Task
            </button>
          )}
        </div>

        <div className="kanban-board" id="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                id={`column-${col.id}`}>
                <div className="kanban-column-header">
                  <div className="kanban-col-dot" style={{ background: col.color }}></div>
                  <span className="kanban-col-title">{col.label}</span>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>
                <div className="kanban-column-body">
                  {colTasks.map((task) => (
                    <div key={task._id} className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      id={`task-${task._id}`}>
                      <div className="task-card-top">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        <div className="task-card-menu-wrapper">
                          <button className="btn btn-ghost btn-icon btn-sm"
                            onClick={(e) => { e.stopPropagation(); setTaskMenuOpen(taskMenuOpen === task._id ? null : task._id); }}>
                            <HiOutlineEllipsisVertical size={16} />
                          </button>
                          {taskMenuOpen === task._id && (
                            <div className="task-menu">
                              {isAdmin && <button onClick={() => openEditTask(task)}><HiPencil size={14} /> Edit</button>}
                              {isAdmin && <button className="danger" onClick={() => { handleDeleteTask(task._id); setTaskMenuOpen(null); }}><HiTrash size={14} /> Delete</button>}
                              {!isAdmin && task.assignedTo?._id === user?._id && (
                                <>
                                  {COLUMNS.filter(c => c.id !== task.status).map(c => (
                                    <button key={c.id} onClick={() => { handleStatusChange(task._id, c.id); setTaskMenuOpen(null); }}>
                                      Move to {c.label}
                                    </button>
                                  ))}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="task-card-title">{task.title}</h4>
                      {task.description && <p className="task-card-desc">{task.description}</p>}
                      <div className="task-card-footer">
                        {task.assignedTo ? (
                          <div className="task-assignee">
                            <div className="avatar avatar-sm"
                              style={{ background: getAvatarColor(task.assignedTo.name) }}>
                              {getInitials(task.assignedTo.name)}
                            </div>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : <span className="task-unassigned">Unassigned</span>}
                        {task.dueDate && (
                          <span className="task-due">
                            <HiOutlineCalendar size={13} />
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="kanban-empty">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreateTask} disabled={saving || !taskForm.title.trim()} id="confirm-create-task">
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </>}>
        <TaskFormFields form={taskForm} setForm={setTaskForm} members={project.members} />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!showEditTask} onClose={() => setShowEditTask(null)} title="Edit Task"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowEditTask(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdateTask} disabled={saving || !taskForm.title.trim()} id="confirm-edit-task">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>}>
        <TaskFormFields form={taskForm} setForm={setTaskForm} members={project.members} showStatus />
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members">
        <div className="members-list">
          {project.members?.map((m) => (
            <div key={m.user?._id} className="member-row">
              <div className="member-info">
                <div className="avatar" style={{ background: getAvatarColor(m.user?.name || 'U') }}>
                  {getInitials(m.user?.name || 'U')}
                </div>
                <div>
                  <div className="member-name">{m.user?.name}</div>
                  <div className="member-email">{m.user?.email}</div>
                </div>
              </div>
              <div className="member-actions">
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isAdmin && m.user?._id !== project.createdBy?._id && (
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleRemoveMember(m.user?._id)}>
                    <HiXMark size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {isAdmin && (
          <form onSubmit={handleAddMember} className="add-member-form" id="add-member-form">
            <div className="add-member-row">
              <input className="form-input" placeholder="Email address" value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)} id="member-email-input" />
              <select className="form-select" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary btn-sm" type="submit" disabled={addingMember || !memberEmail.trim()} id="add-member-btn">
                {addingMember ? '...' : 'Add'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ============ TASK FORM FIELDS ============
const TaskFormFields = ({ form, setForm, members, showStatus }) => (
  <div className="task-form-fields">
    <div className="form-group">
      <label className="form-label">Title *</label>
      <input className="form-input" placeholder="Task title" value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })} id="task-title-input" autoFocus />
    </div>
    <div className="form-group">
      <label className="form-label">Description</label>
      <textarea className="form-textarea" placeholder="Task description..." value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} id="task-desc-input" />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select className="form-select" value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })} id="task-priority-select">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>
      {showStatus && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })} id="task-status-select">
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      )}
    </div>
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Assign To</label>
        <select className="form-select" value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} id="task-assignee-select">
          <option value="">Unassigned</option>
          {members?.map((m) => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input type="date" className="form-input" value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })} id="task-due-input" />
      </div>
    </div>
  </div>
);

export default ProjectDetail;
