---
displayed_sidbar: javaSidebar
slug: /java/Management-describeIndex
beta: false
notebook: false
type: docx
token: MGX2dDWoooZ982x3pcNcbFzcnXb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# describeIndex()

This operation describes a specific index.

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## Request Syntax{#request-syntax}

```java
describeIndex(DescribeIndexReq.builder()
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of an existing collection.

    Setting this to a non-existing collection results in __MilvusException__.

- `fieldName(String fieldName)`

    The name of the field on which the index is created.

- `indexName(String indexName)`

    The name of the index to describe.

    Setting this to a non-existing collection results in __MilvusException__.

__RETURN TYPE: __

_DescribeIndexResp_

__RETURNS:__

A __DescribeIndexResp__ object that contains the details of the specified index.

__PARAMETERS:__

- __indexName__ (String)

    The name of the created index.

- __indexType__ (String)

    The algorithm that is used to build the index. 

    On Zilliz Cloud, the value is always __AUTOINDEX__. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- __metricType__ (String)

    The algorithm that is used to measure similarity between vectors. Possible values are __IP__, __L2__, and __COSINE__.

    This is available only when the specified field is a vector field.

- __fieldName__ (String)

    The name of the field on which the index has been created.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeIndexReq describeIndexReq = DescribeIndexReq._builder_()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
```

