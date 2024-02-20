---
displayed_sidbar: pythonSidebar
slug: /python/Management-prepare_index_params
beta: false
notebook: false
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 7
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

__PARAMETERS:__

N/A

__RETURN TYPE:__

_IndexParams_

__RETURNS:__

An __IndexParams__ contains a list of __IndexParam__ objects.

- __IndexParams__

    A list of __IndexParam__ objects.

    ```python
    ├── IndexParams 
    │       └── add_index()
    ```

    It offers the __add_index()__ method to add indexes to the list.

- __IndexParam__

    An object to store information about an index of a specific field.

    ```python
    ├── IndexParam
    │       ├── field_name
    │       ├── index_name
    │       └── index_type
    ```

    - __field_name__ (_str_)

        The name of the target file to apply this object applies.

    - __index_name__ (_str_)

        The name of the index file generated after this object has been applied.

    - __index_type__ (_str_)

        The name of the algorithm used to arrange data in the specific field. 

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.prepare_index_params()
```

