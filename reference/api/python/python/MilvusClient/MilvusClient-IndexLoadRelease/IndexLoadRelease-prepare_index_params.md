---
displayed_sidbar: pythonSidebar
slug: /python/IndexLoadRelease-prepare_index_params
beta: false
notebook: false
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# prepare_index_params()

This operation prepares index parameters build indexes for a specific collection.

<Admonition type="info" icon="📘" title="Notes">

<p>This is a class method. You should call this method like this: <code>MilvusClient.prepare_index_params()</code>.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.prepare_index_params() -> IndexParams
```

**PARAMETERS:**

N/A

**RETURN TYPE:**

*IndexParams*

**RETURNS:**

An **IndexParams** contains a list of **IndexParam** objects.

- **IndexParams**

    A list of **IndexParam** objects.

    ```python
    ├── IndexParams 
    │       └── add_index()
    ```

    It offers the **add_index()** method to add indexes to the list.

- **IndexParam**

    An object to store information about an index of a specific field.

    ```python
    ├── IndexParam
    │       ├── field_name
    │       ├── index_name
    │       └── index_type
    ```

    - **field_name** (*str*)

        The name of the target file to apply this object applies.

    - **index_name** (*str*)

        The name of the index file generated after this object has been applied.

    - **index_type** (*str*)

        The name of the algorithm used to arrange data in the specific field. 

**EXCEPTIONS:**

None

## Examples{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.prepare_index_params()
```

