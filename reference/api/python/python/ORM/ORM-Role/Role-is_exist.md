---
title: "is_exist() | Python | ORM"
slug: /python/python/Role-is_exist
sidebar_label: "is_exist()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether the current role exists. | Python | ORM"
type: docx
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - is_exist()
  - pymilvus26
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# is_exist()

This operation checks whether the current role exists.

## Request Syntax\{#request-syntax}

```python
is_exist()
```

**PARAMETERS:**

N/A

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the current role exists or not

**EXCEPTIONS:**

*None*

## Examples\{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

## Related operations\{#related-operations}

The following operations are related to `is_exist()`:

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

