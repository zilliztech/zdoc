---
slug: /conduct-a-range-search
beta: TRUE
notebook: 11_conduct_a_range_search.ipynb
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Conduct a Range Search

Understanding how to filter your search results by the proximity of entities is crucial in vector operations. A range search serves this exact purpose by narrowing down results according to the distance between a query vector and vectors. This guide will walk you through the process of conducting a range search in Zilliz Cloud, which consists of a vector similarity search followed by distance-based filtering.

:::info Notes

The support for range search is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before conducting a range search, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and inserted data into the collection. For details, see [Use Customized Schema](./create-collection-with-schema).

## Quick steps for a range search{#quick-steps-for-a-range-search}

1. **Load your collection into memory**: Initiate by ensuring your dataset is loaded and ready for search.

1. **Set your search parameters**: Define `radius` and `range_filter` parameters to control your search precision.

1. **Execute the search**: Perform the range search using the parameters set in step 2. We provide examples for **L2 (Euclidean)** and **IP (Inner Product)** distances.

1. **Review your results**: The vectors returned will be within the range you specified, tailored to the distance metrics you have chosen.

:::info Notes

Zilliz Cloud may return fewer results than your set `limit` if not enough vectors meet the specified distance criteria after range filtering.

:::

## Step 1: Load collection{#step-1-load-collection}

Before anything else, make sure the collection is loaded into memory as Zilliz Cloud operates in-memory for search and query functions.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
from pymilvus import Collection

collection = Collection("medium_articles")

collection.load()

# Get loading progress
progress = utility.loading_progress("medium_articles")

print(f"Collection loaded successfully: {progress}")

# Output
# Collection loaded successfully: 100%
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
res = await client.loadCollection({
    collection_name: "medium_articles"
});

console.log(res);

// Output
// { error_code: 'Success', reason: '' }

res = await client.getLoadingProgress({
    collection_name: "medium_articles"
});

console.log(res);

// Output:
// { status: { error_code: 'Success', reason: '' }, progress: '100' }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.LoadCollectionParam;
LoadCollectionParam param = LoadCollectionParam.newBuilder()
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

## Step 2: Configure range filtering{#step-2-configure-range-filtering}

