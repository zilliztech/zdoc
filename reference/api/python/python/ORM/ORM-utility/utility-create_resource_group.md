---
displayed_sidbar: this.displayedSidebar
slug: /python/python/utility-create_resource_group
beta: FALSE
notebook: FALSE
type: docx
token: X5qsdhFQ5oOhkcxOprzcOZq4nMc
sidebar_position: 4
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_resource_group()

This operation creates a new resource group. 

<Admonition type="info" icon="📘" title="What is a resource group?">

<p>A resource group can hold several or all of the query nodes in a Zilliz Cloud cluster. When you load a collection by calling load(), Zilliz Cloud loads the data of the collection into certain query nodes.</p>
<p>There is a default resource group named <strong>_<em>default</em>resource_group</strong> available in every Zilliz Cloud cluster that holds all its query nodes. </p>
<p>Use <strong>describe<em>resource</em>group()</strong> to check the actual number. If there are multiple query nodes available, consider creating resource groups and distributing the query nodes among them.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
create_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    The name of the resource group to create.

    Setting this to the name of an existing resource group results in a **MilvusException**.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)
```

## Related operations{#related-operations}

The following operations are related to `create_resource_group()`:

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

