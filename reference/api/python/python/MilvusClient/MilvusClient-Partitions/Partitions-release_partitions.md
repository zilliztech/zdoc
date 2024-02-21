---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-release_partitions
beta: false
notebook: false
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# release_partitions()

This operation releases the partitions in a specified collection from memory.

## Request syntax{#request-syntax}

```python
release_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __partition_names__ (_str | list[str]_) -

    __[REQUIRED]__

    A list of the names of the partitions to release.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state only if any or all of its partitions are loaded.</p>

</Admonition>

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

## Related methods{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

