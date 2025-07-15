import { Box, Text, Icon, InlineGrid, BlockStack, Card, Button } from "@shopify/polaris";
import { Outlet, NavLink} from "react-router-dom";
import { HomeIcon, ExitIcon, ProfileIcon } from '@shopify/polaris-icons';
import { PersonFilledIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";

export default function Layout() {

  // logout
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const logout = () =>{
    const delUser = window.confirm('Are you sure to logout');
    if(delUser){
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("currentPage");
       navigate('/');
    }
  }


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