With Zilliz Cloud, a range search is differentiated from a standard [vector search](./search-query-and-get#single-vector-search) by two key parameters:

- `radius`: Determines the threshold of least similarity.

- `range_filter`: Optionally refines the search to vectors within a specific similarity range.

These parameters are of the `FLOAT` type and are pivotal in balancing accuracy and search efficiency.

### Distance metrics influence{#distance-metrics-influence}

- **L2** distance: Filters vectors less distant than `radius`, since smaller L2 distances indicate higher similarity. To exclude the closest vectors from results, set `range_filter` less than `radius`.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # configure search parameters when `metric type` sets to `L2`
    param = {
        "metric_type": "L2", # this value must be the same as that specified during collection creation
        "params": {
            "nprobe": 12,
            "radius": 1.0,
            "range_filter": 0.8
        }
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const param = {
       search_params: {
            "nprobe": 12,
            "radius": 1.0,
            "range_filter": 0.8       
       }
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    params = "{\"nprobe\": 12, \"radius\": 1.0, \"range_filter\": 0.8}"
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    sp := new(entity.IndexAUTOINDEXSearchParam)
    
    sp.AddRadius(1.0)
    sp.AddRangeFilter(0.8)
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    params: {
        radius: 1.0,
        range_filter: 0.8
    }
    ```

    </TabItem>
    </Tabs>

- **IP** distance: Filters vectors more distant than `radius`, since larger IP distances indicate higher similarity. Here, `range_filter` should be greater than `radius` to exclude the most similar vectors.
    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # configure search parameters when `metric type` sets to `IP`
    param = {
        "metric_type": "IP", # this value must be the same as that specified during collection creation
        "params": {
            "nprobe": 12,
            "radius": 0.8,
            "range_filter": 1.0
        }
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const param = {
       search_params: {
            "nprobe": 12,
            "radius": 0.8,
            "range_filter": 1.0       
       }
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    params = "{\"nprobe\": 12, \"radius\": 0.8, \"range_filter\": 1.0}"
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    sp := new(entity.IndexAUTOINDEXSearchParam)
    
    sp.AddRadius(0.8)
    sp.AddRangeFilter(1.0)
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    params: {
        radius: 0.8,
        range_filter: 1.0
    }
    ```

    </TabItem>
    </Tabs>

## Step 3: Execute the range search{#step-3-execute-the-range-search}

For an **L2** distance range search, get vectors within a similarity range of **0.8** to **1.0**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# load the local example dataset
with open('medium_articles_2020_dpr.json') as f:
        data = json.load(f)
        rows = data['rows']

print(rows[:3])

# conduct a range search
result = collection.search(
        data = [data['rows'][0]['title_vector']]
        anns_field = 'title_vector'
        param = param
        limit = 5
        output_fields = ['title','link']
)

print(result)

# output:
# ['["id: 1846, distance: 0.800110399723053, entity: {\'title\': \'Simple VSCode Setup To Develop C++\', \'link\': \'https://medium.com/swlh/simple-vscode-setup-to-develop-c-7830182ee4d8\'}", "id: 2906, distance: 0.8001612424850464, entity: {\'title\': \'Binary cross-entropy and logistic regression\', \'link\': \'https://towardsdatascience.com/binary-cross-entropy-and-logistic-regression-bf7098e75559\'}", "id: 4411, distance: 0.8003649115562439, entity: {\'title\': \'Why Passion Is Not Enough in the Working World — Learn Professionalism Instead\', \'link\': \'https://medium.com/swlh/why-passion-is-not-enough-in-the-working-world-learn-professionalism-instead-d1bdb0acd750\'}", "id: 3503, distance: 0.800433337688446, entity: {\'title\': \'Figma to video prototyping — easy way in 3 steps\', \'link\': \'https://uxdesign.cc/figma-to-video-prototyping-easy-way-in-3-steps-d7ac3770d253\'}", "id: 4397, distance: 0.8004650473594666, entity: {\'title\': \'An Introduction to Survey Research\', \'link\': \'https://medium.com/swlh/an-introduction-to-survey-research-ba9e9fb9ca57\'}"]']
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    output_fields: ['title', 'link'],
    param: param
})

console.log(res)
```

</TabItem>

<TabItem value='java'>

```java
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
# TODO
```

</TabItem>
</Tabs>

To get the distances from all returned vectors to the query vector, call the `distances` property:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
distances = result[0].distances

print(distances)

# output:
# [0.800110399723053, 0.8001612424850464, 0.8003649115562439, 0.800433337688446, 0.8004650473594666]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// TODO
```

</TabItem>

<TabItem value='java'>

```java
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
# TODO
```

</TabItem>
</Tabs>

For an **IP** distance range search, get vectors within a similarity range of **1.0** to **0.8**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# load the local example dataset
with open('medium_articles_2020_dpr.json') as f:
        data = json.load(f)

# conduct a range search
result = collection.search(
    data=[data['rows'][0]['title_vector']],
    anns_field='title_vector',
    param=param,
    limit=5,
    output_fields=['title','link']
)

print(result)

# output:
# ['["id: 3177, distance: 0.8502974510192871, entity: {\'title\': \'Following the Spread of Coronavirus\', \'link\': \'https://towardsdatascience.com/following-the-spread-of-coronavirus-23626940c125\'}", "id: 5607, distance: 0.8195337057113647, entity: {\'title\': \'The Hidden Side Effect of the Coronavirus\', \'link\': \'https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586\'}", "id: 5641, distance: 0.8113720417022705, entity: {\'title\': \'Why The Coronavirus Mortality Rate is Misleading\', \'link\': \'https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6\'}"]']
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json', 'utf8'));

res = await client.search({
    collection_name: "medium_articles_2020",
    vector: data.rows[0].title_vector,
    output_fields: ['title', 'link'],
    param: param
})

console.log(res)
```

</TabItem>

<TabItem value='java'>

```java
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
# TODO
```

</TabItem>
</Tabs>

To get the distances from all returned vectors to the query vector, call the `distances` property:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
distances = result[0].distances

print(distances)

# output:
# [0.8502974510192871, 0.8195337057113647, 0.8113720417022705]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// TODO
```

</TabItem>

<TabItem value='java'>

```java
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
# TODO
```

</TabItem>
</Tabs>

## Takeaways{#takeaways}

Zilliz Cloud returns vectors that fit within the specified range based on your `radius` and `range_filter` settings. Below is a quick reference table summarizing how different distance metrics affect these settings:

|  Metric Type |  Configuration                         |
| ------------ | -------------------------------------- |
|  **L2**      |  `range_filter` <= distance < `radius` |
|  **IP**      |  `radius` < distance <= `range_filter` |

## Related topics{#related-topics}

- [Search, Query, and Get](./search-query-and-get)

- [[Beta] Search and Query with Iterators](./search-and-query-iterators)

- [[Beta] Search and Query with Advanced Expressions](./search-and-query-advanced-expressions)
