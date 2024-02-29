---
displayed_sidbar: pythonSidebar
slug: /python/Client-close
beta: false
notebook: false
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
---

# close()

This operation closes the current Milvus client.

## Request syntax{#request-syntax}

```python
close() -> None
```

__PARAMETERS:__

None

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__Exceptions:__

None

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Close the client
client.close()
```

