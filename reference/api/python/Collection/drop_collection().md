# drop_collection()

Drops a collection.

```python
drop_collection(collection_name)
```

## Examples

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.drop_collection(collection_name='my-collection')
```

## Parameters

| Parameter          | Description                          | Type     | Required |
|--------------------|--------------------------------------|----------|----------|
| `collection_name` | Name of the collection to drop. | String | True     |

## Raises

None

## Returns

None