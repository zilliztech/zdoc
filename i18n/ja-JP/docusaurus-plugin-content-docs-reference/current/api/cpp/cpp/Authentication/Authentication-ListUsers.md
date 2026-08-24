---
title: "ListUsers() | Cloud"
slug: /cpp/cpp/Authentication-ListUsers
sidebar_label: "ListUsers()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザー名の一覧を取得します。 | Cloud"
type: docx
token: NSvXdtRoioS4NKxdjANcGFd9nrc
sidebar_position: 15
keywords: 
  - Dense embedding
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - ListUsers()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListUsers()

ユーザー名の一覧を取得します。

```c++
Status ListUsers(const ListUsersRequest& request, ListUsersResponse& response)
```

**戻り値:**

*ListUsersResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListUsersRequest request;
milvus::ListUsersResponse response;
status = client->ListUsers(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
