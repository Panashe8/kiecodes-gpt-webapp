/**
 * App Component (Main Component)
 * -------------------------------
 * This is the main component of the React chat application.
 * 
 * Functionalities:
 * - Manages the overall state and behavior of the chat application.
 * - Orchestrates sub-components such as Header, ChatInput, ChatMessage, etc.
 * 
 * State Management:
 * - Utilizes React's useState hook to manage the 'run' state of the chat session.
 * 
 * Custom Hooks:
 * - useThread: Manages the thread of messages and actions.
 * - useRunPolling: Updates the 'run' state periodically.
 * - useRunRequiredActionsProcessing: Handles actions required for the current run.
 * - useRunStatus: Retrieves the status and processing state of the run.
 * 
 * Rendering:
 * - Processes and displays messages using ChatVideoEmbedding or ChatMessage components.
 * - Structured layout with Header, scrollable message area, and ChatInput field.
 * - Implements conditional rendering for status and loading indicators.
 * 
 * Key Interactions:
 * - ChatInput's onSend: Invokes postMessage service and updates the 'run' state.
 * 
 * Styles:
 * - Uses Tailwind CSS for styling the application layout and components.
 */
import React, {useState} from 'react';
import './App.css';
import Header from "./components/Header";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import ChatVideoEmbedding from "./components/ChatVideoEmbedding";
import ChatStatusIndicator from "./components/ChatStatusIndicator";
import Loading from "./components/Loading";
import { useThread } from './hooks/useThread';
import { useRunPolling } from './hooks/useRunPolling';
import { useRunRequiredActionsProcessing } from './hooks/useRunRequiredActionsProcessing';
import { useRunStatus } from './hooks/useRunStatus';
import {postMessage} from "./services/api";

function App() {
    const [run, setRun] = useState(undefined);
    const { threadId, messages, setActionMessages, clearThread} = useThread(run, setRun);
    useRunPolling(threadId, run, setRun);
    useRunRequiredActionsProcessing(run, setRun, setActionMessages);
    const { status, processing } = useRunStatus(run);

    let messageList = messages
        .toReversed()
        .filter((message) => message.hidden !== true)
        .map((message) => {
            if (message.role === "video_embedding") {
                return <ChatVideoEmbedding
                    url={message.content}
                    key={message.id}
                />
            } else {
                return <ChatMessage
                    message={message.content}
                    role={message.role}
                    key={message.id}
                />
            }
        })

    return (
        <div className="md:container md:mx-auto lg:px-32 h-screen bg-slate-700 flex flex-col">
            <Header
                onNewChat={clearThread}
            />
            <div className="flex flex-col-reverse grow overflow-scroll">
                {status !== undefined && (
                    <ChatStatusIndicator
                        status={status}
                    />
                )}
                {processing && <Loading/>}
                {messageList}
            </div>
            <div className="my-4">
                <ChatInput
                    onSend={(message) => {
                        postMessage(threadId, message).then(setRun);
                    }}
                    disabled={processing}
                />
            </div>
        </div>
    )
}

export default App;
