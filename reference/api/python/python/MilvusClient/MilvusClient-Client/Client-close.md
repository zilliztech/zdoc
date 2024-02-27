---
displayed_sidbar: pythonSidebar
slug: /python/Client-close
beta: false
notebook: false
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


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

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Close the client
client.close()
```

