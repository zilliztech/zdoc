---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A CollectionSchema instance defines a collection schema. | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

A CollectionSchema instance defines a collection schema.

## Request Syntax\{#request-syntax}

```python
__init__(
    raw: Any
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    A list of [FieldSchema](./MilvusClient-FieldSchema) objects that define the collection fields.

- **description** (*string*) -

    The description of the schema. If a description is not provided, it will be set to an empty string.

- **external_source** (*str*) -

    The external source URI, which should be a `volume://` URI that points to an accessible external volume. For example, `volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    The external source specifications, which are a set of secondary parameters:

    - **format** (*str*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    - **snapshot_id** (*str*) -

        The ID of an Iceberg table. This applies only when `format` is `iceberg-table`.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

schema = CollectionSchema(
    fields=[
        FieldSchema(
            name="id",
            dtype=DataType.INT64,
            is_primary=True,
        ),
        FieldSchema(
            name="vector",
            dtype=DataType.FLOAT_VECTOR,
            dim=128,
        ),
    ],
    enable_dynamic_field=True,
)
print(
    schema.auto_id,
    schema.enable_dynamic_field,
)
```
