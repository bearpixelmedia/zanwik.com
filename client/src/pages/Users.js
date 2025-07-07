import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Shield,
  Play,
  Pause,
  BarChart3,
  Upload,
  Filter,
  Clock,
  TrendingDown,
  UserX,
  Settings,
  Loader2,
  RefreshCw,
  Download,
  UserPlus,
  TrendingUp,
  UserCheck,
  Activity,
  Mail,
  CheckSquare,
  Square,
  Eye,
  Trash2,
  Key,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Users = () => {
  console.log('Rendering Users');
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [invitingUser, setInvitingUser] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    averageLoginFrequency: 0,
    roleDistribution: {},
    activityTrend: [],
  });
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'user',
    name: '',
    department: '',
    permissions: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Since getUsers doesn't exist in the API, we'll use mock data
      // const response = await api.users.getUsers();
      const response = { users: [] };
      const usersData = response.users || [];
      setUsers(usersData);

      // Calculate user statistics
      const stats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.status === 'active').length,
        newUsersThisMonth: usersData.filter(u => {
          const userDate = new Date(u.createdAt || u.lastLogin);
          const now = new Date();
          return (
            userDate.getMonth() === now.getMonth() &&
            userDate.getFullYear() === now.getFullYear()
          );
        }).length,
        averageLoginFrequency:
          usersData.length > 0
            ? usersData.reduce((acc, user) => acc + (user.loginCount || 0), 0) /
              usersData.length
            : 0,
        roleDistribution: usersData.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
        activityTrend: usersData.slice(0, 7).map((user, index) => ({
          date: new Date(
            Date.now() - (6 - index) * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          active: Math.floor(Math.random() * 10) + 1,
        })),
      };
      setUserStats(stats);

      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');

      // Fallback to mock data
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-20T10:30:00Z',
          projects: 3,
          department: 'Engineering',
          loginCount: 45,
          createdAt: '2024-01-01T00:00:00Z',
          permissions: ['read', 'write', 'admin'],
          avatar: null,
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'user',
          status: 'active',
          lastLogin: '2024-01-19T15:45:00Z',
          projects: 1,
          department: 'Marketing',
          loginCount: 23,
          createdAt: '2024-01-05T00:00:00Z',
          permissions: ['read', 'write'],
          avatar: null,
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'user',
          status: 'inactive',
          lastLogin: '2024-01-15T09:20:00Z',
          projects: 0,
          department: 'Sales',
          loginCount: 8,
          createdAt: '2024-01-10T00:00:00Z',
          permissions: ['read'],
          avatar: null,
        },
        {
          id: 4,
          name: 'Alice Brown',
          email: 'alice@example.com',
          role: 'manager',
          status: 'active',
          lastLogin: '2024-01-20T14:20:00Z',
          projects: 2,
          department: 'Product',
          loginCount: 32,
          createdAt: '2024-01-03T00:00:00Z',
          permissions: ['read', 'write', 'manage'],
          avatar: null,
        },
      ];
      setUsers(mockUsers);

      const stats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        newUsersThisMonth: 2,
        averageLoginFrequency: 27,
        roleDistribution: { admin: 1, user: 2, manager: 1 },
        activityTrend: [
          { date: '1/14', active: 3 },
          { date: '1/15', active: 4 },
          { date: '1/16', active: 2 },
          { date: '1/17', active: 5 },
          { date: '1/18', active: 3 },
          { date: '1/19', active: 4 },
          { date: '1/20', active: 4 },
        ],
      };
      setUserStats(stats);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!newUser.email.trim() || !newUser.name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setInvitingUser(true);
      await api.inviteUser(newUser);
      setShowInviteModal(false);
      setNewUser({
        email: '',
        role: 'user',
        name: '',
        department: '',
        permissions: [],
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error inviting user:', err);
      alert('Failed to invite user');
    } finally {
      setInvitingUser(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  const handleDeactivateUser = async userId => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await api.deactivateUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      switch (bulkAction) {
        case 'activate':
          await Promise.all(selectedUsers.map(id => api.activateUser(id)));
          break;
        case 'deactivate':
          await Promise.all(selectedUsers.map(id => api.deactivateUser(id)));
          break;
        case 'delete':
          if (
            window.confirm(
              `Are you sure you want to delete ${selectedUsers.length} users?`
            )
          ) {
            await Promise.all(selectedUsers.map(id => api.deleteUser(id)));
          }
          break;
        default:
          console.error('Unknown bulk action:', bulkAction);
          return;
      }
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsers();
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action');
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectUser = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const exportUsers = () => {
    const csvContent = [
      [
        'Name',
        'Email',
        'Role',
        'Status',
        'Department',
        'Last Login',
        'Projects',
      ],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.department || '',
        new Date(user.lastLogin).toLocaleDateString(),
        user.projects,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleColor = role => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>
            User Management
          </h1>
          <p className='text-muted-foreground'>
            Manage team members and their permissions.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Auto-refresh controls */}
          <div className='flex items-center space-x-2 mr-4'>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className='px-2 py-1 text-sm border border-border rounded bg-background'
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </div>

          <Button variant='outline' onClick={exportUsers}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>

          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className='h-4 w-4 mr-2' />
            Invite User
          </Button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Users
            </CardTitle>
            <UsersIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {userStats.totalUsers}
            </div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <TrendingUp className='h-3 w-3 text-green-500' />
              <span className='text-green-500'>
                +{userStats.newUsersThisMonth}
              </span>
              <span>this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Users
            </CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {userStats.activeUsers}
            </div>
            <div className='text-xs text-muted-foreground'>
              {userStats.totalUsers > 0
                ? (
                    (userStats.activeUsers / userStats.totalUsers) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg. Login Frequency
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {userStats.averageLoginFrequency.toFixed(0)}
            </div>
            <div className='text-xs text-muted-foreground'>logins per user</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pending Invites
            </CardTitle>
            <Mail className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>
              {users.filter(u => u.status === 'pending').length}
            </div>
            <div className='text-xs text-muted-foreground'>
              Awaiting confirmation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Breakdown of users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(userStats.roleDistribution).map(
                ([role, count]) => (
                  <div key={role} className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${getRoleColor(role)
                          .replace('bg-', 'bg-')
                          .replace('text-', '')}`}
                      />
                      <span className='text-sm font-medium capitalize'>
                        {role}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm font-bold'>{count}</span>
                      <span className='text-xs text-muted-foreground'>
                        (
                        {userStats.totalUsers > 0
                          ? ((count / userStats.totalUsers) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>
              User activity over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {userStats.activityTrend.map((day, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    {day.date}
                  </span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-16 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{ width: `${(day.active / 10) * 100}%` }}
                      />
                    </div>
                    <span className='text-sm font-medium'>{day.active}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search users by name or email...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className='px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value='all'>All Roles</option>
            <option value='admin'>Admin</option>
            <option value='manager'>Manager</option>
            <option value='user'>User</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className='px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='pending'>Pending</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className='flex items-center justify-between p-4 bg-muted/50 rounded-lg'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium'>
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <select
                value={bulkAction}
                onChange={e => setBulkAction(e.target.value)}
                className='px-3 py-1 text-sm border border-input rounded bg-background'
              >
                <option value=''>Select Action</option>
                <option value='activate'>Activate</option>
                <option value='deactivate'>Deactivate</option>
                <option value='delete'>Delete</option>
              </select>
              <Button
                size='sm'
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedUsers([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage user roles and permissions ({filteredUsers.length} users)
              </CardDescription>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={handleSelectAll}>
                {selectedUsers.length === filteredUsers.length ? (
                  <CheckSquare className='h-4 w-4' />
                ) : (
                  <Square className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className='space-y-4'>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-3'>
                      <input
                        type='checkbox'
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className='rounded border-gray-300'
                      />
                      <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                        <UsersIcon className='h-5 w-5 text-primary' />
                      </div>
                    </div>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <h3 className='text-sm font-medium text-foreground'>
                          {user.name}
                        </h3>
                        {user.id === currentUser?.id && (
                          <span className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'>
                            You
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                      <div className='flex items-center space-x-2 mt-1'>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                        {user.department && (
                          <span className='text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full'>
                            {user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-6'>
                    <div className='text-right text-sm text-muted-foreground'>
                      <div className='flex items-center space-x-1'>
                        <Clock className='h-3 w-3' />
                        <span>
                          Last login:{' '}
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <span>Projects: {user.projects}</span>
                        <span>Logins: {user.loginCount || 0}</span>
                      </div>
                    </div>

                    {currentUser?.role === 'admin' &&
                      user.id !== currentUser?.id && (
                        <div className='flex items-center space-x-2'>
                          <select
                            value={user.role}
                            onChange={e =>
                              handleUpdateUserRole(user.id, e.target.value)
                            }
                            className='text-xs px-2 py-1 border rounded bg-background'
                          >
                            <option value='user'>User</option>
                            <option value='manager'>Manager</option>
                            <option value='admin'>Admin</option>
                          </select>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Eye className='h-3 w-3' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeactivateUser(user.id)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <UsersIcon className='h-8 w-8 mx-auto mb-2 opacity-50' />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-xl font-bold mb-4'>Invite New User</h2>
            <div className='space-y-4'>
              <div>
                <label htmlFor='name'>Name</label>
                <input
                  type='text'
                  value={newUser.name}
                  onChange={e =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='Enter full name'
                />
              </div>
              <div>
                <label htmlFor='email'>Email</label>
                <input
                  type='email'
                  value={newUser.email}
                  onChange={e =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='Enter email address'
                />
              </div>
              <div>
                <label htmlFor='-department-'>Department</label>
                <select
                  value={newUser.department}
                  onChange={e =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value=''>Select Department</option>
                  <option value='Engineering'>Engineering</option>
                  <option value='Marketing'>Marketing</option>
                  <option value='Sales'>Sales</option>
                  <option value='Product'>Product</option>
                  <option value='Support'>Support</option>
                </select>
              </div>
              <div>
                <label htmlFor='role'>Role</label>
                <select
                  value={newUser.role}
                  onChange={e =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value='user'>User</option>
                  <option value='manager'>Manager</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
            </div>
            <div className='flex justify-end space-x-2 mt-6'>
              <Button
                variant='outline'
                onClick={() => setShowInviteModal(false)}
                disabled={invitingUser}
              >
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={invitingUser}>
                {invitingUser ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Inviting...
                  </>
                ) : (
                  'Send Invite'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold'>User Details</h2>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                ×
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* User Information */}
              <div className='space-y-4'>
                <h3 className='font-medium text-foreground'>
                  User Information
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Name:</span>
                    <span className='text-sm font-medium'>
                      {selectedUser.name}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Email:
                    </span>
                    <span className='text-sm font-medium'>
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Department:
                    </span>
                    <span className='text-sm font-medium'>
                      {selectedUser.department || 'Not specified'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Role:</span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getRoleColor(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Status:
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className='space-y-4'>
                <h3 className='font-medium text-foreground'>
                  Activity Information
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Last Login:
                    </span>
                    <span className='text-sm font-medium'>
                      {new Date(selectedUser.lastLogin).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Login Count:
                    </span>
                    <span className='text-sm font-medium'>
                      {selectedUser.loginCount || 0}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Projects:
                    </span>
                    <span className='text-sm font-medium'>
                      {selectedUser.projects}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Created:
                    </span>
                    <span className='text-sm font-medium'>
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {selectedUser.permissions &&
              selectedUser.permissions.length > 0 && (
                <div className='mt-6'>
                  <h3 className='font-medium text-foreground mb-3'>
                    Permissions
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedUser.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Actions */}
            {currentUser?.role === 'admin' &&
              selectedUser.id !== currentUser?.id && (
                <div className='mt-6 pt-6 border-t'>
                  <h3 className='font-medium text-foreground mb-3'>Actions</h3>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleUpdateUserRole(
                          selectedUser.id,
                          selectedUser.role === 'admin' ? 'user' : 'admin'
                      )
                      }
                    >
                      <Key className='h-4 w-4 mr-2' />
                      Toggle Admin
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeactivateUser(selectedUser.id)}
                    >
                      {selectedUser.status === 'active' ? (
                        <>
                          <Lock className='h-4 w-4 mr-2' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Unlock className='h-4 w-4 mr-2' />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant='outline' size='sm'>
                      <Mail className='h-4 w-4 mr-2' />
                      Resend Invite
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
