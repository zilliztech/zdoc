---
title: "DropAlias() | Cloud"
slug: /cpp/cpp/Collections-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はエイリアスを削除します。 | Cloud"
type: docx
token: WsSQdBrrOo4hhbx9XWFciuVAn3b
sidebar_position: 19
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy ベクトル search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - DropAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias()

この操作はエイリアスを削除します。

```c++
Status DropAlias(const DropAliasRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。

- `WithAlias(const std::string& alias)`

    エイリアス名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

status = client->DropAlias(
    milvus::DropAliasRequest()
        .WithAlias("my_alias"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
