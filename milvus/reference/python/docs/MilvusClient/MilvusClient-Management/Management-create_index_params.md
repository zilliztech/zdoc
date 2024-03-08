---
displayed_sidbar: pythonSidebar
slug: /python/Management-create_index_params
beta: false
notebook: false
type: docx
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 3
---

# create_index_params()

This operation prepares index parameters to build indexes for a specific collection.

<div class="admonition note">

<p><b>notes</b></p>

<p>This is a class method. You should call this method like this: <code>MilvusClient.create_index_params()</code>.</p>

</div>

## Request syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_index_params() -> IndexParams
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

    It offers the __[add_index()](./Management-add_index)__ method to add indexes to the list.

__EXCEPTIONS:__

None

## Examples{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.create_index_params()
```

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

