---
title: "remove_privileges_from_group() | Python | MilvusClient"
slug: /python/python/Authentication-remove_privileges_from_group
sidebar_label: "remove_privileges_from_group()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes the specified privileges from a group. | Python | MilvusClient"
type: docx
token: Vm7vddGfYo6dYsxJi1Ycjuycnad
sidebar_position: 16
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - remove_privileges_from_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# remove_privileges_from_group()

This operation removes the specified privileges from a group.

## Request Syntax\{#request-syntax}

```python
remove_privileges_from_group(
```

**PARAMETERS:**

- **group_name** (*str*) -

    The name of the target privilege group.

- **privileges** (*List[str]*) -

    The privilages to remove in a list.

- **timeout** (*Optional[float]*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist. This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.remove_privileges_from_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
)
```
