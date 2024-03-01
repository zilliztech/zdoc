---
displayed_sidbar: javaSidebar
slug: /java/Collections-createCollection
beta: false
notebook: false
type: docx
token: QdrtdDRZdo9lCgxQjUHcRCfYnuf
sidebar_position: 5
---

# createCollection()

This operation creates a collection either with default or customized settings. 

```java
public void createCollection(CreateCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
createCollection(CreateCollectionReq.builder()
    .autoID(boolean autoID)
    .collectionName(String collectionName)
    .collectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .dimension(int dimension)
    .enableDynamicField(boolean enableDynamicField)
    .indexParams(List<IndexParam> indexParams)
    .maxLength(int maxLength)
    .metricType(String metricType)
    .primaryFieldName(String primaryFieldName)
    .primaryFieldType(DataType primaryFieldType)
    .vectorFieldName(String vectorFieldName)
    .build()
)
```

__BUILDER METHODS:__

- `autoID(boolean autoID)`

    Whether the primary field automatically increments upon data insertions into this collection.

    The value defaults to __False__. Setting this to __True__ makes the primary field automatically increment. Skip this parameter if you need to set up a collection with a customized schema.

- `collectionName(String collectionName)`

    The name of the collection to create.

- `collectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    The schema of this collection.

    Leaving it empty indicates this collection will be created with default settings. To set up a collection with a customized schema, you need to create a __CollectionSchema__ object and reference it here.

- `dimension(int dimension)`

    The dimension of the collection field to hold vector embeddings.

    The value is usually determined by the model you use to generate vector embeddings.

    This is required to set up a collection with default settings. Skip this parameter if you need to set up a collection with a customized schema.

- `enableDynamicField(boolean enableDynamicField)`

    Whether to use a reserved JSON field named __$meta__ to store undefined fields and their values in key-value pairs.

    The value defaults to __True__, indicating that the meta field is used.

    If you create a collection with a schema, configure this parameter using the __[createSchema](./Collections-createSchema)__ method.

- `indexParams(List<IndexParam> indexParams)`

    The parameters for building the index on the vector field in this collection. To set up a collection with a customized schema and automatically load the collection to memory, create an __IndexParams__ object with a list of [IndexParam](./Management-IndexParam) objects and reference it here.

    You should at least add an index for the vector field in this collection. You can also skip this parameter if you prefer to set up the index parameters later on.

- `maxLength(int maxLength)`

    The maximum number of characters or elements allowed for string or array fields within the collection.

    This parameter is required if __primaryFieldType__ is set to __VarChar__.

    The value defaults to __65535__.

- `metricType(String metricType)`

    The algorithm used for this collection to measure similarities between vector embeddings.

    The value defaults to __IP__. Possible values are __L2__, __IP__, and __COSINE__. For details on these metric types, refer to [Similarity Metrics](https://milvus.io/docs/metric.md).

    Skip this parameter if you need to set up a collection with a customized schema.

- `primaryFieldName(String primaryFieldName)`

    The name of the primary field in this collection.

    The value defaults to __id__. You can use another name you see fit. Skip this parameter if you need to set up a collection with a customized schema.

- `primaryFieldType(DataType primaryFieldType)`

    The data type of the primary field in this collection.

    The value defaults to __DataType.Int64__. Skip this parameter if you need to set up a collection with a customized schema.

- `vectorFieldName(String vectorFieldName)`

    The name of the collection field to hold vector embeddings.

    The value defaults to __vector__. You can use another name you see fit. Skip this parameter if you need to set up a collection with a customized schema.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// quickly create a collection
CreateCollectionReq createCollectionReq = CreateCollectionReq._builder_()
        .collectionName(collectionName)
        .dimension(dim)
        .build();
client.createCollection(createCollectionReq);

// create a collection with schema, when indexParams is specified, it will create index as well
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "");
collectionSchema.addPrimaryField("id", DataType._Int64_, Boolean._TRUE_, Boolean._FALSE_);
collectionSchema.addVectorField("vector", DataType._FloatVector_, dim);
collectionSchema.addScalarField("num", DataType._Int32_);

CreateCollectionReq createCollectionReq = CreateCollectionReq._builder_()
        .collectionName(collectionName)
        .collectionSchema(collectionSchema)
        .build();
IndexParam indexParam = IndexParam._builder_()
        .fieldName("vector")
        .metricType(IndexParam.MetricType._COSINE_)
        .build();
CreateCollectionReq createCollectionReq = CreateCollectionReq._builder_()
        .collectionName(collectionName)
        .collectionSchema(collectionSchema)
        .indexParams(Collections._singletonList_(indexParam))
        .build();
client.createCollection(createCollectionReq);
```

