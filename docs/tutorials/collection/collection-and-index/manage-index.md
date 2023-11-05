---
slug: /manage-index
beta: FALSE
notebook: 01_use_customized_schema.ipynb
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Index

Utilize vector indexes as metadata structures in Zilliz Cloud to enhance vector similarity search performance. An index must be created prior to performing ANN searches on a Zilliz Cloud cluster.

## Before you start{#before-you-start}

Ensure you have created a collection. For details, refer to [Create Collection](./create-collection-2) and [Create Collection with Schema](./create-collection-with-schema).

## Index collection{#index-collection}

For optimal ANN search performance in Zilliz Cloud, indexing is imperative. Note that Zilliz Cloud permits indexing solely on the vector field. Thus, indexing a collection inherently means indexing its vector field and generating an index file.

Zilliz Cloud currently supports the AUTOINDEX type exclusively. If any other index type is selected, the system will default to AUTOINDEX. Further details on this can be found in [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 5. Create index

# Your collection is loaded already.

index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {"nlist": 128}
}

# This is the index parameter set used in the request to create a collection.
# You do not need to create the index file manually. 
# Zilliz Cloud automatically creates and loads an index file 
# upon creating your collection.

```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Create index

// You should include the following in the async function declaration

index_param = {
    index_type: "AUTOINDEX",
    metric_type: "L2",
    params: {}
}

res = await client.createIndex({
    collection_name,
    field_name: "vector",
    index_param
});

console.log(res);

// Output:
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
// 5. Create index

// You should include the following in the main function.

CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
    .withCollectionName("medium_articles")
    .withFieldName("vector")
    .withIndexName("vector_index")
    .withIndexType(IndexType.AUTOINDEX)
    .withMetricType(MetricType.L2)
    .build();

R<RpcStatus> res = client.createIndex(createIndexParam);

if (res.getException() != null) {
    System.out.println("Failed to create index: " + res.getException().getMessage());
    return;
}

System.out.println("Index created!");
```

</TabItem>

<TabItem value='go'>

```go
// 5. Create index

// You should include the following in the main function.

index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

if err != nil {
        log.Fatal("Failed to prepare the index:", err.Error())
}

println(index.Name())

err = conn.CreateIndex(context.Background(), "medium_articles", "title_vector", index, false)

if err != nil {
        log.Fatal("Failed to create the index:", err.Error())
}
```

</TabItem>
</Tabs>

## Load index{#load-index}

Before conducting any searches or queries within a collection, the index file associated with that collection must be loaded into memory.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. Load collection

# Your collection is loaded already.

# This is the index parameter set used in the request to create a collection.
# You do not need to create the index file manually. 
# Zilliz Cloud automatically creates and loads an index file 
# upon creating your collection.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Load collection

// You should include the following in the async function declaration

res = await client.loadCollection({
    collection_name
});

console.log(res);

// Output
// { error_code: 'Success', reason: '' }

res = await client.getLoadingProgress({
    collection_name
});

console.log(res);

// Output:
// { status: { error_code: 'Success', reason: '' }, progress: '0' }
```

</TabItem>

<TabItem value='java'>

```java
// 6. Load collection

// You should include the following in the main function

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

// Get loading progress
GetLoadingProgressParam getLoadingProgressParam = GetLoadingProgressParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<GetLoadingProgressResponse> getLoadingProgressRes = client.getLoadingProgress(getLoadingProgressParam);

System.out.println("Loading progress: " + getLoadingProgressRes.getData().getProgress());

// Output:
// Loading progress: 100
```

</TabItem>

<TabItem value='go'>

```go
// 6. Load collection

// You should include the following in the main function

loadCollErr := conn.LoadCollection(context.Background(), "medium_articles", false)

if loadCollErr != nil {
        log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// Load progress
progress, err := conn.GetLoadingProgress(context.Background(), "medium_articles", nil)

if err != nil {
        log.Fatal("Failed to get loading progress:", err.Error())
}

println("Loading progress:", progress)
```

</TabItem>
</Tabs>

## Release index{#release-index}

You can also release the index file if the collections are not needed temporarily.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# You can go to the Zilliz Cloud console to release the index, instead.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

res = await client.releaseCollection({
    collection_name
});

console.log(res);

// Output
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
ReleaseCollectionParam releaseCollectionParam = ReleaseCollectionParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<RpcStatus> releaseCollectionRes = client.releaseCollection(releaseCollectionParam);
```

</TabItem>

<TabItem value='go'>

```go
releaseCollErr := conn.ReleaseCollection(context.Background(), "medium_articles")

if releaseCollErr != nil {
        log.Fatal("Failed to release collection:", releaseCollErr.Error())
}
```

</TabItem>
</Tabs>

