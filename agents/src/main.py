
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys
import os
from typing import Dict, Any, List, Optional
import uuid

# Add src to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.architecture_mapper import ArchitectureMapperAgent
from api.backend_client import DeFiBackendClient
from workflow.generator import WorkflowGenerator

app = FastAPI(
    title="DeFi Agent API",
    description="An API for converting natural language requests into DeFi workflows and executing them.",
    version="1.0.0",
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    request: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    conversation_id: str
    message: str
    requirements: Optional[Dict[str, Any]] = None
    workflow: Optional[Dict[str, Any]] = None
    executionId: Optional[str] = None
    needs_approval: bool = False
    suggestions: Optional[List[str]] = None

class AppState:
    def __init__(self):
        self.architecture_agent = ArchitectureMapperAgent()
        self.backend_client = DeFiBackendClient()
        self.workflow_generator = WorkflowGenerator()
        # Store conversation contexts
        self.conversations: Dict[str, Dict[str, Any]] = {}

    async def initialize(self):
        await self.architecture_agent.initialize()
        try:
            await self.backend_client.health_check()
        except Exception as e:
            print(f"Warning: Backend health check failed: {e}")
            print("Continuing without backend connection...")

state = AppState()

@app.on_event("startup")
async def startup_event():
    await state.initialize()

@app.post("/process", summary="Process a natural language DeFi request")
async def process_request(user_request: UserRequest) -> ConversationResponse:
    """
    Processes a user's natural language request with conversation context,
    generates workflows, and manages multi-turn interactions.
    """
    try:
        # Get or create conversation context
        conversation_id = user_request.conversation_id or str(uuid.uuid4())
        context = state.conversations.get(conversation_id, {
            "history": [],
            "current_requirements": None,
            "current_workflow": None
        })
        
        # Add user message to history
        context["history"].append({
            "role": "user",
            "content": user_request.request,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Step 1: Analyze user request with conversation context
        requirements = await state.architecture_agent.analyze_request(
            user_request.request, 
            context=context
        )
        
        # Update context with new requirements
        context["current_requirements"] = requirements
        
        # Step 2: Generate workflow based on requirements
        workflow_def = await state.workflow_generator.generate_workflow(requirements)
        context["current_workflow"] = workflow_def
        
        # Save updated context
        state.conversations[conversation_id] = context
        
        # Step 3: Determine if this needs backend execution or just approval
        needs_approval = True  # Always require approval for now
        execution_id = None
        
        # Add assistant response to history
        assistant_message = f"I've analyzed your request and created a {requirements.get('pattern', 'Custom')} workflow with {len(workflow_def.get('nodes', []))} nodes."
        context["history"].append({
            "role": "assistant", 
            "content": assistant_message,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return ConversationResponse(
            conversation_id=conversation_id,
            message=assistant_message,
            requirements=requirements,
            workflow=workflow_def,
            executionId=execution_id,
            needs_approval=needs_approval,
            suggestions=[
                "Approve this workflow to generate the canvas",
                "Ask me to modify specific nodes or features",
                "Request different token combinations"
            ]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/approve-workflow", summary="Approve and execute a workflow")
async def approve_workflow(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Approve a workflow and execute it on the backend.
    """
    try:
        conversation_id = request.get("conversation_id")
        if not conversation_id or conversation_id not in state.conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        context = state.conversations[conversation_id]
        workflow_def = context.get("current_workflow")
        
        if not workflow_def:
            raise HTTPException(status_code=400, detail="No workflow to approve")
        
        # Execute workflow on backend
        try:
            execution_result = await state.backend_client.execute_workflow(workflow_def)
            execution_id = execution_result.get("executionId")
            
            # Update context
            context["execution_id"] = execution_id
            context["status"] = "executing"
            
            return {
                "message": "Workflow approved and execution started",
                "executionId": execution_id,
                "workflow": workflow_def
            }
        except Exception as backend_error:
            # Return workflow for canvas generation even if backend execution fails
            return {
                "message": "Workflow approved for canvas generation (backend execution failed)",
                "workflow": workflow_def,
                "backend_error": str(backend_error)
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/executions/{execution_id}", summary="Get execution status")
async def get_execution_status(execution_id: str) -> Dict[str, Any]:
    """
    Retrieves the status of a specific workflow execution from the backend.
    """
    try:
        status = await state.backend_client.get_execution_status(execution_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
