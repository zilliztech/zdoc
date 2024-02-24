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

## Request Syntax{#request-syntax}

```python
list_connections()
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

## Related operations{#related-operations}

The following operations are related to `list_connections()`:

- [add_connection()](./Connections-add_connection)

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [remove_connection()](./Connections-remove_connection)

