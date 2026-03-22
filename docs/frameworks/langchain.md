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

### Basic Chain (LCEL)

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = BlockRunLLM(model="anthropic/claude-sonnet-4.6")

prompt = ChatPromptTemplate.from_template("Write a brief explanation of {topic}")
chain = prompt | llm | StrOutputParser()

result = chain.invoke({"topic": "x402 micropayments"})
print(result)
```

### Agent with Tools

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.tools import DuckDuckGoSearchRun

llm = BlockRunLLM(model="openai/gpt-5.4")

tools = [DuckDuckGoSearchRun()]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("human", "{input}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "What's the current price of ETH?"})
print(result["output"])
```

### RAG Pipeline

```python
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

llm = BlockRunLLM(model="anthropic/claude-sonnet-4.6")
embeddings = HuggingFaceEmbeddings()

vectorstore = Chroma(embedding_function=embeddings, persist_directory="./db")
retriever = vectorstore.as_retriever()

prompt = ChatPromptTemplate.from_template(
    "Answer based on context:\n{context}\n\nQuestion: {input}"
)
combine_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, combine_chain)

result = rag_chain.invoke({"input": "How does x402 payment work?"})
print(result["answer"])
```

## Multi-Model Chains

Use different models for different tasks:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

summarizer = BlockRunLLM(model="deepseek/deepseek-chat")
analyzer = BlockRunLLM(model="openai/gpt-5.4")

summary_prompt = ChatPromptTemplate.from_template("Summarize: {document}")
analysis_prompt = ChatPromptTemplate.from_template("Analyze this summary: {text}")

summary_chain = summary_prompt | summarizer | StrOutputParser()
analysis_chain = analysis_prompt | analyzer | StrOutputParser()

summary = summary_chain.invoke({"document": "..."})
analysis = analysis_chain.invoke({"text": summary})
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
