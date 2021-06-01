import React, {useRef, useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import { Avatar, ChatEngine } from 'react-chat-engine';
import { auth } from '../firebase';

import { useAuth, userAuth } from '../contexts/AuthContext';
import axios from 'axios';


const Chats = () => {

    const history = useHistory();
    const {user} = useAuth();  
    const [loading, setLoading] = useState(true);
    const  handleLogout = async () => {
        await auth.signOut();
        
        history.push('/');
    }

    const getFile = async (url) => {
        const response = await fetch(url);
        const data = await response.blob();

        return new File([data], "userPhoto.jpg", {type: 'image/jpeg' })
    }
    useEffect(() => {
        if(!user){
            history.push('/')
            return;
        }

        axios.get('https://api.chatengine.io/users/me', {
            headers: {
                "project-id": "2d0aacc4-35b3-4f0a-8d59-b0f4426bb7e5",
                "user-name": user.email,
                "user-secret": user.uid,

            }
        })
        .then(() => {
            setLoading(false);
        })
        .catch(() =>{
            let formdata = new FormData();
            formdata.append('email', user.email);
            formdata.append('username', user.displayName);
            formdata.append('secret', user.uid);

            getFile(user.photoURL)
                .then((avatar) => {
                    formdata.append('avatar', avatar, avatar.name);
                    axios.post('https://api.chatengine.io/users',
                        formdata,
                        {headers:
                            {"private-key": "9a2cbb24-5a56-45e0-8bc1-7a8da34674fd"}}
                        )    
                        .then(() => setLoading(false))
                        .catch((error) => console.log(error))   
                })
        })
    }, [user, history]);

    if(!user || loading) return 'Loading ... ';

    return(
        <div className="chats-page">
            <div className="nav-bar">
                <div className="logo-tab">
                    Chat
                </div>
                <div onClick={handleLogout} className="logout-tab">
                    Logout
                </div>
            </div>

            <ChatEngine 
                height ="calc(100vh - 66px)"
                projectID="2d0aacc4-35b3-4f0a-8d59-b0f4426bb7e5"
                userName={user.email}
                userSecret={user.uid}
            />
        </div>
    )
}

export default Chats;