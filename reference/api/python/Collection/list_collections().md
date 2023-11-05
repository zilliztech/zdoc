# list_collections()

Lists the names of collections.

```python
list_collections()
```

## Examples

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.list_collections()
```

## Parameters

None

## Raises

None

## Returns

A list of dictionaries.