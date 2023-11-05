# describeCollection()

Describes the details of a collection, including its name, schema, and other relevant information.

```javascript
describeCollection(
  collection_name,
  timeout
)
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).describeCollection({
  collection_name: "my_collection",
});
```

Success response:

```javascript
{
  status: { error_code: 'Success', reason: '' },
  schema: {
    fields: [ {
    type_params: [
      {
        dim: 8
      }
    ],
    index_params: [],
    fieldID: '100',
    name: 'vector_01',
    is_primary_key: false,
    description: 'vector field',
    data_type: 'FloatVector',
    autoID: false
  },
  {
    type_params: [],
    index_params: [],
    fieldID: '101',
    name: 'age',
    is_primary_key: true,
    description: '',
    data_type: 'Int64',
    autoID: true
  } ],
    name: 'my_collection',
    description: '',
    autoID: false
  },
  collectionID: '434827658485039105',
  consistency_level: 'Session',
}
```

## Parameters

| Parameter      | Description                                                                                                                                                                       | Type   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `collection_name` | Name of the collection to describe.                                                                                                                                                   | String |
| `timeout`        | Length of time, in milliseconds, that the Remote Procedure Call (RPC) is allowed to run. If no value is provided, the default is undefined. | Number |

## Raises

None

## Returns

A list of dictionaries.