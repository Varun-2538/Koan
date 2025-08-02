"""
Streamlit logging utilities for agent call tracking
"""

import streamlit as st
from typing import List, Dict, Any
from datetime import datetime

class StreamlitLogger:
    """Logger that integrates with Streamlit session state for real-time logging"""
    
    def __init__(self):
        self.initialize_session_state()
    
    def initialize_session_state(self):
        """Initialize session state for logging"""
        if 'agent_logs' not in st.session_state:
            st.session_state.agent_logs = []
        if 'log_counter' not in st.session_state:
            st.session_state.log_counter = 0
    
    def log(self, message: str, log_type: str = "info", category: str = "agent"):
        """Add a log entry to the session state"""
        log_entry = {
            "message": message,
            "type": log_type,
            "category": category,
            "timestamp": datetime.now().isoformat(),
            "counter": st.session_state.log_counter
        }
        
        st.session_state.agent_logs.append(log_entry)
        st.session_state.log_counter += 1
        
        # Keep only last 50 logs to prevent memory issues
        if len(st.session_state.agent_logs) > 50:
            st.session_state.agent_logs = st.session_state.agent_logs[-50:]
    
    def info(self, message: str, category: str = "agent"):
        """Log an info message"""
        self.log(message, "info", category)
    
    def success(self, message: str, category: str = "agent"):
        """Log a success message"""
        self.log(message, "success", category)
    
    def error(self, message: str, category: str = "agent"):
        """Log an error message"""
        self.log(message, "error", category)
    
    def warning(self, message: str, category: str = "agent"):
        """Log a warning message"""
        self.log(message, "warning", category)
    
    def clear_logs(self):
        """Clear all logs"""
        st.session_state.agent_logs = []
        st.session_state.log_counter = 0
    
    def get_logs(self, category: str = None, log_type: str = None) -> List[Dict[str, Any]]:
        """Get logs with optional filtering"""
        logs = st.session_state.agent_logs
        
        if category:
            logs = [log for log in logs if log.get("category") == category]
        
        if log_type:
            logs = [log for log in logs if log.get("type") == log_type]
        
        return logs
    
    def display_logs(self, container=None, max_logs: int = 10):
        """Display logs in a Streamlit container"""
        if container is None:
            container = st
        
        logs = self.get_logs()
        
        if not logs:
            container.info("No agent activity yet. Submit a request to see the AI in action!")
            return
        
        # Display logs in reverse order (newest first)
        for log_entry in reversed(logs[-max_logs:]):
            log_type = log_entry["type"]
            message = log_entry["message"]
            category = log_entry.get("category", "agent")
            
            # Format message with emoji based on type
            if log_type == "success":
                formatted_message = f"✅ {message}"
                container.success(formatted_message)
            elif log_type == "error":
                formatted_message = f"❌ {message}"
                container.error(formatted_message)
            elif log_type == "warning":
                formatted_message = f"⚠️ {message}"
                container.warning(formatted_message)
            else:
                formatted_message = f"🔄 {message}"
                container.info(formatted_message)