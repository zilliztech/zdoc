---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Hit instance is one document inside an aggregation bucket, carrying its primary key, similarity score, and output fields. | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - AggregationHit
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationHit

A Hit instance is one document inside an aggregation bucket, carrying its primary key, similarity score, and output fields.

**METHODS:**

- `pk`

    The primary key of this document, as an int or a string depending on the primary field type of the collection.

- `score`

    The similarity score of this document within its bucket.

- `fields`

    The output field values of this document, keyed by field_name and filled by the server.

- `field_ids()`

    The numeric identity view of this hit as a map of field_name to field_id for the fields present.

## Examples\{#examples}

```python
for hit in bucket["hits"]:
    print(
        hit["pk"],
        hit["score"],
        hit["fields"],
    )
```
