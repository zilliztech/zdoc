---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Management-describeIndex
beta: FALSE
notebook: FALSE
type: docx
token: MGX2dDWoooZ982x3pcNcbFzcnXb
sidebar_position: 2
displayed_sidebar: javaSidebar

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

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

    Setting this to a non-existing collection results in **MilvusException**.

- `fieldName(String fieldName)`

    The name of the field on which the index is created.

- `indexName(String indexName)`

    The name of the index to describe.

    Setting this to a non-existing collection results in **MilvusException**.

**RETURN TYPE:** 

*DescribeIndexResp*

**RETURNS:**

A **DescribeIndexResp** object that contains the details of the specified index.

**PARAMETERS:**

- **indexName** (*String*)

    The name of the created index.

- **indexType** (*String*)

    The algorithm that is used to build the index. 

    On Zilliz Cloud, the value is always **AUTOINDEX**. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- **metricType** (*String*)

    The algorithm that is used to measure similarity between vectors. Possible values are **IP**, **L2**, and **COSINE**.

    This is available only when the specified field is a vector field.

- **fieldName** (*String*)

    The name of the field on which the index has been created.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// describe the index for field "vector"
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
// DescribeIndexResp(indexName=test, indexType=AUTOINDEX, metricType=L2, fieldName=vector)
```

