---
title: "ListPrivilegeGroups() | Cloud"
slug: /cpp/cpp/Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての権限グループの一覧を返します。 | Cloud"
type: docx
token: JzwFd9yZqozzWdxQrHjcm8jynjc
sidebar_position: 13
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - ListPrivilegeGroups()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups()

この操作は、すべての権限グループの一覧を返します。

```c++
Status ListPrivilegeGroups(const ListPrivilegeGroupsRequest& request, ListPrivilegeGroupsResponse& response)
```

**戻り値:**

*ListPrivilegeGroupsResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListPrivilegeGroupsRequest request;
milvus::ListPrivilegeGroupsResponse response;
status = client->ListPrivilegeGroups(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
