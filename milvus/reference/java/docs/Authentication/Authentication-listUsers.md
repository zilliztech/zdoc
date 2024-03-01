---
displayed_sidbar: javaSidebar
slug: /java/Authentication-listUsers
beta: false
notebook: false
type: docx
token: I1SGdWLnKoikBDxTQ3scuA91nCg
sidebar_position: 10
---

# listUsers()

This operation lists the names of all existing users.

```java
public List<String> listUsers()
```

## Request Syntax{#request-syntax}

```java
listUsers();
```

__RETURN TYPE:__

_List\<String\>_

__RETURNS:__

A list of strings containing the user names.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> resp = client.listUsers();
```

