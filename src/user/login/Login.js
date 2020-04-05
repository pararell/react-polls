import React from 'react';
import { login } from '../../util/APIUtils';
import './Login.css';
import { Link } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';

import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;

export default function Login(props) {
        return (
            <div className="login-container">
                <h1 className="page-title">Login</h1>
                <div className="login-content">
                    <LoginForm onLogin={props.onLogin} />
                </div>
            </div>
        );
}

const LoginForm = (props) => {

   const handleSubmit = (event) => {
        const loginRequest = Object.assign({}, event);
        login(loginRequest)
        .then(response => {
            localStorage.setItem(ACCESS_TOKEN, response.accessToken);
            props.onLogin();
        }).catch(error => {
            if(error.status === 401) {
                notification.error({
                    message: 'Polling App',
                    description: 'Your Username or Password is incorrect. Please try again!'
                });                    
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });                                            
            }
        });
            
    }
    return (
        <Form onFinish={handleSubmit} className="login-form">
            <FormItem  name="usernameOrEmail" rules={[{ required: true, message: 'Please input your username or email!' }]}>
                <Input 
                    prefix={<UserOutlined type="user" />}
                    size="large"
                    name="usernameOrEmail" 
                    placeholder="Username or Email" />    
            
            </FormItem>
            <FormItem name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                <Input 
                    prefix={<LockOutlined type="lock" />}
                    size="large"
                    name="password" 
                    type="password" 
                    placeholder="Password"  />                        
            </FormItem>
            <FormItem>
                <Button type="primary" htmlType="submit" size="large" className="login-form-button">Login</Button>
                Or <Link to="/signup">register now!</Link>
            </FormItem>
        </Form>
    );
}
