import { LegacyStack, Modal, FormLayout, TextField, EmptyState, Banner, DataTable, Button, Text, Page, LegacyCard, Spinner } from '@shopify/polaris';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Users() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editEmail, editSetEmail] = useState('');
  const [editPassword, editSetPassword] = useState('');
  const [editModalOpen, editSetModalOpen] = useState(false);
  const [editUserId, setUserId] = useState(null);
  const role = 'user';

  // Email validation regex (checks for @ and .)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation (at least 8 characters)
  const isValidPassword = (password) => password.length >= 8;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('https://inventory-management-mauve-seven.vercel.app/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }

      const data = await response.json();
      const userArray = Array.isArray(data) ? data : data.users || [];
      setUsers(userArray);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
      console.error('Error fetching users:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open modal with appropriate title
  const openModal = (title) => {
    setModalTitle(title);
    setModalOpen(true);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  // Close modal
  const handleModalClose = () => {
    setModalOpen(false);
    editSetModalOpen(false);
    setError(null);
    setSuccess(null);
    setUserId(null);
  };

  // Handle user addition
  const handleAddUser = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validate email format
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address (must include @ and .).');
      }
      if (!isValidPassword(password)) {
        throw new Error('Password must be at least 8 characters long.');
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('https://inventory-management-mauve-seven.vercel.app/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.message && data.message.includes('User already exists.')) {
          throw new Error('Email already taken, use another email.');
        }
        throw new Error(data.error || 'Failed to add user. Please check the email or password.');
      }

      const data = await response.json();
      console.log('Add User API Response:', data);
      setSuccess('User added successfully!');
        setTimeout(() => {
          handleModalClose();
          fetchUsers();
        }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error adding user:', err);
      if (err.message.includes('No authentication token')) {
        navigate('/');
      }
    }
  };

  // Handle Edit
  const editUser = (userId, userEmail, userPassword) => {
    editSetModalOpen(true);
    setUserId(userId);
    editSetEmail(userEmail);
    editSetPassword(userPassword);
  };

  const handleEdit = async () =>{

    try {
  // Validate email format
      if (!isValidEmail(editEmail)) {
        throw new Error('Please enter a valid email address (must include @ and .).');
      }
      if (editPassword && !isValidPassword(editPassword)) {
        throw new Error('Password must be at least 8 characters long.');
      }

      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`https://inventory-management-mauve-seven.vercel.app/update/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body:JSON.stringify({email: editEmail, password: editPassword, role: 'user' })
      });

      if (!response.ok) {
        throw new Error('Failed to edit user.');
      }
      const data = await response.json();
      setSuccess(data.message);
        setTimeout(() => {
          handleModalClose();
          fetchUsers();
        }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to edit user.');
      console.error('Error editing user:', err);
    }
  }

  const [modalActive, setModalActive] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

      const handleOpenModal = useCallback((userId) => {
        setSelectedUserId(userId);
        setModalActive(true)
      }, []);

     const handleCloseModal = useCallback(() => {
      setModalActive(false);
      setSelectedUserId(null); // clear selected user on close
     }, []);

  // Handle Delete
  const handleDelete = async (userId) => {

    try {
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`https://inventory-management-mauve-seven.vercel.app/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user.');
      }
       setModalActive(false);
        fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
      console.error('Error deleting user:', err);
    }
  };


  // Format rows for DataTable
  const rows = users.map((user) => [
    user.email,
    user.password,
    <Button key={`edit-${user._id}`} onClick={() => editUser(user._id, user.email, user.password)}>
      Edit
    </Button>,
    <Button key={`delete-${user._id}`} destructive onClick={() => handleOpenModal(user._id)}>
      Delete
    </Button>,
  ]);

  return (
  <>
      {error && !modalOpen && (
        <Banner status="critical" title="Error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}
      {success && !modalOpen && (
        <Banner status="success" title="Success" onDismiss={() => setSuccess(null)}>
          {success}
        </Banner>
      )}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={modalTitle}
        primaryAction={{
          content: 'Add',
          onAction: handleAddUser,
          disabled: email.length === 0 || password.length === 0 || !isValidEmail(email) || !isValidPassword(password),
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            {error && (
              <Banner status="critical" title="Error" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}
            {success && (
              <Banner status="success" title="Success" onDismiss={() => setSuccess(null)}>
                {success}
              </Banner>
            )}
            <FormLayout>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(value) => setEmail(value)}
                autoComplete="email"
                placeholder="lapresse@jadedpixel.com"
                error={email && !isValidEmail(email) ? 'Email must include @ and .' : null}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(value) => setPassword(value)}
                error={password && !isValidPassword(password) ? 'Password must be at least 8 characters long.' : null}
                helpText="Password must be at least 8 characters."
                autoComplete="current-password"
              />
            </FormLayout>
          </LegacyStack>
        </Modal.Section>
      </Modal>
      {loading ? (
        <Page fullWidth>
          <LegacyCard>
           <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Spinner accessibilityLabel="Loading inventory" size="large" />
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Text>Loading users...</Text>
            </div>
          </LegacyCard>
        </Page>
      ) : users.length > 0 ? (  
      <>
      <Page fullWidth
            title="Users"
            primaryAction={{
              content: 'Add User',
              onAction: () => openModal('Add Users'),
              disabled:false
            }}
          >
      </Page>
        
        <Page fullWidth>
          <LegacyCard>
            <DataTable
              columnContentTypes={['text', 'text', 'numeric', 'numeric']}
              headings={[
                <Text key="email" variant="headingMd" fontWeight="bold" as="h6">
                  Emails
                </Text>,
                <Text key="passwords" variant="headingMd" fontWeight="bold" as="h6">
                  Passwords
                </Text>,
                <Text key="edit" variant="headingMd" fontWeight="bold" as="h6">
                  Edit
                </Text>,
                <Text key="delete" variant="headingMd" fontWeight="bold" as="h6">
                  Delete
                </Text>,
              ]}
              rows={rows}
            />
          </LegacyCard>
        </Page>
        <Modal
        open={editModalOpen}
        onClose={handleModalClose}
        title="Edit User"
        primaryAction={{
          content: 'Save',
          onAction: handleEdit,
          disabled: editEmail.length === 0 || editPassword.length === 0 || !isValidEmail(editEmail) || (editPassword && !isValidPassword(editPassword)),
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            {error && (
              <Banner status="critical" title="Error" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}
            {success && (
              <Banner status="success" title="Success" onDismiss={() => setSuccess(null)}>
                {success}
              </Banner>
            )}
            <FormLayout>
              <TextField
                label="Email"
                type="email"
                value={editEmail}
                onChange={(value) => editSetEmail(value)}
                autoComplete="email"
                error={editEmail && !isValidEmail(editEmail) ? 'Email must include @ and .' : null}
              />
              <TextField
                label="Password"
                type="password"
                value={editPassword}
                onChange={(value) => editSetPassword(value)}
                autoComplete="current-password"
                error={editPassword && !isValidPassword(editPassword) ? 'Password must be at least 8 characters long.' : null}
                helpText="Enter a new password to update, or leave blank to keep the existing password. Password must be at least 8 characters."
              />
            </FormLayout>
          </LegacyStack>
        </Modal.Section>
      </Modal>
        </>
      ) : (
      <div className="user-add-content">
        <EmptyState
          heading="Add a user to get started"
          action={{ content: 'Add User', onAction: () => openModal('Add Users') }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth
        >
          <p>You can use the Users section to add team members.</p>
        </EmptyState>
        </div>
      )}
       <div style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Modal
              activator={handleOpenModal}
              open={modalActive}
              onClose={handleCloseModal}
              title="Delete User"
              primaryAction={{
                content: 'Delete',
                onAction: () => handleDelete(selectedUserId),
                destructive: true,
              }}
              secondaryActions={[
                {
                  content: 'Cancel',
                  onAction: handleCloseModal,
                },
              ]}
            >
              <Modal.Section>
                <div className="modal-content">
                  <Text variant="headingMd" as="h6">
                   Are you sure you want to delete this user?
                  </Text>
                </div>
              </Modal.Section>
            </Modal>
        </div>
  </>
  );
}