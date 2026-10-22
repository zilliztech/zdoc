---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation processes the input data and generates tokenized output. | Python | MilvusClient"
type: docx
token: X7tsd4oAxoqVEvxXRkNc1Exqnif
sidebar_position: 6
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - run_analyzer()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# run_analyzer()

This operation processes the input data and generates tokenized output.

## Request Syntax\{#request-syntax}

```python
run_analyzer(
```

**PARAMETERS:**

- **texts** (*Union[str, List[str]]*) -

    The input text or a list of texts to be analyzed.

- **analyzer_params** (*Union[str, Dict, None]*) -

    The parameters for the analyzer. If set to None, defaults to an empty dictionary.

- **with_hash** (*bool*) -

    An optional p.

- **with_detail** (*bool*) -

    An optional p.

- **collection_name** (*str | None*) -

    The name of the collection on which to run the analyzer.

- **field_name** (*str | None*) -

    The name of the field whose analyzer settings are used to analyze the input text.

- **analyzer_names** (*str | list[str] | None*) -

    The name or a list of names of the built-in analyzers to run.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to *None* indicates that this operation timeouts when any response or error occurs.

**RETURN TYPE:**

*List[str], List[List[str]]*

**RETURNS:**

A tuple containing: - A list of strings representing the primary tokenized output. - A list of lists of strings representing detailed token information (if detailed output is enabled).

**EXCEPTIONS:**

- **MilvusException**

    Raised if any error occurs during this operation. Raised if any error occurs during this operation.

## Examples\{#examples}

```python
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
