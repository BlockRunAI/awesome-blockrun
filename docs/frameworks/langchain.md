# LangChain Integration

Use BlockRun as an LLM provider in LangChain.

[LangChain](https://github.com/langchain-ai/langchain) is the most popular framework for building LLM applications. BlockRun provides a custom LLM class that handles x402 payments automatically.

## Status

**Planned** — Official LangChain integration is in development.

For now, use the BlockRun SDK directly alongside LangChain, or use the custom provider below.

## Installation

```bash
pip install langchain blockrun-llm
```

## Custom LLM Provider

```python
from typing import Any, List, Optional
from langchain.llms.base import LLM
from blockrun_llm import LLMClient

class BlockRunLLM(LLM):
    """BlockRun LLM provider for LangChain."""

    model: str = "openai/gpt-4o"
    client: Any = None

    def __init__(self, model: str = "openai/gpt-4o", **kwargs):
        super().__init__(**kwargs)
        self.model = model
        self.client = LLMClient()

    @property
    def _llm_type(self) -> str:
        return "blockrun"

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> str:
        response = self.client.chat(self.model, prompt)
        return response

# Usage
llm = BlockRunLLM(model="openai/gpt-4o")
```

## Usage Examples

### Basic Chain

```python
from langchain import LLMChain, PromptTemplate

llm = BlockRunLLM(model="openai/gpt-4o")

prompt = PromptTemplate(
    input_variables=["topic"],
    template="Write a brief explanation of {topic}"
)

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run("x402 micropayments")
```

### Agent with Tools

```python
from langchain.agents import initialize_agent, Tool
from langchain.tools import DuckDuckGoSearchRun

llm = BlockRunLLM(model="openai/gpt-4o")

tools = [
    Tool(
        name="Search",
        func=DuckDuckGoSearchRun().run,
        description="Search the web"
    )
]

agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)

agent.run("What's the current price of ETH?")
```

### RAG Pipeline

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

llm = BlockRunLLM(model="openai/gpt-4o")

# Your document retrieval setup
vectorstore = Chroma(...)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

result = qa_chain.run("How does x402 payment work?")
```

## Multi-Model Chains

Use different models for different tasks:

```python
# Cheap model for summarization
summarizer = BlockRunLLM(model="deepseek/deepseek-v3")

# Premium model for analysis
analyzer = BlockRunLLM(model="openai/gpt-4o")

# Chain them together
from langchain import SequentialChain

summary_chain = LLMChain(llm=summarizer, prompt=summary_prompt)
analysis_chain = LLMChain(llm=analyzer, prompt=analysis_prompt)

full_chain = SequentialChain(
    chains=[summary_chain, analysis_chain],
    input_variables=["document"],
    output_variables=["analysis"]
)
```

## Cost Optimization

```python
# Use model routing based on task complexity
def get_model_for_task(task_type: str) -> str:
    if task_type == "simple":
        return "deepseek/deepseek-v3"  # $0.14/M tokens
    elif task_type == "complex":
        return "openai/gpt-4o"  # $2.50/M tokens
    elif task_type == "reasoning":
        return "openai/o1"  # $15/M tokens
    return "openai/gpt-4o"

# Dynamic model selection
llm = BlockRunLLM(model=get_model_for_task("simple"))
```

## Async Support

```python
import asyncio

class AsyncBlockRunLLM(BlockRunLLM):
    async def _acall(self, prompt: str, **kwargs) -> str:
        # BlockRun SDK supports async
        response = await self.client.achat(self.model, prompt)
        return response

# Usage
async def main():
    llm = AsyncBlockRunLLM()
    result = await llm.agenerate(["Hello!"])
    print(result)

asyncio.run(main())
```

## Wallet Setup

BlockRun LLM uses your configured wallet:

```bash
export BLOCKRUN_WALLET_KEY=0x...
```

Or create programmatically:

```python
from blockrun_llm import LLMClient

client = LLMClient()  # Auto-creates wallet
print(f"Fund this address: {client.get_address()}")
```

See [Wallet Setup](../getting-started/wallet-setup.md).

## Pricing

Same as BlockRun API: provider cost + 5%.

| Model | Cost |
|-------|------|
| GPT-4o | $2.63/$10.50 per 1M tokens |
| DeepSeek V3 | $0.15/$0.29 per 1M tokens |
| Claude Sonnet | $3.15/$15.75 per 1M tokens |

See [Intelligence Pricing](../products/intelligence/pricing.md).

## Links

- [LangChain Documentation](https://python.langchain.com)
- [BlockRun Python SDK](../sdks/python.md)
- [Agent Developer Guide](../getting-started/agent-developers.md)
