import React, { useState, useEffect } from 'react';
import { PollList } from '../../poll/PollList';
import { getUserProfile } from '../../util/APIUtils';
import { Avatar, Tabs } from 'antd';
import { getAvatarColor } from '../../util/Colors';
import { formatDate } from '../../util/Helpers';
import LoadingIndicator  from '../../common/LoadingIndicator';
import './Profile.css';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';

const TabPane = Tabs.TabPane;

export const Profile = (props) => {
    const [userState, setUserState] = useState({user: null, isLoading: false});


    useEffect(() => {
        let unmounted = false;
        function loadUserProfile(username) {
            setUserState(state => ({...state,
                isLoading: true
            }));
            getUserProfile(username)
            .then(response => {
                if (!unmounted) {
                    setUserState(state => ({...state,
                        user: response,
                        isLoading: false
                    }));
                }
            }).catch(error => {
                if(error.status === 404) {
                    setUserState(state => ({
                        notFound: true,
                        isLoading: false
                    }));
                } else {
                    setUserState(state => ({...state,
                        serverError: true,
                        isLoading: false
                    }));        
                }
            });   
        }
        loadUserProfile(props.match.params.username);
    return () => { unmounted = true };
    }, [props.match.params.username]);
      
    if(userState.isLoading) {
        return <LoadingIndicator />;
    }

    if(userState.notFound) {
        return <NotFound />;
    }

    if(userState.serverError) {
        return <ServerError />;
    }

    const tabBarStyle = {
        textAlign: 'center'
    };

    return (
        <div className="profile">
            { 
                userState.user ? (
                    <div className="user-profile">
                        <div className="user-details">
                            <div className="user-avatar">
                                <Avatar className="user-avatar-circle" style={{ backgroundColor: getAvatarColor(userState.user.name)}}>
                                    {userState.user.name[0].toUpperCase()}
                                </Avatar>
                            </div>
                            <div className="user-summary">
                                <div className="full-name">{userState.user.name}</div>
                                <div className="username">@{userState.user.username}</div>
                                <div className="user-joined">
                                    Joined {formatDate(userState.user.joinedAt)}
                                </div>
                            </div>
                        </div>
                        <div className="user-poll-details">    
                            <Tabs defaultActiveKey="1" 
                                animated={false}
                                tabBarStyle={tabBarStyle}
                                size="large"
                                className="profile-tabs">
                                <TabPane tab={`${userState.user.pollCount} Polls`} key="1">
                                    <PollList username={props.match.params.username} type="USER_CREATED_POLLS" />
                                </TabPane>
                                <TabPane tab={`${userState.user.voteCount} Votes`}  key="2">
                                    <PollList username={props.match.params.username} type="USER_VOTED_POLLS" />
                                </TabPane>
                            </Tabs>
                        </div>  
                    </div>  
                ): null               
            }
        </div>
    );
}

