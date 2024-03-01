---
displayed_sidbar: javaSidebar
slug: /java/Collections-describeCollection
beta: false
notebook: false
type: docx
token: DTbJdZHWMourJqxOn4rcMWrmn1f
sidebar_position: 9
---

# describeCollection()

This operation lists detailed information about a specific collection.

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
describeCollection(DescribeCollectionReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

    Setting this to a non-existing collection results in __MilvusException__.

__RETURN TYPE:__

_DescribeCollectionResp_

__RETURNS:__

A __DescribeCollectionResp__ object that contains detailed information about the specified collection.

__PARAMETERS:__

- __collection_name__ (_String_)

    The name of the current collection.

- __description__ (_String_)

    The description of the current collection.

- __numOfPartitions__ (_long_)

    The number of partitions in the current collection.

- __fieldNames__ (_List\<String\>_)

    A list of fields in the current collection.

- __vectorFieldName__ (_List\<String\>_)

    The name of the vector field.

- __primaryFieldName__ (_String_)

    The name of the primary field.

- __enableDynamicField__ (_Boolean_)

    Whether to use the reserved JSON field __$meta__ to save non-schema-defined fields and their values as key-value pairs.

- __autoID__ (_Boolean_)

    Whether Milvus automatically generates the primary key for the collection.

- __collectionSchema__ (CreateCollectionReq.CollectionSchema)

    The scheme of the collection.

- __createTime__ (_long_)

    The time when the collection was created.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq._builder_()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);
```
