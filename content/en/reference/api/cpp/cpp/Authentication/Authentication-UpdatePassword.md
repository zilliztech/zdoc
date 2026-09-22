---
title: "UpdatePassword() | Cloud"
slug: /cpp/cpp/Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates a user's password. | Cloud"
type: docx
token: Livud2dUIotCQbxD8SFc8oWwnGp
sidebar_position: 21
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword()

This operation updates a user's password.

```c++
Status UpdatePassword(const UpdatePasswordRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = UpdatePasswordRequest()
    .WithUserName(name)
    .WithOldPassword(password1)
    .WithNewPassword(password2)
    .WithDescription(description)
    .WithResetConnection(reset_connection);
```

**REQUEST METHODS:**

- `WithUserName(const std::string& name)`

    Sets the name of the user.

- `WithOldPassword(const std::string& password)`

    Sets the password of the user.

- `WithNewPassword(const std::string& password)`

    Sets the user's new password.

- `WithDescription(const std::string& description)`

    Sets the description of the user.

- `WithResetConnection(bool reset_connection)`

    Whether to reset the client connection after the password is updated. The password is updated on the server before the reconnect is attempted. If the reconnect fails, the returned Status reports that the password was updated but the connection must be re-established manually with the new credentials.

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

status = client->UpdatePassword(
    milvus::UpdatePasswordRequest()
        .WithUserName(user_name)
        .WithOldPassword("P@ssw0rd!")
        .WithNewPassword("P@ssw1rd#")
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
