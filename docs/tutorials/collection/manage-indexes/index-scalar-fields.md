---
slug: /index-scalar-fields
beta: FALSE
notebook: FALSE
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Scalar Fields

On Zilliz Cloud, a scalar index is used to speed up metafiltering by a specific non-vector field value, similar to a traditional database index. This guide will walk you through creating and configuring scalar indexes for fields such as integers, strings, etc.

## Auto indexing{#auto-indexing}

To use auto indexing, omit the __index_type__ parameter so that Milvus can infer the index type based on the scalar field type. For mappings between scalar data types and default indexing algorithms, refer to [Scalar field indexing algorithms](https://milvus.io/docs/scalar_index.md#Scalar-field-indexing-algorithms).

Example:

```python
# Auto indexing
client = MilvusClient(
    uri="http://localhost:19530"
)

index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="scalar_1", # Name of the scalar field to be indexed
    index_type="", # Type of index to be created. For auto indexing, leave it empty or omit this parameter.
    index_name="default_index" # Name of the index to be created
)

client.create_index(
  collection_name="test_scalar_index", # Specify the collection name
  index_params=index_params
)
```
