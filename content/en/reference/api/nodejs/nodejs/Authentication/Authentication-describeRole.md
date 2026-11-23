---
title: "describeRole() | Node.js"
slug: /node/node/Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a specific role. | Node.js"
type: docx
token: ItZPd1o4uoodqtx1sxIcq38hn7e
sidebar_position: 9
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - describeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# describeRole()

This operation describes a specific role.

```javascript
await milvusClient.describeRole(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeRole({
    includeUserInfo?: boolean,
    roleName: string,
    timeout?: number
})
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role to describe.

- **includeUserInfo** (*boolean*) -

    A boolean value indicating whether to include user information.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise&lt;SelectRoleResponse&gt;*

This method returns a promise that resolves to a **SelectRoleResponse** object.

```javascript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*RoleResult[]*) -
A list of **RoleResult** objects. For `describeRole()`, this list contains a single entry describing the requested role.

    - **role** (*[RoleEntity](./Authentication-RoleEntity)*) -

        A **RoleEntity** object describing the role.

    - **users** (*[User](./Authentication-User)[]*) -

        A list of users that hold this role.

    - **entities** (*[GrantEntity](./Authentication-GrantEntity)[]*) -

        A list of grants attached to this role. Each entry includes the granted privilege, the target object, and the user who granted it.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
milvusClient.describeRole({roleName: 'myrole'});
```

