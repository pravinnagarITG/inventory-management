import { Box, Text, Icon, InlineGrid, BlockStack, Card, Button } from "@shopify/polaris";
import { Outlet, NavLink} from "react-router-dom";
import { HomeIcon, ExitIcon, ProfileIcon, ProductListIcon, ListBulletedIcon, XIcon } from '@shopify/polaris-icons';
import { PersonFilledIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import CustomModal from './CustomModal';


export default function Layout() {

  const [drawerOpen, setDrawerOpen] = useState(false);

  // logout
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const userPass = localStorage.getItem('userPass');

  const logout = () =>{
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPass");
      localStorage.removeItem("currentPage");
       navigate('/');
  }
// Polling for session validation for non-admin users
  useEffect(() => {
    if (userRole !== 'admin') {
      const validateSession = async () => {
        try {
          const response = await fetch('https://inventory-management-mauve-seven.vercel.app/users', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }

          const data = await response.json();
          const users = data.users || [];
          const currentUser = users.find(user => user.email === userEmail && user.password === userPass);

          if (!currentUser || currentUser.role !== userRole) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userPass');
            localStorage.removeItem('userEmail');
            navigate('/');
          }
        } catch (err) {
          console.error('Error during session polling:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userPass');
          localStorage.removeItem('userEmail');
          navigate('/');
        }
      };

      const interval = setInterval(validateSession, 20000);
      return () => clearInterval(interval);
    }
  }, [userRole, userEmail, userPass, navigate]);

        const [modalOpen, setModalOpen] = useState(false);
        const [modalContent, setModalContent] = useState(null);
        const [modalTitle, setModalTitle] = useState('');
        const [eventTitle, setEventTitle] = useState('');

          const handleOpen = (title, content, eventTitle) => {
            setModalTitle(title);
            setModalContent(content);
            setModalOpen(true);
            setEventTitle(eventTitle);
          };

          const closeModals = () =>{
            setModalTitle('');
            setModalContent('');
            setModalOpen(false);
            setEventTitle('');
          }

  return (
    <div className="dasborad-content">
     <div className="left-side-content">
      
       <img src="Logo.png" width="140px" alt="logo" style={{margin:"0 0 18px 10px"}} />

      <div className={`dashboard-options ${drawerOpen ? 'open' : ''}`}>
        <div className="toogle-close">
          <img src="Logo.png" width="100px" alt="logo" style={{margin:"0 0 0px 10px"}} />
          <Button id="toggle" icon={XIcon} onClick={() => setDrawerOpen(false)}/>
        </div>
        <Box paddingBlock="">
          <NavLink to="/dashboard" style={({ isActive }) => ({
            textDecoration: "none", color:"var(--p-color-bg-surface)", display:"flex", gap:"var(--p-space-150)", padding:"10px"
          })}>  
           <Icon source={HomeIcon}/>
           <Text variant="headingMd" fontWeight="medium">Dashboard</Text>
          </NavLink>
        </Box>

          <Box paddingBlock="">
          <NavLink to="/products" style={({ isActive }) => ({
            textDecoration: "none", color:"var(--p-color-bg-surface)", display:"flex", gap:"var(--p-space-150)", padding:"10px"
          })}>  
           <Icon source={ProductListIcon}/>
           <Text variant="headingMd" fontWeight="medium">All Products</Text>
          </NavLink>
        </Box>

        {userRole === 'admin' && (
          <Box paddingBlock="">
            <NavLink to="/users" style={({ isActive }) => ({
              textDecoration: "none", color: "var(--p-color-bg-surface)", display: "flex", gap: "var(--p-space-150)", padding: "10px"
            })}>
              <Icon source={PersonFilledIcon}/>
              <Text variant="headingMd" fontWeight="medium">Users</Text>
            </NavLink>
          </Box>
        )}
      </div>
       <Button size="large" id="toggle" icon={drawerOpen ? XIcon : ListBulletedIcon} onClick={() => setDrawerOpen(drawerOpen ? false : true)} />
     </div>
      {/* Main Content */}

    <div className="right-side-content">
     <Card roundedAbove="0">
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto" gap="100" alignItems="center">
          <div className='login-user-icon'>
           <Icon source={ProfileIcon} />
          </div>
          <Button
            onClick={() =>  handleOpen('Log out', 'Are you sure you want to log out?', 'Log out')}
            accessibilityLabel="Log out"
            variant="primary"
            icon={ExitIcon}
          >
          Log out
          </Button>
        </InlineGrid>
      </BlockStack>
    </Card>
    <Outlet />
    </div>
       <CustomModal open={modalOpen} onClose={() => closeModals()} onAction={() => logout()} title={modalTitle} buttonText={eventTitle}>
        {modalContent}
      </CustomModal>
    </div>
  );
}
