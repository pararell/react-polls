import React, { useEffect, useState } from 'react';
import { getAllPolls, getUserCreatedPolls, getUserVotedPolls } from '../util/APIUtils';
import Poll from './Poll';
import { castVote } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { POLL_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './PollList.css';


const setPollPromise = (props, page, size) => {
    if(props.username) {
        if(props.type === 'USER_CREATED_POLLS') {
            return getUserCreatedPolls(props.username, page, size);
        } else if (props.type === 'USER_VOTED_POLLS') {
            return getUserVotedPolls(props.username, page, size);                               
        }
    } else {
        return getAllPolls(page, size);
    }
}


const setPollsFromResponse = (response, pollsFromState, currentVotesFromState) => {
    const polls = pollsFromState.slice();
    const currentVotes = currentVotesFromState.slice();
    
    return {
        polls: polls.concat(response.content),
        page: response.page,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        last: response.last,
        currentVotes: currentVotes.concat(Array(response.content.length).fill(null)),
        isLoading: false
    }
}

export const PollList = withRouter((props) => {

    const [pollState, setPollState] = useState({
        polls: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
        currentVotes: [],
        isLoading: false
    });


    useEffect(() => {
        let unmounted = false;

        setPollState(state => ({...state,
            polls: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentVotes: [],
            isLoading: false
        })); 

        const loadPollList = (page = 0, size = POLL_LIST_SIZE) => {
            const promise = setPollPromise(props, page, size);
       
            if(!promise) {
                return;
            }
    
            setPollState(state => ({...state, isLoading: true }));
    
            promise            
                .then(response => {

                    if (unmounted) {
                        return;
                    }
                    setPollState(state => ({...state, 
                        ...setPollsFromResponse(response, state.polls, state.currentVotes)
                    }));
                }).catch(error => {
                    setPollState(state => ({...state, isLoading: false }))
                });  
        };

        if (!unmounted) {
            loadPollList();
        }
        
        return () => { unmounted = true };
    }, [props]);


    const handleLoadMore = () => {
        const page = pollState.page + 1;
        const size = POLL_LIST_SIZE;
        const promise = setPollPromise(props, page, size);
        const {polls, currentVotes} = pollState;
   
        if(!promise) {
            return;
        }

        setPollState(state => ({...state, isLoading: true }));

        promise            
            .then(response => {
                const pollsResponse = setPollsFromResponse(response, polls, currentVotes);
                setPollState(state => ({...state, ...pollsResponse}));
            }).catch(error => {
                setPollState(state => ({...state, isLoading: false }))
            });  

    }

    const handleVoteChange = (event, pollIndex) => {
        const currentVotes = pollState.currentVotes.slice();
        currentVotes[pollIndex] = event.target.value;

        setPollState(state => ({...state,
            currentVotes: currentVotes
        }));
    }

    const handleVoteSubmit = (event, pollIndex) => {
        event.preventDefault();
        if(!props.isAuthenticated) {
            props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to vote.",          
            });
            return;
        }

        const poll = pollState.polls[pollIndex];
        const selectedChoice = pollState.currentVotes[pollIndex];

        const voteData = {
            pollId: poll.id,
            choiceId: selectedChoice
        };

        castVote(voteData)
            .then(response => {
                const polls = pollState.polls.slice();
                polls[pollIndex] = response;
                setPollState(state => ({...state,
                    polls: polls
                }));        
            }).catch(error => {
                if(error.status === 401) {
                    props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');    
                } else {
                    notification.error({
                        message: 'Polling App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });                
                }
            });
    }

    return (
        <div className="polls-container">
            { pollState.polls.map((poll, pollIndex) => 
                <Poll 
                    key={pollIndex} 
                    poll={poll}
                    currentVote={pollState.currentVotes[pollIndex]} 
                    handleVoteChange={(event) => handleVoteChange(event, pollIndex)}
                    handleVoteSubmit={(event) => handleVoteSubmit(event, pollIndex)} />     
            )}
            {
                !pollState.isLoading && pollState.polls.length === 0 ? (
                    <div className="no-polls-found">
                        <span>No Polls Found.</span>
                    </div>    
                ): null
            }  
            {
                !pollState.isLoading && !pollState.last ? (
                    <div className="load-more-polls"> 
                        <Button type="dashed" onClick={handleLoadMore} disabled={pollState.isLoading}>
                            <PlusOutlined type="plus" /> Load more
                        </Button>
                    </div>): null
            }              
            {
                pollState.isLoading ? 
                <LoadingIndicator />: null                     
            }
        </div>
    );
    
});

