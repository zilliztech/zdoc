---
title: "GrantPrivilege() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a privilege to a role on a specific object. | Cloud"
type: docx
token: FPhDdyJa4oTIAxx6dHAcn9nynld
sidebar_position: 24
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilege()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilege()

This operation grants a privilege to a role on a specific object.

```c++
Status GrantPrivilege(const GrantPrivilegeRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GrantPrivilegeRequest()
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

    Sets the name of the privilege to grant. For available privileges, refer to [Available Privileges](/docs/cluster-privileges).

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

status = client->GrantPrivilege(
    milvus::GrantPrivilegeRequest()
        .WithRoleName(role_name)
        .WithObjectType("Collection")
        .WithObjectName(collection_name)
        .WithPrivilege("Search")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
