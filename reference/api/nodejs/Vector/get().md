# get()

Gets entities by IDs.

```javascript
get(
  collection_name,
  output_fields,
  ids,
  partitions_names,
  timeout
)
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).get({
  collection_name: "my_collection",
  ids: [1, 2, 3, 4],
  output_fields: ["id"],
});
```

Success response:

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    { id: '434848878802248081' },
    ...999 more items,
  ]
}
```

## Parameters

| Parameter        | Description                                                                                                                                                                       | Type                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `collection_name`   | Name of the collection to search on.                                                                                                                                               | String               |
| `output_fields`     | Vector or scalar fields to return.                                                                                                                                            | String[]             |
| `ids`               | IDs of entities to get.                                                                                                                                                                          | String[] or Number[] |
| `partitions_names` | An array of the names of the partitions to search on.                                                                                                                             | String[]             |
| `timeout`          | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number               |

## Raises

None

## Returns

A list of dictionaries with output fields.