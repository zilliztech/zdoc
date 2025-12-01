---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the privileges granted to the specified role. | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrants()
  - nodejs26
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listGrants()

This operation lists the privileges granted to the specified role.

```javascript
listGrants(data): Promise<SelectGrantResponse>
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```

**PARAMETERS:**

- roleName (*string*)  

    The target role name

    Setting this to the name of a non-existing role may result in errors.

*Returns Promise\<SelectGrantResponse>*

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

    A list of grant entities, each of which is shaped as follows:

    - **db_name** (*string*) -

        The name of the database in which the privilege has been granted.

    - **grantor** (*Grantor*) -

        A **Grantor** object that is shaped as follows:

        - **privilege** (*PrivilegeEntity*) -

            A **PrivilegeEntity** object that is shaped as follows:

            - **name** (*string*) - 

                The name of the granted privilege.

        - **user** (*User*) - 

            A **User** object that is shaped as follows:

            - **name** (*string*) - 

                The name of the user that grants the above privilege to the role. 

    - **object** (*ObjectEntity*) -

        An **ObjectEntity** object that is shaped as follows:

        - **name** (*string*) - 

            The name of the object entity.

    - **object_name** (*string*) -

        The name of a specific object within the above object entity.

    - **role** (*RoleEntity*) -   

        A **RoleEntity** object that is shaped as follows:

        - **name** (*string*) - 

            The name of the role to which the privilege has been granted.

- **status** (*ResStatus*) -

    A **ResStatus object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
