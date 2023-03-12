import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userState } from "../../services/user";
import { signOut } from "firebase/auth";
import { auth } from "../../app/firebase";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu } from "@mui/icons-material";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Contact", path: "/contact" },
];

export const NavBar = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prevValue) => !prevValue);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Boerderij bloem CMS
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleLinkClick(item.path)} sx={{ textAlign: "center" }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem key="logout" disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ textAlign: "center" }}>
            <ListItemText primary="Uitloggen" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar component="nav" position="sticky">
        <Toolbar>
          {user && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <Menu />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
            }}
          >
            Boerderij bloem CMS
          </Typography>
          {user && (
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  <Button key={item.label} sx={{ color: "#fff" }}>
                    {item.label}
                  </Button>
                </NavLink>
              ))}
              {user && (
                <>
                  <span style={{ margin: "0px 20px" }}>|</span>
                  <Button onClick={handleLogout} key="logout" color="inherit">
                    Uitloggen
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: "95%",
              maxWidth: "250px",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};
