---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationHit` represents one entity returned as a representative hit inside an `AggregationBucket`. PyMilvus creates these objects from the server response; applications do not construct them directly. | Python | MilvusClient"
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

`AggregationHit` represents one entity returned as a representative hit inside an `AggregationBucket`. PyMilvus creates these objects from the server response; applications do not construct them directly.

```python
class pymilvus.AggregationHit
```

## Properties and methods\{#properties-and-methods}

- **pk** (*int | str | None*) -

    The entity primary key.

- **score** (*float*) -

    The vector similarity score or distance returned for the entity.

- **fields** (*dict[str, Any]*) -

    The requested output fields keyed by field name.

- **field_ids()** (*dict[str, int]*) -

    Returns a mapping from each returned field name to its numeric schema field ID.

The `fields` and `field_ids()` mappings are copies. Changing them does not mutate the hit object.

## Example\{#example}

```python
bucket = result.agg_buckets[0][0]

for hit in bucket.hits:
    print(hit.pk)
    print(hit.score)
    print(hit.fields)
    print(hit.field_ids())
```
