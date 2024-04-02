---
slug: /index-vector-fields
beta: FALSE
notebook: FALSE
type: origin
token: Qc0SwFomWiEXvMkDAH9cMAhlnIh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Vector Fields

This guide walks you through the basic operations on creating and managing indexes on vector fields in a collection. 

## Overview{#overview}

Leveraging the metadata stored in an index file, Zilliz Cloud organizes your data in a specialized structure, facilitating rapid retrieval of requested information during searches or queries.

Zilliz Cloud employs [AUTOINDEX](./autoindex-explained) to enable efficient similarity searches. It also offers three [metric types](./search-metrics-explained): __Cosine Similarity__ (COSINE), __Euclidean Distance__ (L2), and __Inner Product__ (IP) to measure the distances between vector embeddings.

It is recommended to create indexes for both the vector field and scalar fields that are frequently accessed.

## Preparations{#preparations}

As explained in [Manage Collections (SDKs)](./manage-collections-sdks), Zilliz Cloud automatically generates an index and loads it into memory when creating a collection if any of the following conditions are specified in the collection creation request:

- The dimensionality of the vector field and the metric type, or

- The schema and the index parameters.

The code snippet below repurposes the existing code to establish a connection to a Zilliz Cloud cluster and create a collection without specifying its index parameters. In this case, the collection lacks an index and remains unloaded.

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create schema
# 2.1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 2.2. Add fields to schema
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create collection
client.create_collection(
    collection_name="customized_setup", 
    schema=schema, 
)
```

## Index a Collection{#index-a-collection}

To create an index for a collection or index a collection, you need to set up the index parameters and call `create_index()`.

```python
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field.
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX""IVF_FLAT",
    index_name="vector_index"
)

# 4.3. Create an index file
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)
```

In the provided code snippet, we have established indexes on the vector field with the index type set to `AUTOINDEX` and metric type set to `COSINE`. Additionally, an index on a scalar field has been created with the index type `AUTOINDEX`. To learn more about the index type and metric types, read [AUTOINDEX Explained](./autoindex-explained) and [Similarity Metrics Explained](./search-metrics-explained).

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, you can create only one index file for each field in a collection.</p>

</Admonition>

## Check Index Details{#check-index-details}

Once you have created an index, you can check its details.

```python
# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)

print(res)

# Output
#
# [
#     "vector_index",
# ]

res = client.describe_index(
    collection_name="customized_setup",
    index_name="vector_index"
)

print(res)

# Output
#
# {
#     "index_type": "AUTOINDEX""IVF_FLAT",
#     "metric_type": "COSINE",
#     "field_name": "vector",
#     "index_name": "vector_index"
# }
```

You can check the index file created on a specific field, and collect the statistics on the number of rows indexed using this index file.

## Drop an Index{#drop-an-index}

You can simply drop an index if it is no longer needed.

```python
# 6. Drop index
client.drop_index(
    collection_name="customized_setup",
    index_name="vector_index"
)
```