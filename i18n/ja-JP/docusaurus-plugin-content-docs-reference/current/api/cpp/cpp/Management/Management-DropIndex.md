---
title: "DropIndex() | Cloud"
slug: /cpp/cpp/Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、フィールドからインデックスを削除します。 | Cloud"
type: docx
token: JstbdGVJwocHJ0xQ8M8cagZHn2a
sidebar_position: 5
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - LLM幻覚
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

この操作は、フィールドからインデックスを削除します。

```c++
Status DropIndex(const DropIndexRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFieldName(const std::string& field_name)`

    フィールド名を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックス名を設定します。

    <Admonition type="info" icon="📘" title="Notes">

    フィールド名とインデックス名の両方が指定されている場合はインデックス名が使用され、それ以外の場合はフィールド名にフォールバックします。

    </Admonition>

**戻り値:**

*Status*

成功したかどうかを確認するには、`status.IsOk()` を参照してください。

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

status = client->DropIndex(
    milvus::DropIndexRequest()
        .WithCollectionName(collection_name)
        .WithFieldName(field_face)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
