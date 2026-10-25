---
title: "DropIndex() | Cloud"
slug: /cpp/cpp/Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、フィールドからインデックスを削除します。 | Cloud"
type: docx
token: JstbdGVJwocHJ0xQ8M8cagZHn2a
sidebar_position: 5
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - LLM のハルシネーション
  - zilliz
  - Zilliz Cloud
  - クラウド
  - DropIndex()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropIndex()

この操作では、フィールドからインデックスを削除します。

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

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithFieldName(const std::string& field_name)`

    フィールドの名前を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックスの名前を設定します。

    <Admonition type="info" title="Notes">

    フィールド名とインデックス名の両方を指定した場合は、インデックス名が使用されます。それ以外の場合は、フィールド名にフォールバックします。

    </Admonition>

**戻り値：**

*Status*

`status.IsOk()` を確認して、成功したことを確かめます。

**例外：**

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

status = client->DropIndex(
    milvus::DropIndexRequest()
        .WithCollectionName(collection_name)
        .WithFieldName(field_face)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
