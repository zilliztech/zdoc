# dropCollection()

Drops a collection, including all data in the collection.

```javascript
dropCollection(
  collection_name,
  timeout
)
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).dropCollection({
  collection_name: "my_collection",
});
```

Success response:

```javascript
// dropCollection returns
{ error_code: 'Success', reason: '' }
```

## Parameters

| Parameter      | Description                                                                                                                                                                       | Type   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `collection_name` | Name of the collection to drop.                                                                                                                                                    | String |
| `timeout`        | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number |

## Raises

None

## Returns

None