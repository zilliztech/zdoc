---
title: "RevokePrivilege() | Cloud"
slug: /cpp/cpp/Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes a privilege from a role on a specific object. | Cloud"
type: docx
token: IA1jdFAQ7ooZj5xkQT8cz6H3ndb
sidebar_position: 25
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - RevokePrivilege()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokePrivilege()

This operation revokes a privilege from a role on a specific object.

```c++
Status RevokePrivilege(const RevokePrivilegeRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = RevokePrivilegeRequest()
    .WithRoleName(name)
    .WithObjectType(object_type)
    .WithObjectName(object_name)
    .WithPrivilege(privilege)
    .WithDatabaseName(db_name);
```

**REQUEST METHODS:**

- `WithRoleName(const std::string& name)`

    Sets the name of the role.

- `WithObjectType(const std::string& object_type)`

    Sets the type of the target object, such as `Collection` or `Global`.

- `WithObjectName(const std::string& object_name)`

    Sets the name of the target object. Use `*` to apply the privilege to all objects of the given type.

- `WithPrivilege(const std::string& privilege)`

    Sets the name of the privilege to revoke. For available privileges, refer to [Available Privileges](/docs/cluster-privileges).

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RevokePrivilege(
    milvus::RevokePrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
