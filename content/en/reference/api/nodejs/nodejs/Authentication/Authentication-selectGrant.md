---
title: "selectGrant() | Node.js"
slug: /node/node/Authentication-selectGrant
sidebar_label: "selectGrant()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This operation selects the privileges granted to the specified role on the specified object. | Node.js"
type: origin
token: shared-Authentication-selectGrant
displayed_sidebar: nodeSidebar

---

# selectGrant()

This operation selects the privileges granted to the specified role on the specified object.

```javascript
await milvusClient.selectGrant(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.selectGrant({
    roleName: string,
    object: string,
    objectName: string,
    db_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role.

- **object** (*string*) -

    The type of the object on which the privilege is granted. Possible values include **Global**, **Collection**, and **User**.

- **objectName** (*string*) -

    The name of the object to which the role is granted the specified privilege.

- **db_name** (*string*) -

    An optional database name.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC.

**RETURNS:**

*Promise&lt;SelectGrantResponse&gt;*

This method returns a promise that resolves to a **SelectGrantResponse** object.

```javascript
{
    entities: GrantEntity[],
    status: ResStatus
}
```

**PARAMETERS:**

- **entities** (**GrantEntity[]**) -

    A list of grant entities describing the privileges granted to the role.

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
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.selectGrant({
    roleName: 'my_role',
    object: 'Collection',
    objectName: 'my_collection',
});
```
