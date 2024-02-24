---
displayed_sidbar: pythonSidebar
slug: /python/PyMilvusLegacy-Role
beta: false
notebook: false
token: O8YAfe5P0lZ0TZdUOqNcDHEunCe
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# Role

A __Role__ instance represents a role with specific privileges to access your .

```python
class pymilvus.Role
```

## Constructor{#constructor}

Constructs a role by name and other parameters.

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>Calling the constructor alone does not create the role. You have to explicitly call the <code>create()</code> method of the role object to create the role.</p>

</Admonition>

__PARAMETERS:__

- __name__ (_string_) - 

    __[REQUIRED]__

    The name of the role to create.

- __using__ (_string_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

__RETURN TYPE:__

_Role_

__RETURNS:__

A role object.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## Methods{#methods}

The following are the methods of the `Role` class:



import DocCardList from '@theme/DocCardList';

<DocCardList />