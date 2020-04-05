import React, { useState } from 'react';
import { signup, checkUsernameAvailability, checkEmailAvailability } from '../../util/APIUtils';
import './Signup.css';
import { Link } from 'react-router-dom';
import { 
    NAME_MIN_LENGTH, NAME_MAX_LENGTH, 
    USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH
} from '../../constants';

import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;

export default function Signup(props) {
    const [formValues, setFormVal] = useState({
            name: {
                value: ''
            },
            username: {
                value: ''
            },
            email: {
                value: ''
            },
            password: {
                value: ''
            }
    })

    const handleInputChange = (event, validationFun) => {
        const { name, value } = event.target;

        setFormVal(
            {...formValues,
            [name] : {
                value,
                ...validationFun(value)
            }
        });
    }

    const handleSubmit = (event) => {
    
        const signupRequest = {
            name: formValues.name.value,
            email: formValues.email.value,
            username: formValues.username.value,
            password: formValues.password.value
        };
        signup(signupRequest)
        .then(response => {
            notification.success({
                message: 'Polling App',
                description: "Thank you! You're successfully registered. Please Login to continue!",
            });          
            props.history.push("/login");
        }).catch(error => {
            notification.error({
                message: 'Polling App',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    const isFormInvalid = () => {
        return !(formValues.name.validateStatus === 'success' &&
            formValues.username.validateStatus === 'success' &&
            formValues.email.validateStatus === 'success' &&
            formValues.password.validateStatus === 'success'
        );
    }


        // Validation Functions
    const validateName = (name) => {
            if(name.length < NAME_MIN_LENGTH) {
                return {
                    validateStatus: 'error',
                    errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
                }
            } else if (name.length > NAME_MAX_LENGTH) {
                return {
                    validationStatus: 'error',
                    errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
                }
            } else {
                return {
                    validateStatus: 'success',
                    errorMsg: null,
                  };            
            }
        }
    
    const validateEmail = (email) => {
            if(!email) {
                return {
                    validateStatus: 'error',
                    errorMsg: 'Email may not be empty'                
                }
            }
    
            const EMAIL_REGEX = RegExp('[^@ ]+@[^@ ]+\\.[^@ ]+');
            if(!EMAIL_REGEX.test(email)) {
                return {
                    validateStatus: 'error',
                    errorMsg: 'Email not valid'
                }
            }
    
            if(email.length > EMAIL_MAX_LENGTH) {
                return {
                    validateStatus: 'error',
                    errorMsg: `Email is too long (Maximum ${EMAIL_MAX_LENGTH} characters allowed)`
                }
            }
    
            return {
                validateStatus: null,
                errorMsg: null
            }
        }
    
    const validateUsername = (username) => {
            if(username.length < USERNAME_MIN_LENGTH) {
                return {
                    validateStatus: 'error',
                    errorMsg: `Username is too short (Minimum ${USERNAME_MIN_LENGTH} characters needed.)`
                }
            } else if (username.length > USERNAME_MAX_LENGTH) {
                return {
                    validationStatus: 'error',
                    errorMsg: `Username is too long (Maximum ${USERNAME_MAX_LENGTH} characters allowed.)`
                }
            } else {
                return {
                    validateStatus: null,
                    errorMsg: null
                }
            }
        }
    
    const validateUsernameAvailability = () => {
            // First check for client side errors in username
            const usernameValue = formValues.username.value;
            const usernameValidation = validateUsername(usernameValue);
    
            if(usernameValidation.validateStatus === 'error') {
                setFormVal({
                    ...formValues,
                    username: {
                        value: usernameValue,
                        ...usernameValidation
                    }
                });
                return;
            }
    
            setFormVal({
                ...formValues,
                username: {
                    value: usernameValue,
                    validateStatus: 'validating',
                    errorMsg: null
                }
            });
    
            checkUsernameAvailability(usernameValue)
            .then(response => {
                if(response.available) {
                    setFormVal({
                        ...formValues,
                        username: {
                            value: usernameValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    setFormVal({
                        ...formValues,
                        username: {
                            value: usernameValue,
                            validateStatus: 'error',
                            errorMsg: 'This username is already taken'
                        }
                    });
                }
            }).catch(error => {
                // Marking validateStatus as success, Form will be recchecked at server
                setFormVal({
                    ...formValues,
                    username: {
                        value: usernameValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            });
        }
    
        const validateEmailAvailability = () => {
            // First check for client side errors in email
            const emailValue = formValues.email.value;
            const emailValidation = validateEmail(emailValue);
    
            if(emailValidation.validateStatus === 'error') {
                setFormVal({
                    ...formValues,
                    email: {
                        value: emailValue,
                        ...emailValidation
                    }
                });    
                return;
            }
    
            setFormVal({
                ...formValues,
                email: {
                    value: emailValue,
                    validateStatus: 'validating',
                    errorMsg: null
                }
            });
    
            checkEmailAvailability(emailValue)
            .then(response => {
                if(response.available) {
                    setFormVal({
                        ...formValues,
                        email: {
                            value: emailValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    setFormVal({
                        ...formValues,
                        email: {
                            value: emailValue,
                            validateStatus: 'error',
                            errorMsg: 'This Email is already registered'
                        }
                    });
                }
            }).catch(error => {
                // Marking validateStatus as success, Form will be recchecked at server
                setFormVal({
                    ...formValues,
                    email: {
                        value: emailValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            });
        }
    
    const validatePassword = (password) => {
            if(password.length < PASSWORD_MIN_LENGTH) {
                return {
                    validateStatus: 'error',
                    errorMsg: `Password is too short (Minimum ${PASSWORD_MIN_LENGTH} characters needed.)`
                }
            } else if (password.length > PASSWORD_MAX_LENGTH) {
                return {
                    validationStatus: 'error',
                    errorMsg: `Password is too long (Maximum ${PASSWORD_MAX_LENGTH} characters allowed.)`
                }
            } else {
                return {
                    validateStatus: 'success',
                    errorMsg: null,
                };            
            }
        }



    return (
        <div className="signup-container">
            <h1 className="page-title">Sign Up</h1>
            <div className="signup-content">
                <Form onFinish={handleSubmit} className="signup-form">
                    <FormItem 
                        label="Full Name"
                        validateStatus={formValues.name.validateStatus}
                        help={formValues.name.errorMsg}>
                        <Input 
                            size="large"
                            name="name"
                            autoComplete="off"
                            placeholder="Your full name"
                            value={formValues.name.value} 
                            onChange={(event) => handleInputChange(event, validateName)} />    
                    </FormItem>
                    <FormItem label="Username"
                        hasFeedback
                        validateStatus={formValues.username.validateStatus}
                        help={formValues.username.errorMsg}>
                        <Input 
                            size="large"
                            name="username" 
                            autoComplete="off"
                            placeholder="A unique username"
                            value={formValues.username.value} 
                            onBlur={validateUsernameAvailability}
                            onChange={(event) => handleInputChange(event, validateUsername)} />    
                    </FormItem>
                    <FormItem 
                        label="Email"
                        hasFeedback
                        validateStatus={formValues.email.validateStatus}
                        help={formValues.email.errorMsg}>
                        <Input 
                            size="large"
                            name="email" 
                            type="email" 
                            autoComplete="off"
                            placeholder="Your email"
                            value={formValues.email.value} 
                            onBlur={validateEmailAvailability}
                            onChange={(event) => handleInputChange(event, validateEmail)} />    
                    </FormItem>
                    <FormItem 
                        label="Password"
                        validateStatus={formValues.password.validateStatus}
                        help={formValues.password.errorMsg}>
                        <Input 
                            size="large"
                            name="password" 
                            type="password"
                            autoComplete="off"
                            placeholder="A password between 6 to 20 characters" 
                            value={formValues.password.value} 
                            onChange={(event) => handleInputChange(event, validatePassword)} />    
                    </FormItem>
                    <FormItem>
                        <Button type="primary" 
                            htmlType="submit" 
                            size="large" 
                            className="signup-form-button"
                            disabled={isFormInvalid()}>Sign up</Button>
                        Already registed? <Link to="/login">Login now!</Link>
                    </FormItem>
                </Form>
            </div>
        </div>
    );

}
