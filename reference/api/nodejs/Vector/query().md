# query()

Queries entities that meet specific criteria in a collection.

> 📘 Note
>
> You must load the collection before searching or querying data.

```javascript
query(
  collection_name,
  output_fields,
  filter,
  partitions_names,
  timeout
)
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).query({
  collection_name: "my_collection",
  filter: "age > 0",
  output_fields: ["age"],
});
```

Success response:

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    { age: '434848878802248081' },
    ...999 more items,
  ]
}
```

## Parameters

| Parameters        | Description                                                                                                                                                                       | Type     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `collection_name`   | Name of the collection to query.                                                                                                                                               | String   |
| `output_fields`     | Vector or scalar fields to return.                                                                                                                                            | String[] |
| `filter`            | Boolean expression to filter data.                                                                                                                                 | String   |
| `partitions_names` | Names of the partitions to query.                                                                                                                             | String[] |
| `timeout`          | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number   |
