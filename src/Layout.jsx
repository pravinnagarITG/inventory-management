import { Box, Text, Icon, InlineGrid, BlockStack, Card, Button } from "@shopify/polaris";
import { Outlet, NavLink} from "react-router-dom";
import { HomeIcon, ExitIcon, ProfileIcon, ProductListIcon } from '@shopify/polaris-icons';
import { PersonFilledIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

export default function Layout() {

  // logout
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const userPass = localStorage.getItem('userPass');

  const logout = () =>{
    const delUser = window.confirm('Are you sure to logout');
    if(delUser){
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPass");
      localStorage.removeItem("currentPage");
       navigate('/');
    }
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

      // Poll every 30 seconds
      const interval = setInterval(validateSession, 20000);

      // Clean up interval on component unmount
      return () => clearInterval(interval);
    }
  }, [userRole, userEmail, userPass, navigate]);

  return (
    <div className="dasborad-content">
     <div className="left-side-content">
      
       <img src="Logo.png" width="140px" alt="logo" style={{margin:"0 0 18px 10px"}} />

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
      {/* Main Content */}
      <div className="right-side-content">
     <Card roundedAbove="0">
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto" gap="100" alignItems="center">
          <div className='login-user-icon'>
           <Icon source={ProfileIcon} />
          </div>
          <Button
            onClick={() =>  logout()}
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
    </div>
  );
}
