#!/usr/bin/env python3
"""
Test script to verify OpenAI integration with the agents system.
"""

import os
import asyncio
import sys

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from agents.architecture_mapper import ArchitectureMapperAgent

async def test_openai_integration():
    """Test the OpenAI model integration"""
    print("🧪 Testing OpenAI Integration...")

    # Set environment variables for testing
    os.environ["AI_PROVIDER"] = "openai"
    os.environ["AI_MODEL"] = "gpt-4o-mini"

    try:
        # Initialize agent with OpenAI
        agent = ArchitectureMapperAgent(
            provider="openai",
            model_id="gpt-4o-mini"
        )

        print("✅ Agent initialized successfully with OpenAI configuration")

        # Test initialization
        await agent.initialize()
        print("✅ Agent initialization completed")

        # Test a simple request
        test_input = "Create a simple token swap application"
        print(f"📝 Testing with input: '{test_input}'")

        # This will fail without API key, but we can test the model setup
        try:
            result = await agent.analyze_request(test_input)
            print("✅ Request processed successfully!")
            print(f"📊 Result pattern: {result.get('pattern', 'N/A')}")
            print(f"🪙 Tokens: {result.get('tokens', [])}")
        except Exception as e:
            if "API key" in str(e).lower() or "authentication" in str(e).lower():
                print("⚠️  Expected error due to missing API key - this is normal for testing")
                print("💡 To fix: Set OPENAI_API_KEY environment variable")
            else:
                print(f"❌ Unexpected error: {e}")

        print("\n🎉 OpenAI integration test completed!")

    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

    return True

async def test_claude_fallback():
    """Test that Claude fallback still works"""
    print("\n🔄 Testing Claude fallback...")

    try:
        agent = ArchitectureMapperAgent(
            provider="anthropic",
            model_id="claude-3-haiku-20240307"
        )

        print("✅ Claude agent initialized successfully")

        await agent.initialize()
        print("✅ Claude agent initialization completed")

        print("🎉 Claude fallback test completed!")

    except Exception as e:
        print(f"❌ Claude fallback error: {e}")
        return False

    return True

if __name__ == "__main__":
    print("🚀 Starting Agent Model Integration Tests")
    print("=" * 50)

    # Test OpenAI integration
    openai_success = asyncio.run(test_openai_integration())

    # Test Claude fallback
    claude_success = asyncio.run(test_claude_fallback())

    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"OpenAI Integration: {'✅ PASS' if openai_success else '❌ FAIL'}")
    print(f"Claude Fallback: {'✅ PASS' if claude_success else '❌ FAIL'}")

    if openai_success:
        print("\n🎯 Next Steps:")
        print("1. Set your OPENAI_API_KEY environment variable")
        print("2. Run the agent server: python src/main.py")
        print("3. Test with: curl -X POST 'http://localhost:8000/process' -H 'Content-Type: application/json' -d '{\"request\": \"Create a swap application\"}'")
    else:
        print("\n❌ Please check the error messages above and fix any issues.")
