---
displayed_sidbar: pythonSidebar
slug: /python/Connections-list_connections
beta: false
notebook: false
token: DyPldeRNXo4nMqxQeE0cMnd2nEf
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# list_connections()

This operation returns a list of all connection names and handler objects.

```python
pymilvus.connections.list_connections()
```

The following operations are related to `list_connections()`:

- `connect()`

- `add_connection()`

- `disconnect()`

- `get_connection_addr()`

- `has_connection()`

- `remove_connection()`

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import connections

connections.list_connections()
```

__PARAMETERS:__

None

__RETURN TYPE:__

_List_

__RETURNS:__

A list of all connection names and handler objects.

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import connections

connections.connect(
    uri='https://in01-**************.aws-us-west-2.vectordb-uat3.zillizcloud.com:19531',
    token='admin:zilliz@123'
)
connections.list_connections()

# Output
# [('default', <pymilvus.client.grpc_handler.GrpcHandler at 0x14713b940>)]
```

