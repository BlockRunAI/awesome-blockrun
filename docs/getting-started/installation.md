# Installation

## Python SDK

### Requirements

- Python 3.8 or higher
- pip or poetry

### Install via pip

```bash
pip install blockrun-llm
```

### Install via poetry

```bash
poetry add blockrun-llm
```

### Dependencies

The Python SDK includes these dependencies:
- `httpx` - HTTP client
- `eth-account` - Ethereum account management
- `python-dotenv` - Environment variable loading

## TypeScript SDK

### Requirements

- Node.js 18 or higher
- npm, pnpm, or yarn

### Install via npm

```bash
npm install @blockrun/llm
```

### Install via pnpm

```bash
pnpm add @blockrun/llm
```

### Install via yarn

```bash
yarn add @blockrun/llm
```

### Dependencies

The TypeScript SDK includes:
- `viem` - Ethereum library for signing

## Verify Installation

**Python:**
```python
from blockrun_llm import LLMClient
print("BlockRun SDK installed successfully!")
```

**TypeScript:**
```typescript
import { LLMClient } from '@blockrun/llm';
console.log("BlockRun SDK installed successfully!");
```

## Environment Setup

Create a `.env` file in your project root:

```bash
BLOCKRUN_WALLET_KEY=0x...your_private_key_here
```

The SDK automatically loads this file using dotenv.
