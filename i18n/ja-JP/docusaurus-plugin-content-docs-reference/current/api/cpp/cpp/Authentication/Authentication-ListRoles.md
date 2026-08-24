---
title: "ListRoles() | Cloud"
slug: /cpp/cpp/Authentication-ListRoles
sidebar_label: "ListRoles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ロールの一覧を取得します。 | Cloud"
type: docx
token: Syt3dskDpo3VcQxMu43cXcBFnre
sidebar_position: 14
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - cloud
  - ListRoles()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRoles()

この操作は、ロールの一覧を返します。

```c++
Status ListRoles(const ListRolesRequest& request, ListRolesResponse& response)
```

**戻り値:**

*ListRolesResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListRolesRequest request;
milvus::ListRolesResponse response;
status = client->ListRoles(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
