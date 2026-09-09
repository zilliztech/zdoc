---
title: "Primary-Key Search | BYOC"
slug: /primary-key-search
sidebar_label: "Primary-Key Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "When conducting similarity searches, you are always asked to provide one or more query vectors, even if the query vectors are already present in the target collection. To avoid retrieving vectors before the search, you can use primary keys instead. | BYOC"
type: origin
token: U7OvwHP3AiUWlckzIEKclLQQnPr
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Primary-Key Search

When conducting similarity searches, you are always asked to provide one or more query vectors, even if the query vectors are already present in the target collection. To avoid retrieving vectors before the search, you can use primary keys instead.

## Overview\{#overview}

On e-commerce platforms, users can enter a keyword to retrieve products that match it. Once the user views a product detail page, the platform will also display a list of similar products at the bottom of the page for users who want to compare them.

The recommendations are sorted by their similarity to the keyword or the current product. To achieve this, platform developers need to retrieve the vector representation of the keyword or the current product from Milvus before the actual similarity search, which increases the round-trip between the platform and Milvus and results in a large number of high-dimensional floats being transmitted across the network.

To simplify the interaction logic between your applications and Milvus, reduce the number of round-trips, and avoid transmitting large amounts of high-dimensional floating-point values across the network, consider using primary key searches.

In a primary key search, you do not need to provide any query vectors. Instead, you are asked to provide the primary keys (`ids`) of the entities that contain the query vectors. 

## Limits & restrictions\{#limits-and-restrictions}

- Searches using primary keys apply to all vector data types, except sparse vector fields derived from VarChar fields, as in BM25 functions.

- You can use primary keys instead of query vectors in filtered, range, and grouping searches, optionally with pagination enabled. However, this feature does not apply to hybrid searches and search iterators.

- For similarity searches involving embedding lists, you still need to retrieve the query vectors, arrange them into embedding lists, and run the searches.

- For any nonexistent primary keys or those in an incorrect format, Milvus will prompt errors.

- Primary keys and query vectors are mutually exclusive. Providing both also results in errors.

## Examples\{#examples}

The following examples assume that all provided Int64 IDs are available in the target collection.

<Admonition type="info" icon="📘" title="Notes">

The primary keys are not used for filtering; they are used only for vector retrieval.

</Admonition>

### Example 1: Basic primary-key search\{#example-1-basic-primary-key-search}

To conduct a basic primary-key search, simply replace the query vectors with primary keys.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.search(
    collection_name="my_collection",
    anns_field="vector",
    # highlight-start
    ids=[551, 296, 43], # a list of primary keys
    # highlight-end
    limit=3
)

for hits in res:
    for hit in hits:
        print(hit)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.response.SearchResp

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
        
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("vector")
        .ids(ids)
        .limit(3)
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

const res = await client.search({
    collection_name: "my_collection",
    anns_field: "vector",
    // highlight-start
    ids: [551, 296, 43], // a list of primary keys
    // highlight-end
    limit: 3,
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43}) // a list of primary keys
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,             // limit
    ids,
).WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3
  }' \
  --output json
```

</TabItem>
</Tabs>

### Example 2: Filtered search using primary keys\{#example-2-filtered-search-using-primary-keys}

The following example assumes that `color` and `likes` are two schema-defined fields in the target collection. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43], #
    filter='color like "red%" and likes > 50',
    output_fields=["color", "likes"],
    # highlight-end
    limit=3,
)
```

</TabItem>

<TabItem value='java'>

```java
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .filter("color like \"red%\" and likes > 50")
        .limit(3)
        .outputFields(Arrays.asList("color", "likes"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    filter: 'color like "red%" and likes > 50',
    output_fields: ["id", "color", "likes"],
    // highlight-end
    limit: 3,
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithFilter(`color like "red%" and likes > 50`).
    WithOutputFields("color", "likes"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("color: ", resultSet.GetColumn("color"))
    fmt.Println("likes: ", resultSet.GetColumn("likes"))
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "filter": "color like \"red%\" and likes > 50",
    "outputFields": ["color", "likes"],
    "limit": 3
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "filter": "color like \\"red%\\" and likes > 50",
    "outputFields": ["color", "likes"],
    "limit": 3
  }' \
  --output json
```

</TabItem>
</Tabs>

### Example 3: Range search using primary keys\{#example-3-range-search-using-primary-keys}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43],
    # highlight-end
    limit=3,
    search_params={
        # highlight-start
        "params": {
            "radius": 0.4,
            "range_filter": 0.6
        }
        # highlight-end
    }
)
```

</TabItem>

<TabItem value='java'>

```java
ap<String, Object> params = new HashMap<>();
params.put("radius", "0.4");
params.put("range_filter", "0.6");

List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .limit(3)
        .searchParams(params)
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    params: {
        // highlight-start
        radius: 0.4,
        range_filter: 0.6,
        // highlight-end
    },
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
annParam := index.NewCustomAnnParam()
// highlight-start
annParam.WithRadius(0.4)
annParam.WithRangeFilter(0.6)
// highlight-end

// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithANNSField("vector").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "searchParams": {
      "params": {
        "radius": 0.4,
        "range_filter": 0.6
      }
    }
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "searchParams": {
      "params": {
        "radius": 0.4,
        "range_filter": 0.6
      }
    }
  }' \
  --output json
```

</TabItem>
</Tabs>

### Example 4: Grouping search using primary keys\{#example-4-grouping-search-using-primary-keys}

The following example assumes `docId` is a schema-defined fields in the target collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43],
    # highlight-end
    limit=3,
    group_by_field="docId",
    output_fields=["docId"]
)
```

</TabItem>

<TabItem value='java'>

```java
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .limit(3)
        .groupByFieldName("docId")
        .outputFields(Collections.singletonList("docId"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    group_by_field: "docId",
    output_fields: ["id", "docId"],
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithGroupByField("docId").
    WithOutputFields("docId"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("docId: ", resultSet.GetColumn("docId"))
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "groupingField": "docId",
    "outputFields": ["docId"]
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "groupingField": "docId",
    "outputFields": ["docId"]
  }' \
  --output json
```

</TabItem>
</Tabs>

