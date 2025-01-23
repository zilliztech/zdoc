---
displayed_sidbar: pythonSidebar
title: "alter_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_field
sidebar_label: "alter_collection_field()"
beta: false
notebook: false
description: "This operation changes the specified collection field parameters. | Python | MilvusClient"
type: docx
token: G2jjdHvbBoko6BxBZj7csemWnFc
sidebar_position: 2
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_field()
  - pymilvus25
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_collection_field()

This operation changes the specified collection field parameters.

## Request Syntax{#request-syntax}

```python
alter_collection_field(
    collection_name: str, 
    field_name: str, 
    field_params: Dict,
    db_name="",
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **field_name** (*str*) -

    The name of the target field.

- **field_params** (*dict*) -

    The field parameters to change. The properties not mentioned remains unchanged. Possible parameters vary with the field type. 

    - **is_primary** (*bool*) -

        Whether the current field is the primary field in a collection.

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>Each collection has only one primary field.</p></li>
        <li><p>A primary field should be of either the <strong>DataType.INT64</strong> type or the <strong>DataType.VARCHAR</strong> type.</p></li>
        </ul>

        </Admonition>

    - **max_length** (*int*) -

        The maximum byte length for strings allowed to be inserted. Note that multibyte characters (e.g., Unicode characters) may occupy more than one byte each, so ensure the byte length of inserted strings does not exceed the specified limit. Value range: [1, 65,535].

        This is mandatory for a **DataType.VARCHAR** field.

    - **element_type** (*str*) -

        The data type of the elements in the field value.

        This is mandatory for a **DataType.ARRAY** field.

    - **max_capacity** (*int*) -

        The number of elements in an Array field value.

        This is mandatory for a **DataType.ARRAY** field.

    - **dim** (*int*) -

        The dimension of the vector embeddings. The value should be an integer greater than 1.

        This is mandatory for a field of the **DataType.FLOAT_VECTOR**, **DataType.BINARY_VECTOR**, **DataType.FLOAT16_VECTOR**, or **DataType.BFLOAT16_VECTOR** type. If you use **DataType.SPARSE_FLOAT_VECTOR**, omit this parameter.

    - **is_partition_key** (*bool*) -

        Whether the current field serves as the partition key. Each collection can have one partition key.

        <Admonition type="info" icon="📘" title="What is the partition key?">

        <p>To facilitate partition-oriented multi-tenancy, you can set a field as the partition key field so that Zilliz Cloud hashes the field values and distributes entities among the specified number of partitions accordingly.</p>
        <p>When retrieving entities, ensure that the partition key field is used in the boolean expression to filter out entities of a specific field value.</p>
        <p>For details, refer to <a href="/docs/use-partition-key">Use Partition Key</a> and <a href="https://milvus.io/docs/multi_tenancy.md">Multi-tenancy</a>.</p>

        </Admonition>

    - **mmap_enabled** (*bool*) -

        Whether Milvus maps the field data into memory instead of fully loading it. For details settings, refer to MMap-enabled Data Storage.

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
field_params = {"max_length": 1500}

client.alter_collection_field(
    collection_name="collection_name", 
    field_name="my_varchar",
    field_params=field_params
)
```

