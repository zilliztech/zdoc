# delete()

Deletes entities from a collection by IDs.

```javascript
delete(
  collection_name,
  ids
)
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).delete({
  collection_name: "my_collection",
  ids: [1, 2, 3, 4],
});
```

Success response:

```javascript
{
   error_code: 'Success', reason: ''
}
```

## Parameters

| Parameter        | Description                                                                                                                                                                       | Type                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `collection_name`   | Name of the collection from which entities are to be deleted.                                                                                                                                               | String               |
| `ids`               | IDs of entities to delete.                                                                                                                                                                          | String[] or Number[] |

## Raises

None

## Returns

None