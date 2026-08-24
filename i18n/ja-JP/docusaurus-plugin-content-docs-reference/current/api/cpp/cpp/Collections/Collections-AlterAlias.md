---
title: "AlterAlias() | Cloud"
slug: /cpp/cpp/Collections-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションのエイリアスを別のエイリアスに変更します。 | Cloud"
type: docx
token: VRKNdqRGboPNcOxEnkDc3PiWn4e
sidebar_position: 4
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias()

この操作は、コレクションのエイリアスを別のエイリアスに変更します。

```c++
Status AlterAlias(const AlterAliasRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithAlias(const std::string& alias)`

    エイリアス名を設定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

status = client->AlterAlias(
    milvus::AlterAliasRequest()
        .WithCollectionName("new_collection")
        .WithAlias("my_alias"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
