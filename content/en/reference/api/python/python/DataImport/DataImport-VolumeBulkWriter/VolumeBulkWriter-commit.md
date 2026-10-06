---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation persists the buffered data to local files and uploads them to the remote volume configured in the VolumeBulkWriter instance. | Python"
type: docx
token: FfGddUVeSolWXUxHWLoc8c6JnBd
sidebar_position: 2
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# commit()

This operation persists the buffered data to local files and uploads them to the remote volume configured in the VolumeBulkWriter instance.

## Request Syntax\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**PARAMETERS:**

- **_async** (*bool*) -

    The asynchronous flush switch. If True, the flush operation runs in a background thread and the method returns immediately. If False (default), the method blocks until the flush completes.

- **call_back** (*Callable[[List[str]], List[str]]*) -

    An optional callback function invoked after the local files are flushed. In VolumeBulkWriter, this callback is used internally to upload files to the remote volume.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the flush or upload operation fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
writer.commit()
```
