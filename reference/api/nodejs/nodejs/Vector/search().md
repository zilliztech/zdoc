# search()

Performs Approximate Nearest Neighbor (ANN) searches based on one or more vectors in a collection.

```javascript
search(
  collection_name,
  vector, // or `vectors`
  limit, // or `topk`
  offset,
  output_fields,
  partitions_names,
  metric_type,
  filter, // or `expr`
  params,
  timeout
)
```

## Examples

```javascript
import { MilvusClient, DataType, MetricType } from "@zilliz/milvus2-sdk-node";

// simple search example
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vector: [1, 2, 3, 4],
});

// complex search example
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vector: [1, 2, 3, 4],
  filter: "count > 5",
  limit: 10,
  offset: 2,
  metric_type: MetricType.L2,
  param: { nprobe: 1024 },
});

// batch search example
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vectors: [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ],
});
```

Success response:

```javascript
// search returns
{
  status: { error_code: 'Success', reason: '' },
  results: [
    { score: 22, age: '434848878802251176' },
    { score: 22, age: '434848878802251181' },
    { score: 23, age: '434848878802251173' },
    { score: 25, age: '434848878802251179' }
  ]
}
```

## Parameters since Node SDK v2.2.7

| Parameter          | Description                                                                                                                                                                       | Type                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `collection_name`     | Name of the collection to search.                                                                                                                                               | String                 |
| `vector` or `vectors` |Vectors to search with.                                                                                                                                                       | Number[] or Number[][] |
| `limit` or `topk`     | Number of nearest records to return. Default value: **10**.                                                                                                                                                              | Number                 |
| `offset`             | Number of entities to skip in the search results. Default value: **0**.                                                                                                                                                             | Number                 |
| `output_fields`      | Vector or scalar fields to return. By default, all fields in the collection are returned.                                                                                   | String[]               |
| `partitions_names`   | Names of the partitions to search.                                                                                                                              | String[]               |
| `metric_type`        | Metric type to calculate distance with. Default value: **L2**.                                                                                                                                         | String                 |
| `filter` or `expr`    | Boolean expression to filter data.                                                                                                                                             | String                 |
| `params`             | Optional search parameters.                                                                                                    | Object                 |
| `timeout`            | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number                 |

## SearchParam

SearchParam is a JSON string, consisting of key-value pairs. For more information, see https://milvus.io/docs/index.md.

```javascript
JSON.stringify({ nprobe: 1024 });
```

## Raises

None

## Returns

A list of dictionaries.