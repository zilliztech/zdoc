---
title: "listGrant() | Node.js"
slug: /node/node/Authentication-listGrant
sidebar_label: "listGrant()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the privileges granted to the specified role. | Node.js"
type: docx
token: HSIDdxQGEoPdyaxkMDjcAWGQnpd
sidebar_position: 17
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrant()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listGrant()

This operation lists the privileges granted to the specified role.

```javascript
await milvusClient.listGrant(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*',
   db_name?: string
 });
```

**PARAMETERS:**

- **roleName** (*string*)  

    The target role name

    Setting this to the name of a non-existing role may result in errors.

- **object** (*string*)

    The name of a valid privilege object group. Possible values are **Global**, **Collection**, and **User**.

- **objectName** (*string*)

    The name of a specific object in the specified object group. Using a wildcard (*) indicates that all privileges in the specified group are to be granted.

- **db_name** (*string*)

    The name of the database to which the target object belongs.

- **timeout** (*number*) 

    The timeout duration of this operation.

**RETURNS:**

*Promise&lt;SelectGrantResponse&gt;*

This method returns a promise that resolves to a **SelectGrantResponse** object.

```javascript
{
    "entities": [
        {
            db_name: string,
            grantor: { privilege: { name: string }, user: { name: string } },
            object: { name: string },
            object_name: string,
            role: { name: string }
        }
    ],
    "status": ResStatus
```

**PARAMETERS:**

- **entities** (*GrantEntity[]*) -

    A list of grant entities, each of which is shaped as follows.

- **status** (*ResStatus*) -

    A **ResStatus object.

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
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*'
 });
```

