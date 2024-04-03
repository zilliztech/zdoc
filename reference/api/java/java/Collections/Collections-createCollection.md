---
displayed_sidbar: javaSidebar
slug: /java/Collections-createCollection
beta: false
notebook: false
type: docx
token: QdrtdDRZdo9lCgxQjUHcRCfYnuf
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# createCollection()

This operation creates a collection either with default or customized settings. 

```java
public void createCollection(CreateCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
createCollection(CreateCollectionReq.builder()
    .collectionName(String collectionName)
    .description(String collectionDescription)
    .dimension(int dimension)
    .primaryFieldName(String primaryFieldName)
    .idType(DataType datatype)
    .maxLength(int maxLength)
    .vectorFieldName(String vectorFieldName)
    .metricType(String metricType)
    .autoID(boolean autoID)
    .enableDynamicField(boolean enableDynamicField)
    .numShards(int numShards)
    .collectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .indexParams(List<IndexParam> indexParams)
    .numPartitions(int numPartitions)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of the collection to create.

- `description(String collectionDescription)`

    Description of the collection, default to empty.

- `dimension(int dimension)`

    The dimension of the collection field to hold vector embeddings.

    The value is usually determined by the model you use to generate vector embeddings.

    This is required to set up a collection with default settings. Skip this parameter if you need to set up a collection with a customized schema.

- `primaryFieldName(String primaryFieldName)`

    The name of the primary field in this collection.

    The value defaults to __id__. You can use another name you see fit. Skip this parameter if you need to set up a collection with a customized schema.

- `idType(DataType idType)`

    The data type of the primary field in this collection.

    The value defaults to __DataType.Int64__. Skip this parameter if you need to set up a collection with a customized schema.

    Skip this parameter if you need to set up a collection with a customized schema.

- `maxLength(int maxLength)`

    The maximum number of characters or elements allowed for string or array fields within the collection.

    This parameter is required if __primaryFieldType__ is set to __VarChar__.

    The value defaults to __65535__.

- `vectorFieldName(String vectorFieldName)`

    The name of the collection field to hold vector embeddings.

    The value defaults to __vector__. You can use another name you see fit. Skip this parameter if you need to set up a collection with a customized schema.

- `metricType(String metricType)`

    The algorithm used for this collection to measure similarities between vector embeddings.

    The value defaults to __IP__. Possible values are __L2__, __IP__, and __COSINE__. For details on these metric types, refer to [Similarity Metrics Explained](/docs/search-metrics-explained).

- `autoID(boolean autoID)`

    Whether the primary field automatically increments upon data insertions into this collection.

    The value defaults to __False__. Setting this to __True__ makes the primary field automatically increment. Skip this parameter if you need to set up a collection with a customized schema.

- `enableDynamicField(boolean enableDynamicField)`

    Whether to use a reserved JSON field named __$meta__ to store undefined fields and their values in key-value pairs.

    The value defaults to __True__, indicating that the meta field is used.

    If you create a collection with a schema, configure this parameter using the __[createSchema](./Collections-createSchema)__ method.

- `numShards(int numShards)`

    The number of shards to create along with the collection.

    The value defaults to __1__, indicating that one shard is to be created along with this collection.

    <Admonition type="info" icon="📘" title="What is sharding?">

    <p>Sharding refers to distributing write operations to different nodes to make the most of the parallel computing potential of a Milvus cluster for writing data.</p>
    <p>By default, a collection contains one shard.</p>

    </Admonition>

- `collectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    The schema of this collection.

    Leaving it empty indicates this collection will be created with default settings. To set up a collection with a customized schema, you need to create a __CollectionSchema__ object and reference it here.

- `indexParams(List<IndexParam> indexParams)`

    The parameters for building the index on the vector field in this collection. To set up a collection with a customized schema and automatically load the collection to memory, create an __IndexParams__ object with a list of [IndexParam](./Management-IndexParam) objects and reference it here.

    You should at least add an index for the vector field in this collection. You can also skip this parameter if you prefer to set up the index parameters later on.

- `numPartitions(int numPartitions)`

    The number of partitions. Used when isPartitionKey is set to true in Field Schema. Default is 64.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

### Create a collection{#create-a-collection}

You can choose between a quick setup or a customized setup as follows:

- __Quick setup__

    The quick setup collection has two fields: the primary and vector fields. It also allows the insertion of undefined fields and their values in key-value pairs in a dynamic field.

```java
// quickly create a collection
CreateCollectionReq createCollectionReq = CreateCollectionReq._builder_()
        .collectionName(collectionName)
        .dimension(dim)
        .build();
client.createCollection(createCollectionReq);

```

- __Customized setup with index parameters__

    For a customized setup, create the schema and index parameters beforehand. 

```java
// create a collection with schema, when indexParams is specified, it will create index as well
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
collectionSchema.addField(AddFieldReq._builder_().fieldName("id").dataType(DataType._Int64_).isPrimaryKey(Boolean._TRUE_).autoID(Boolean._FALSE_).description("id").build());
collectionSchema.addField(AddFieldReq._builder_().fieldName("vector").dataType(DataType._FloatVector_).dimension(dim).build());

IndexParam indexParam = IndexParam.builder()
        .fieldName("vector")
        .metricType(IndexParam.MetricType._COSINE_)
        .build();
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(collectionSchema)
        .indexParams(Collections._singletonList_(indexParam))
        .build();
client.createCollection(createCollectionReq);
```
