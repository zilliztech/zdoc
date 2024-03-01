---
displayed_sidbar: javaSidebar
slug: /java/Authentication-listRoles
beta: false
notebook: false
type: docx
token: NTG8dR5ZBooKUSx4hgjcNQnUnXd
sidebar_position: 9
---

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

__RETURN TYPE:__

_List\<String\>_

__RETURNS:__

A list of strings containing the role names.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
List<String> roles = client.listRoles();
```

