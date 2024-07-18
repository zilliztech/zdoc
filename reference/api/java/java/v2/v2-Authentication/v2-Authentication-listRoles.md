---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Authentication-listRoles
beta: false
notebook: false
type: docx
token: XIIyd3bMzoAVx3xVsoLcnQ2pnKh
sidebar_position: 9
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listRoles()

This operation lists all custom roles.

```java
public List<String> listRoles()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2 client = new MilvusClientV2(connectConfig);

List<String> roles = client.listRoles();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of strings containing the role names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> roles = client.listRoles();
```

