---
title: "RemovePrivilegesFromGroup() | Cloud"
slug: /cpp/cpp/Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特権グループから特権を削除します。 | Cloud"
type: docx
token: TCfed4TH2o0XkdxkZDPcwPTdnWG
sidebar_position: 17
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - RemovePrivilegesFromGroup()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemovePrivilegesFromGroup()

この操作は、特権グループから特権を削除します。

```c++
Status RemovePrivilegesFromGroup(const RemovePrivilegesFromGroupRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RemovePrivilegesFromGroupRequest()
    .WithGroupName(name)
    .WithPrivileges(privileges);
```

**リクエストメソッド:**

- `WithGroupName(const std::string& name)`

    この操作の対象となる特権グループの名前を設定します。

- `WithPrivileges(std::set<std::string>&& privileges)`

    指定したグループから削除する特権を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

privileges = {"Search", "Query"};
status = client->RemovePrivilegesFromGroup(
    milvus::RemovePrivilegesFromGroupRequest()
       .WithGroupName(privilege_group_name)
       .WithPrivileges(std::move(privileges))
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
