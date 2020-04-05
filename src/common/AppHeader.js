import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import './AppHeader.css';
import pollIcon from '../poll.svg';
import { Layout, Menu, Dropdown } from 'antd';

import { UserOutlined, HomeOutlined, DownOutlined } from '@ant-design/icons';

const Header = Layout.Header;
    
export const AppHeader = withRouter((props) => {

    const handleMenuClick = ({ key }) => {
      if(key === "logout") {
        props.onLogout();
      }
    }
  
    return (
        <Header className="app-header">
        <div className="container">
          <div className="app-title" >
            <Link to="/">Polling App</Link>
          </div>
          <Menu
            className="app-menu"
            mode="horizontal"
            selectedKeys={[props.location.pathname]}
            style={{ lineHeight: '64px' }} >
            { props.currentUser
              ? [ <Menu.Item key="/">
                    <Link to="/">
                      <HomeOutlined type="home" className="nav-icon" />
                    </Link>
                  </Menu.Item>,
                  <Menu.Item key="/poll/new">
                    <Link to="/poll/new">
                      <img src={pollIcon} alt="poll" className="poll-icon" />
                    </Link>
                  </Menu.Item>,
                  <Menu.Item key="/profile" className="profile-menu">
                    <ProfileDropdownMenu 
                        currentUser={props.currentUser} 
                        handleMenuClick={handleMenuClick}/>
                  </Menu.Item>]
              : [ <Menu.Item key="/login">
                    <Link to="/login">Login</Link>
                  </Menu.Item>,
                  <Menu.Item key="/signup">
                    <Link to="/signup">Signup</Link>
                  </Menu.Item>]
            }             
          </Menu>
        </div>
      </Header>
    );
});

function ProfileDropdownMenu(props) {
  const dropdownMenu = (
    <Menu onClick={props.handleMenuClick} className="profile-dropdown-menu">
      <Menu.Item key="user-info" className="dropdown-item" disabled>
        <div className="user-full-name-info">
          {props.currentUser.name}
        </div>
        <div className="username-info">
          @{props.currentUser.username}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile" className="dropdown-item">
        <Link to={`/users/${props.currentUser.username}`}>Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout" className="dropdown-item">
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown 
      overlay={dropdownMenu} 
      trigger={['click']}
      getPopupContainer = { () => document.getElementsByClassName('profile-menu')[0]}>
      <span className="ant-dropdown-link">
         <UserOutlined type="user" className="nav-icon" style={{marginRight: 0}} /> <DownOutlined type="down" />
      </span>
    </Dropdown>
  );
}