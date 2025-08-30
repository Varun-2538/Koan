
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
import os
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
        # Initialize agent with environment variables
        provider = os.getenv("AI_PROVIDER", "openai")
        model_id = os.getenv("AI_MODEL", "gpt-4o-mini")

        self.architecture_agent = ArchitectureMapperAgent(
            provider=provider,
            model_id=model_id
        )
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
    
    def _generate_conversational_response(self, user_input: str, context: Dict[str, Any]) -> str:
        """Generate appropriate conversational responses for non-DeFi inputs"""
        input_lower = user_input.lower().strip()
        
        # Greeting responses
        if any(greeting in input_lower for greeting in ['hello', 'hi', 'hey']):
            return "Hello! 👋 I'm your DeFi workflow assistant. I can help you build DeFi applications like swap interfaces, limit order systems, or portfolio dashboards. What would you like to create?"
        
        # Help requests
        elif any(help_word in input_lower for help_word in ['help', 'what can you do', 'what is this']):
            return ("I can help you create DeFi applications! Here's what I can do:\n\n"
                   "🔄 **Swap Applications** - Token swapping with 1inch integration\n"
                   "📋 **Limit Order Systems** - Advanced trading with limit orders\n"
                   "💼 **Portfolio Dashboards** - Track and analyze your DeFi positions\n"
                   "🌉 **Cross-Chain Bridges** - Move assets between blockchains\n\n"
                   "Just describe what you want to build in natural language!")
        
        # Thank you responses
        elif any(thanks in input_lower for thanks in ['thank', 'thanks']):
            return "You're welcome! 😊 Feel free to ask me to create any DeFi application you have in mind."
        
        # Goodbye responses
        elif any(bye in input_lower for bye in ['bye', 'goodbye', 'see you']):
            return "Goodbye! 👋 Come back anytime when you want to build something awesome in DeFi!"
        
        # General conversational
        else:
            return ("I'm here to help you build DeFi applications! 🚀\n\n"
                   "Try asking me something like:\n"
                   "• 'Create a swap application for ETH and USDC'\n"
                   "• 'Build a limit order system'\n"
                   "• 'Make a portfolio tracker'\n\n"
                   "What would you like to build?")
    
    def _is_defi_request(self, user_input: str, requirements: Dict[str, Any]) -> bool:
        """Secondary validation to ensure we don't create workflows for conversational inputs"""
        input_lower = user_input.lower().strip()
        
        # Strong indicators this is NOT a DeFi request
        non_defi_indicators = [
            'how was your day', 'how\'s your day', 'how are you', 'what\'s up',
            'how\'s it going', 'tell me about', 'what time is it', 'how\'s the weather',
            'tell me a joke', 'i\'m bored', 'nothing much', 'random', 'whatever'
        ]
        
        if any(indicator in input_lower for indicator in non_defi_indicators):
            return False
        
        # Must have DeFi keywords AND action intent to be a valid DeFi request
        defi_keywords = ['swap', 'trade', 'token', 'limit', 'order', 'bridge', 'portfolio', 'wallet', 'defi', 'chain']
        action_keywords = ['create', 'build', 'make', 'develop', 'generate', 'implement']
        
        has_defi_keyword = any(keyword in input_lower for keyword in defi_keywords)
        has_action_keyword = any(keyword in input_lower for keyword in action_keywords)
        
        # If it doesn't have both DeFi context AND action intent, it's probably conversational
        if not (has_defi_keyword and has_action_keyword):
            # Special case: if requirements somehow detected a pattern other than conversational
            # but input lacks clear DeFi intent, force it to conversational
            pattern = requirements.get('pattern', '').lower()
            if pattern != 'conversational' and not has_defi_keyword:
                return False
                
        # "develop a token bridge" should work - it has both 'token' and 'bridge' (DeFi) + 'develop' (action)
        if has_defi_keyword and has_action_keyword:
            return True
        
        return True

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
        
        # Secondary validation: Double-check for conversational inputs that might have slipped through
        if not state._is_defi_request(user_request.request, requirements):
            requirements['pattern'] = 'conversational'
            requirements['suggested_nodes'] = []
        
        # Update context with new requirements
        context["current_requirements"] = requirements
        
        # Check if this is a conversational response (not a DeFi workflow request)
        if requirements.get('pattern') == 'conversational':
            # Handle conversational interactions
            conversational_response = state._generate_conversational_response(user_request.request, context)
            context["history"].append({
                "role": "assistant",
                "content": conversational_response,
                "timestamp": asyncio.get_event_loop().time()
            })
            
            # Save updated context
            state.conversations[conversation_id] = context
            
            return ConversationResponse(
                conversation_id=conversation_id,
                message=conversational_response,
                requirements=requirements,
                workflow=None,
                executionId=None,
                needs_approval=False,
                suggestions=[
                    "Try: 'Create a swap application'",
                    "Try: 'Build a limit order system'", 
                    "Try: 'Make a portfolio dashboard'"
                ]
            )
        
        # Step 2: Generate workflow based on requirements (only for DeFi requests)
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
