import React, { useState } from 'react';
import { createPoll } from '../util/APIUtils';
import { MAX_CHOICES, POLL_QUESTION_MAX_LENGTH, POLL_CHOICE_MAX_LENGTH } from '../constants';
import './NewPoll.css';  
import { Form, Input, Button, Select, Col, notification } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input

export default function NewPoll(props) {
    const [pollState, setPollState] = useState({
            question: {
                text: ''
            },
            choices: [{
                text: ''
            }, {
                text: ''
            }],
            pollLength: {
                days: 1,
                hours: 0
            }
    });

    const addChoice = () => {
        const choices = pollState.choices.slice();        
        setPollState((state) => ({...state,
            choices: choices.concat([{
                text: ''
            }])
        }));
    }

    const removeChoice = (choiceNumber) => {
        const choices = pollState.choices.slice();
        setPollState((state) => ({...state,
            choices: [...choices.slice(0, choiceNumber), ...choices.slice(choiceNumber+1)]
        }));
    }

    const handleSubmit = (event) => {
        const pollData = {
            question: pollState.question.text,
            choices: pollState.choices.map(choice => {
                return {text: choice.text} 
            }),
            pollLength: pollState.pollLength
        };

        createPoll(pollData)
        .then(response => {
            props.history.push("/");
        }).catch(error => {
            if(error.status === 401) {
                props.handleLogout('/login', 'error', 'You have been logged out. Please login create poll.');    
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });
    }

    const validateQuestion = (questionText) => {
        if(questionText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your question!'
            }
        } else if (questionText.length > POLL_QUESTION_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Question is too long (Maximum ${POLL_QUESTION_MAX_LENGTH} characters allowed)`
            }    
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    const handleQuestionChange = (event) => {
        const value = event.target.value;
        setPollState((state) => ({...state,
            question: {
                text: value,
                ...validateQuestion(value)
            }
        }));
    }

    const validateChoice = (choiceText) => {
        if(choiceText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter a choice!'
            }
        } else if (choiceText.length > POLL_CHOICE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Choice is too long (Maximum ${POLL_CHOICE_MAX_LENGTH} characters allowed)`
            }    
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    const handleChoiceChange = (event, index) => {
        const choices = pollState.choices.slice();
        const value = event.target.value;

        choices[index] = {
            text: value,
            ...validateChoice(value)
        }

        setPollState((state) => ({...state,
            choices: choices
        }));
    }

    const handlePollDaysChange = (value) => {
        const pollLength = Object.assign(pollState.pollLength, {days: value});
        setPollState((state) => ({...state,
            pollLength: pollLength
        }));
    }

    const handlePollHoursChange = (value) => {
        const pollLength = Object.assign(pollState.pollLength, {hours: value});
        setPollState((state) => ({...state,
            pollLength: pollLength
        }));
    }

    const isFormInvalid = () => {
        if(pollState.question.validateStatus !== 'success') {
            return true;
        }
    
        for(let i = 0; i < pollState.choices.length; i++) {
            const choice = pollState.choices[i];            
            if(choice.validateStatus !== 'success') {
                return true;
            }
        }
    }

    return (
        <div className="new-poll-container">
            <h1 className="page-title">Create Poll</h1>
            <div className="new-poll-content">
                <Form onFinish={handleSubmit} className="create-poll-form">
                    <FormItem validateStatus={pollState.question.validateStatus}
                        help={pollState.question.errorMsg} className="poll-form-row">
                    <TextArea 
                        placeholder="Enter your question"
                        style = {{ fontSize: '16px' }} 
                        autosize={{ minRows: 3, maxRows: 6 }} 
                        name = "question"
                        value = {pollState.question.text}
                        onChange = {handleQuestionChange} />
                    </FormItem>
                    {pollState.choices.map((choice, index) => 
                        <PollChoice key={index} 
                            choice={choice} 
                            choiceNumber={index} 
                            removeChoice={removeChoice} 
                            handleChoiceChange={handleChoiceChange}/>
                    )}
                    <FormItem className="poll-form-row">
                        <Button type="dashed" onClick={addChoice} disabled={pollState.choices.length === MAX_CHOICES}>
                            <PlusOutlined type="plus" /> Add a choice
                        </Button>
                    </FormItem>
                    <FormItem className="poll-form-row">
                        <Col xs={24} sm={4}>
                            Poll length: 
                        </Col>
                        <Col xs={24} sm={20}>    
                            <span style = {{ marginRight: '18px' }}>
                                <Select 
                                    name="days"
                                    defaultValue="1" 
                                    onChange={handlePollDaysChange}
                                    value={pollState.pollLength.days}
                                    style={{ width: 60 }} >
                                    {
                                        Array.from(Array(8).keys()).map(i => 
                                            <Option key={i}>{i}</Option>                                        
                                        )
                                    }
                                </Select> &nbsp;Days
                            </span>
                            <span>
                                <Select 
                                    name="hours"
                                    defaultValue="0" 
                                    onChange={handlePollHoursChange}
                                    value={pollState.pollLength.hours}
                                    style={{ width: 60 }} >
                                    {
                                        Array.from(Array(24).keys()).map(i => 
                                            <Option key={i}>{i}</Option>                                        
                                        )
                                    }
                                </Select> &nbsp;Hours
                            </span>
                        </Col>
                    </FormItem>
                    <FormItem className="poll-form-row">
                        <Button type="primary" 
                            htmlType="submit" 
                            size="large" 
                            disabled={isFormInvalid()}
                            className="create-poll-form-button">Create Poll</Button>
                    </FormItem>
                </Form>
            </div>    
        </div>
    );
}

function PollChoice(props) {
    return (
        <FormItem validateStatus={props.choice.validateStatus}
        help={props.choice.errorMsg} className="poll-form-row">
            <Input 
                placeholder = {'Choice ' + (props.choiceNumber + 1)}
                size="large"
                value={props.choice.text} 
                className={ props.choiceNumber > 1 ? "optional-choice": null}
                onChange={(event) => props.handleChoiceChange(event, props.choiceNumber)} />

            {
                props.choiceNumber > 1 ? (
                <CloseOutlined
                    className="dynamic-delete-button"
                    type="close"
                    disabled={props.choiceNumber <= 1}
                    onClick={() => props.removeChoice(props.choiceNumber)}
                /> ): null
            }    
        </FormItem>
    );
}
