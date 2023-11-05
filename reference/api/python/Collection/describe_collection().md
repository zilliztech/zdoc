# describe_collection()

Describes details on a specific collection.

```python
describe_collection(collection_name)
```

## Examples

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.describe_collection(collection_name='medium_articles')
```

## Parameters

| Parameter          | Description                          | Type     | Required |
|--------------------|--------------------------------------|----------|----------|
| `collection_name` | Name of the collection to describe. | String | True     |

## Raises

`ValueError`: Error if the collection is missing.

## Returns

A list of dictionaries.