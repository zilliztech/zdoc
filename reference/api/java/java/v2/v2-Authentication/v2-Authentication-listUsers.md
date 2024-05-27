---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Authentication-listUsers
beta: FALSE
notebook: FALSE
type: docx
token: I1SGdWLnKoikBDxTQ3scuA91nCg
sidebar_position: 10
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listUsers()

This operation lists the names of all existing users.

```java
public List<String> listUsers()
```

## Request Syntax{#request-syntax}

```java
listUsers();
```

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of strings containing the user names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> resp = client.listUsers();
```

