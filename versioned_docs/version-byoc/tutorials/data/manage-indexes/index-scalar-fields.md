---
title: "Index Scalar Fields | BYOC"
slug: /index-scalar-fields
sidebar_label: "Index Scalar Fields"
beta: FALSE
notebook: FALSE
description: "On Zilliz Cloud, a scalar index is used to speed up meta filtering by a specific non-vector field value, similar to a traditional database index. This guide will walk you through creating and configuring scalar indexes for fields such as integers, strings, etc. | BYOC"
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Scalar Fields

On Zilliz Cloud, a scalar index is used to speed up meta filtering by a specific non-vector field value, similar to a traditional database index. This guide will walk you through creating and configuring scalar indexes for fields such as integers, strings, etc.

## Auto indexing{#auto-indexing}

To use auto indexing, omit the **index_type** parameter so that Milvus can infer the index type based on the scalar field type. For mappings between scalar data types and default indexing algorithms, refer to [Scalar field indexing algorithms](https://milvus.io/docs/scalar_index.md#Scalar-field-indexing-algorithms).

Example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Auto indexing
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="scalar_1", # Name of the scalar field to be indexed
    # highlight-next-line
    index_type="", # Type of index to be created. For auto indexing, leave it empty or omit this parameter.
    index_name="default_index" # Name of the index to be created
)

client.create_index(
  collection_name="test_scalar_index", # Specify the collection name
  index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

IndexParam indexParamForScalarField = IndexParam.builder()
    .fieldName("scalar_1") // Name of the scalar field to be indexed
    .indexName("default_index") // Name of the index to be created
    // highlight-next-line
    .indexType("") // Type of index to be created. For auto indexing, leave it empty or omit this parameter.
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForVectorField);

CreateIndexReq createIndexReq = CreateIndexReq.builder()
    .collectionName("test_scalar_index") // Specify the collection name
    .indexParams(indexParams)
    .build();

client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
    collection_name: "test_scalar_index", // Specify the collection name
    field_name: "scalar_1", // Name of the scalar field to be indexed
    index_name: "default_index", // Name of the index to be created
    // highlight-next-line
    index_type: "" // Type of index to be created. For auto indexing, leave it empty or omit this parameter.
})
```

</TabItem>
</Tabs>

