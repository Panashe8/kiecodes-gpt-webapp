#Instructions to run the server
#Start back end server in terminal run : uvicorn main:app --reload --host 0.0.0.0 --port 8000


import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from typing import List, Optional

from fastapi import FastAPI
from openai import AsyncOpenAI
from openai.types.beta.threads.run import RequiredAction, LastError
from openai.types.beta.threads.run_submit_tool_outputs_params import ToolOutput
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

#Fetch frontend URL enviroment varible or use localhost:3000
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000').split(',')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_url,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
,
)
assistant_id = os.getenv('OPENAI_ASSISTANT_ID')
run_finished_states = ["completed", "failed", "cancelled", "expired", "requires_action"]


class RunStatus(BaseModel):
    run_id: str
    thread_id: str
    status: str
    required_action: Optional[RequiredAction]
    last_error: Optional[LastError]


class ThreadMessage(BaseModel):
    content: str
    role: str
    hidden: bool
    id: str
    created_at: int


class Thread(BaseModel):
    messages: List[ThreadMessage]


class CreateMessage(BaseModel):
    content: str


@app.post("/api/new")
async def post_new():
    thread = await client.beta.threads.create()
    await client.beta.threads.messages.create(
        thread_id=thread.id,
        content="Greet the user and tell it about yourself and ask it what it is looking for.",
        role="user",
        metadata={
            "type": "hidden"
        }
    )
    run = await client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id
    )

    return RunStatus(
        run_id=run.id,
        thread_id=thread.id,
        status=run.status,
        required_action=run.required_action,
        last_error=run.last_error
    )

@app.get("/api/threads/{thread_id}/runs/{run_id}")
async def get_run(thread_id: str, run_id: str):
    logging.info(f"Starting to retrieve run for thread_id: {thread_id} and run_id: {run_id}")

    try:
        logging.info("Attempting to call OpenAI API to retrieve run details.")
        run = await client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        logging.info("Successfully retrieved run details from OpenAI API.")

        logging.info("Preparing response object.")
        response = RunStatus(
            run_id=run.id,
            thread_id=thread_id,
            status=run.status,
            required_action=run.required_action,
            last_error=run.last_error
        )
        logging.info("Response object prepared. Sending response.")

        return response

    except Exception as e:
        error_message = f"Error retrieving run: {e}"
        logging.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/api/threads/{thread_id}/runs/{run_id}/tool")
async def post_tool(thread_id: str, run_id: str, tool_outputs: List[ToolOutput]):
    run = await client.beta.threads.runs.submit_tool_outputs(
        run_id=run_id,
        thread_id=thread_id,
        tool_outputs=tool_outputs
    )
    return RunStatus(
        run_id=run.id,
        thread_id=thread_id,
        status=run.status,
        required_action=run.required_action,
        last_error=run.last_error
    )


@app.get("/api/threads/{thread_id}")
async def get_thread(thread_id: str):
    messages = await client.beta.threads.messages.list(
        thread_id=thread_id
    )

    result = [
        ThreadMessage(
            content=message.content[0].text.value,
            role=message.role,
            hidden="type" in message.metadata and message.metadata["type"] == "hidden",
            id=message.id,
            created_at=message.created_at
        )
        for message in messages.data
    ]

    return Thread(
        messages=result,
    )


@app.post("/api/threads/{thread_id}")
async def post_thread(thread_id: str, message: CreateMessage):
    await client.beta.threads.messages.create(
        thread_id=thread_id,
        content=message.content,
        role="user"
    )

    run = await client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )

    return RunStatus(
        run_id=run.id,
        thread_id=thread_id,
        status=run.status,
        required_action=run.required_action,
        last_error=run.last_error
    )
