# showCollections()

Lists all collections or gets the loading status of collections.

```javascript
showCollections()
```

## Examples

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).showCollections();
```

Success response:

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    {
      name: 'my_collection',
      id: '434826867399720961',
      timestamp: '1658732862090',
      loadedPercentage: undefined
    }
  ]，
  created_timestamps: [ '434826867399720964' ],
  created_utc_timestamps: [ '1658732862090' ],
}
```

## Parameters

None

## Raises

None

## Returns

A list of collections.
