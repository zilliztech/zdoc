# num_entities()

Counts the number of rows in a collection.

```python
num_entities(
    collection_name,
    timeout
)
```

## Examples

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.num_entities(collection_name='my-collection')
```

## Parameters

| Parameter          | Description                          | Type     | Required |
|--------------------|--------------------------------------|----------|----------|
| `collection_name` | Name of the collection to count rows. | String | True     |
| `timeout` | An optional duration of time in seconds to allow for the RPC. If it is set to None, the client keeps waiting until the server responds or error occurs. | Float | False     |

## Raises

None

## Returns

Number of rows.