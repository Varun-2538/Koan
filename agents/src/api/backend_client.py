"""
DeFi Backend API Client

HTTP client for communicating with the TypeScript DeFi Execution Engine backend.
"""

import asyncio
from typing import Dict, Any, Optional
import httpx
import json
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()

@dataclass
class ExecutionStatus:
    """Status information about a workflow execution"""
    execution_id: str
    status: str  # 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    steps: Dict[str, Any]
    stats: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class DeFiBackendClient:
    """
    HTTP client for communicating with the TypeScript DeFi Execution Engine.
    
    Provides methods to execute workflows and monitor their progress.
    """
    
    def __init__(self, base_url: str = "http://localhost:3001"):
        self.base_url = base_url.rstrip('/')
        self.logger = logger.bind(component="BackendClient", base_url=base_url)
        self._client = None
        
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "DeFi-Agent-System/0.1.0"
                }
            )
        return self._client
        
    async def health_check(self) -> Dict[str, Any]:
        """Check if the backend is healthy and ready"""
        self.logger.info("Performing health check")
        
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/api/health")
            response.raise_for_status()
            
            result = response.json()
            self.logger.info("Health check successful", status=result.get('status'))
            return result
            
        except httpx.RequestError as e:
            self.logger.error("Health check failed - connection error", error=str(e))
            raise ConnectionError(f"Cannot connect to backend at {self.base_url}: {e}")
        except httpx.HTTPStatusError as e:
            self.logger.error("Health check failed - HTTP error", status_code=e.response.status_code)
            raise ConnectionError(f"Backend health check failed: {e.response.status_code}")
        except Exception as e:
            self.logger.error("Health check failed - unexpected error", error=str(e))
            raise
            
    async def execute_workflow(self, workflow_definition: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a workflow definition on the backend
        
        Args:
            workflow_definition: The workflow to execute
            
        Returns:
            Execution result with executionId
        """
        self.logger.info("Executing workflow", workflow_id=workflow_definition.get('id'))
        
        # Debug: Log the exact workflow being sent
        import json
        workflow_json = json.dumps(workflow_definition, indent=2)
        self.logger.debug("Sending workflow definition", workflow=workflow_json)
        
        try:
            client = await self._get_client()
            
            # Backend expects { workflow: WorkflowDefinition, context?: ExecutionContext }
            request_body = {
                "workflow": workflow_definition,
                "context": {
                    "environment": "test"
                }
            }
            
            response = await client.post(
                f"{self.base_url}/api/workflows/execute",
                json=request_body
            )
            response.raise_for_status()
            
            result = response.json()
            execution_id = result.get('executionId')
            
            self.logger.info("Workflow execution started", execution_id=execution_id)
            return result
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            self.logger.error("Workflow execution failed", 
                            status_code=e.response.status_code, 
                            error=error_detail,
                            workflow_structure=f"nodes: {len(workflow_definition.get('nodes', []))}, edges: {len(workflow_definition.get('edges', []))}")
            
            # Try to log the exact request being sent for debugging
            self.logger.debug("Failed workflow structure", workflow=workflow_json)
            raise RuntimeError(f"Workflow execution failed: {e.response.status_code} - {error_detail}")
        except Exception as e:
            self.logger.error("Workflow execution error", error=str(e))
            raise
            
    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """
        Get the current status of a workflow execution
        
        Args:
            execution_id: The execution ID to check
            
        Returns:
            Current execution status
        """
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/api/executions/{execution_id}")
            response.raise_for_status()
            
            result = response.json()
            return result
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                self.logger.warning("Execution not found", execution_id=execution_id)
                return {
                    'status': 'not_found',
                    'error': f'Execution {execution_id} not found'
                }
            else:
                self.logger.error("Failed to get execution status", 
                                status_code=e.response.status_code,
                                execution_id=execution_id)
                raise RuntimeError(f"Failed to get execution status: {e.response.status_code}")
        except Exception as e:
            self.logger.error("Error getting execution status", error=str(e))
            raise
            
    async def get_execution_logs(self, execution_id: str) -> Dict[str, Any]:
        """
        Get logs for a workflow execution
        
        Args:
            execution_id: The execution ID
            
        Returns:
            Execution logs
        """
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/api/executions/{execution_id}/logs")
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPStatusError as e:
            self.logger.error("Failed to get execution logs", 
                            status_code=e.response.status_code,
                            execution_id=execution_id)
            return {'logs': [f'Failed to retrieve logs: {e.response.status_code}']}
        except Exception as e:
            self.logger.error("Error getting execution logs", error=str(e))
            return {'logs': [f'Error retrieving logs: {str(e)}']}
            
    async def cancel_execution(self, execution_id: str) -> bool:
        """
        Cancel a running workflow execution
        
        Args:
            execution_id: The execution ID to cancel
            
        Returns:
            True if successfully cancelled
        """
        self.logger.info("Cancelling execution", execution_id=execution_id)
        
        try:
            client = await self._get_client()
            response = await client.post(f"{self.base_url}/api/executions/{execution_id}/cancel")
            response.raise_for_status()
            
            result = response.json()
            success = result.get('success', False)
            
            if success:
                self.logger.info("Execution cancelled successfully", execution_id=execution_id)
            else:
                self.logger.warning("Execution cancellation failed", execution_id=execution_id)
                
            return success
            
        except httpx.HTTPStatusError as e:
            self.logger.error("Failed to cancel execution", 
                            status_code=e.response.status_code,
                            execution_id=execution_id)
            return False
        except Exception as e:
            self.logger.error("Error cancelling execution", error=str(e))
            return False
            
    async def test_oneinch_connection(self) -> Dict[str, Any]:
        """
        Test the 1inch API connection on the backend
        
        Returns:
            Test result
        """
        self.logger.info("Testing 1inch API connection")
        
        test_params = {
            "chainId": "1",
            "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",  # ETH
            "toToken": "0x6B175474E89094C44Da98b954EedeAC495271d0F",    # DAI
            "amount": "1000000000000000000"  # 1 ETH in wei
        }
        
        try:
            client = await self._get_client()
            response = await client.post(
                f"{self.base_url}/api/test/oneinch",
                json=test_params
            )
            response.raise_for_status()
            
            result = response.json()
            self.logger.info("1inch API test successful", result=result)
            return result
            
        except Exception as e:
            self.logger.error("1inch API test failed", error=str(e))
            return {
                'success': False,
                'error': str(e)
            }
            
    async def get_supported_nodes(self) -> Dict[str, Any]:
        """
        Get list of supported node types from the backend
        
        Returns:
            List of supported node types
        """
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/api/nodes")
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            self.logger.error("Failed to get supported nodes", error=str(e))
            # Return fallback list based on what we know from the backend
            return {
                'nodeTypes': [
                    'walletConnector',
                    'tokenSelector', 
                    'oneInchQuote',
                    'oneInchSwap',
                    'priceImpactCalculator',
                    'transactionMonitor',
                    'transactionStatus',
                    'chainSelector',
                    'fusionPlus',
                    'portfolioAPI',
                    'limitOrder',
                    'fusionSwap',
                    'erc20Token'
                ]
            }
            
    async def wait_for_completion(self, execution_id: str, timeout: int = 300, poll_interval: int = 2) -> Dict[str, Any]:
        """
        Wait for a workflow execution to complete
        
        Args:
            execution_id: The execution ID to wait for
            timeout: Maximum time to wait in seconds
            poll_interval: How often to check status in seconds
            
        Returns:
            Final execution status
        """
        self.logger.info("Waiting for execution completion", 
                        execution_id=execution_id, 
                        timeout=timeout)
        
        start_time = asyncio.get_event_loop().time()
        
        while True:
            status = await self.get_execution_status(execution_id)
            
            if status.get('status') in ['completed', 'failed', 'cancelled']:
                self.logger.info("Execution finished", 
                               execution_id=execution_id,
                               final_status=status.get('status'))
                return status
                
            # Check timeout
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                self.logger.warning("Execution wait timeout", 
                                  execution_id=execution_id,
                                  elapsed=elapsed)
                await self.cancel_execution(execution_id)
                raise TimeoutError(f"Execution {execution_id} did not complete within {timeout} seconds")
                
            await asyncio.sleep(poll_interval)
            
    async def close(self):
        """Close the HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None
            
    async def __aenter__(self):
        """Async context manager entry"""
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()