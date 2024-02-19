---
displayed_sidbar: pythonSidebar
slug: /python/IndexLoadRelease-list_indexes
beta: false
notebook: false
token: ZqmudJWyFonUKGxAxXncYrLZn2e
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# list_indexes()

This operation lists all indexes of a specific collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.list_indexes(
    collection_name: str,
    index_name: Optional[str],
    **kwargs,    
) -> List
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **index_name** (*str*) -

    The name of an existing index. Leaving this unspecified make this operation list all indexes.

**RETURN TYPE:**

*List*

**RETURNS:**

A list of index names.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = Milvus.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="TRIE"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
)

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['_default_idx_101', '_default_idx_100']
```

