#!/usr/bin/env python3
"""
DeFi Agent System - Main Entry Point

A Python agent system that takes natural language input, generates DeFi workflows 
using agno-agi, and executes them by calling the existing TypeScript backend APIs.
"""

import asyncio
import os
from typing import Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.text import Text

from src.agents.architecture_mapper import ArchitectureMapperAgent
from src.api.backend_client import DeFiBackendClient
from src.workflow.generator import WorkflowGenerator

console = Console()

class DeFiAgentSystem:
    """Main orchestrator for the DeFi Agent System"""
    
    def __init__(self):
        self.architecture_agent = ArchitectureMapperAgent()
        self.backend_client = DeFiBackendClient()
        self.workflow_generator = WorkflowGenerator()
        
    async def initialize(self):
        """Initialize all components"""
        console.print(Panel.fit("🚀 Initializing DeFi Agent System", style="bold green"))
        
        # Initialize components
        await self.architecture_agent.initialize()
        await self.backend_client.health_check()
        
        console.print("✅ All systems ready!")
        
    async def process_user_request(self, user_input: str) -> Dict[str, Any]:
        """Process user's natural language request and execute workflow"""
        
        console.print(f"\n🤖 Processing request: [bold]{user_input}[/bold]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            
            # Step 1: AI Agent Analysis
            task1 = progress.add_task("🧠 AI Agent analyzing request...", total=None)
            
            console.print("\n[AGENT CALL] ArchitectureMapper analyzing request...")
            requirements = await self.architecture_agent.analyze_request(user_input)
            
            console.print(f"[AGENT CALL] Detected pattern: {requirements.get('pattern', 'Unknown')}")
            console.print(f"[AGENT CALL] Tokens identified: {', '.join(requirements.get('tokens', []))}")
            if requirements.get('features'):
                console.print(f"[AGENT CALL] Features required: {', '.join(requirements['features'])}")
            
            progress.update(task1, completed=100)
            
            # Step 2: Workflow Generation
            task2 = progress.add_task("📋 Generating workflow definition...", total=None)
            
            console.print("[AGENT CALL] Mapping to backend nodes:")
            workflow_def = await self.workflow_generator.generate_workflow(requirements)
            
            for node in workflow_def.get('nodes', []):
                console.print(f"[AGENT CALL] → {node['type']} ({node.get('data', {}).get('label', 'Unknown')})")
            
            console.print("[AGENT CALL] Building workflow definition...")
            progress.update(task2, completed=100)
            
            # Step 3: Backend Execution
            task3 = progress.add_task("📡 Calling TypeScript backend APIs...", total=None)
            
            console.print(f"\n📡 Calling TypeScript backend APIs...")
            console.print("[API CALL] POST /api/workflows/execute")
            
            execution_result = await self.backend_client.execute_workflow(workflow_def)
            execution_id = execution_result.get('executionId', 'unknown')
            
            console.print(f"[API RESPONSE] Execution started: {execution_id}")
            progress.update(task3, completed=100)
            
            # Step 4: Monitor Execution
            task4 = progress.add_task("🚀 Monitoring workflow execution...", total=None)
            
            console.print(f"\n🚀 Workflow executing on backend...")
            final_result = await self.monitor_execution(execution_id)
            
            progress.update(task4, completed=100)
            
        return {
            'requirements': requirements,
            'workflow': workflow_def,
            'execution': final_result
        }
        
    async def monitor_execution(self, execution_id: str) -> Dict[str, Any]:
        """Monitor workflow execution with real-time updates"""
        
        while True:
            console.print(f"[API CALL] GET /api/executions/{execution_id}")
            status = await self.backend_client.get_execution_status(execution_id)
            
            # Normalise response format
            if not status:
                console.print(f"⚠️ No status available for execution {execution_id}")
                await asyncio.sleep(2)
                continue

            if 'status' in status:  # Old/simple format
                execution_status = status['status']
                steps_info = status.get('steps', {})
                exec_start = status.get('startTime')
                exec_end = status.get('endTime')
            elif 'execution' in status:  # Backend REST format
                exec_obj = status['execution']
                execution_status = exec_obj.get('status', 'unknown')
                steps_info = status.get('steps', {})
                exec_start = exec_obj.get('startTime')
                exec_end = exec_obj.get('endTime')
            else:
                console.print(f"⚠️ Unrecognised status payload: {status}")
                await asyncio.sleep(2)
                continue
            
            if execution_status == 'running':
                # Show progress for each node
                steps = status.get('steps', {})
                if isinstance(steps, dict):
                    for step_id, step in steps.items():
                        step_status = step.get('status', 'unknown')
                        node_type = step.get('nodeType', 'unknown')
                        
                        if step_status == 'running':
                            console.print(f"[BACKEND] ⏳ Executing: {node_type}")
                        elif step_status == 'completed':
                            start_time = step.get('startTime', 0)
                            end_time = step.get('endTime', 0)
                            duration = (end_time - start_time) / 1000 if end_time > start_time else 0
                            console.print(f"[BACKEND] ✅ {node_type} completed ({duration:.1f}s)")
                        elif step_status == 'failed':
                            console.print(f"[BACKEND] ❌ {node_type} failed")
                        
                await asyncio.sleep(1)  # Poll every second
                
            elif execution_status == 'completed':
                console.print(f"\n🎉 Workflow completed successfully!")
                
                # Show final statistics
                total_time = (status.get('endTime', 0) - status.get('startTime', 0)) / 1000
                console.print(f"Architecture: DEX Aggregator Template")
                console.print(f"Total execution time: {total_time:.1f}s")
                
                if status.get('totalGasUsed'):
                    console.print(f"Gas used: {status['totalGasUsed']}")
                
                console.print(f"Generated code available at: http://localhost:3001/api/executions/{execution_id}/code")
                
                return status
                
            elif execution_status == 'failed':
                error_msg = status.get('error', 'Unknown error')
                console.print(f"❌ Workflow execution failed: {error_msg}")
                return status
                
            elif execution_status == 'pending':
                console.print(f"[BACKEND] ⏳ Workflow pending...")
                await asyncio.sleep(1)
                
            else:
                console.print(f"[BACKEND] Status: {execution_status}")
                await asyncio.sleep(0.5)

async def main():
    """Main application entry point"""
    
    # Display welcome banner
    console.print(Panel.fit(
        Text("DeFi Agent System", style="bold blue") + "\n" +
        Text("Natural Language → AI Agents → DeFi Workflows", style="dim")
    ))
    
    system = DeFiAgentSystem()
    
    try:
        await system.initialize()
        
        # Interactive loop
        while True:
            console.print("\n" + "="*60)
            user_input = console.input("\n> Enter your DeFi request (or 'quit' to exit): ")
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                console.print("👋 Goodbye!")
                break
                
            if not user_input.strip():
                continue
                
            try:
                result = await system.process_user_request(user_input)
                
                # Optionally show detailed results
                if console.input("\nShow detailed results? (y/N): ").lower().startswith('y'):
                    console.print("\n📊 Detailed Results:")
                    console.print(result)
                    
            except Exception as e:
                console.print(f"❌ Error processing request: {e}")
                
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!")
    except Exception as e:
        console.print(f"❌ System error: {e}")

if __name__ == "__main__":
    # Example usage
    example_input = "I want to create a swap application for my DeFi protocol that supports ETH, USDC, and WBTC with slippage protection"
    console.print(f"Example input: [italic]{example_input}[/italic]")
    console.print("Starting interactive mode...\n")
    
    asyncio.run(main())
