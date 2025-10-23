---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation processes the input data and generates tokenized output. | Python | MilvusClient"
type: docx
token: TWzjdJ61ho613AxKSd7clQt9nrg
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - run_analyzer()
  - pymilvus25
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# run_analyzer()

This operation processes the input data and generates tokenized output.

## Request Syntax{#request-syntax}

```plaintext
run_analyzer(
    texts: Union[str, List[str]],
    analyzer_params: Union[str, Dict, None] = None,
    with_hash: bool = False,
    with_detail: bool = False,
    timeout: Optional[float] = None,
)
```

**PARAMETERS:**

- `texts` (*Union&#91;str, List&#91;str&#93;&#93;*) -

    The input text or a list of texts to be analyzed.

- `analyzer_params` (*Union&#91;str, Dict, None&#93;*) -

    The parameters for the analyzer. If set to `None`, defaults to an empty dictionary.

- `with_hash` (*bool*) -

    Optional flag indicating whether to include hash-based processing.

- `with_detail` (*bool*) -

    Optional flag indicating whether to return detailed analysis output.

- `timeout` (*float* | *None*) -

    The timeout duration for this operation. Setting this to *None* indicates that this operation timeouts when any response or error occurs.

**RETURN TYPE:**

*List&#91;str&#93;, List&#91;List&#91;str&#93;&#93;*

**RETURNS:**

A tuple containing:

- A list of strings representing the primary tokenized output.

- A list of lists of strings representing detailed token information (if detailed output is enabled).

**EXCEPTIONS:**

- `MilvusException` - Raised if any error occurs during this operation.

## Examples{#examples}

```plaintext
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

analyzer_params = {
    "type": "standard", # Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] # Defines a list of common words (stop words) to exclude from tokenization
}

# Sample text to analyze
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# Run analyzer
result = client.run_analyzer(
    text,
    analyzer_params
)

print(result)

# Expected output:
# ['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```
