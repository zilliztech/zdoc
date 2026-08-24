---
title: "DescribeDatabase() | Cloud"
slug: /cpp/cpp/Database-DescribeDatabase
sidebar_label: "DescribeDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロパティを含むデータベースの詳細情報を返します。 | Cloud"
type: docx
token: ZNfkd4vqOoG9RexySyicxncBnzf
sidebar_position: 3
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase()

この操作は、プロパティを含むデータベースの詳細情報を返します。

```c++
Status DescribeDatabase(const DescribeDatabaseRequest& request, DescribeDatabaseResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeDatabaseRequest()
    .WithDatabaseName(db_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

**戻り値:**

*Status* および *DescribeDatabaseResponse*

`status.IsOk()` を確認して、成功したかどうかを判定します。

### DatabaseDesc\{#databasedesc}

このクラスは、Milvus データベースのメタデータを表します。`DescribeDatabaseResponse` オブジェクトに対して `Desc()` を呼び出すことで返されます。

```c++
const DatabaseDesc& desc = response.Desc();
```

**メソッド:**

- `const std::string& Name() const`

    データベースの名前。

- `int64_t ID() const`

    サーバーによって割り当てられたデータベース ID。

- `const std::unordered_map<std::string, std::string>& Properties() const`

    データベースレベルのプロパティ（キーと値のペア）。

- `uint64_t CreatedTime() const`

    データベース作成時の UTC タイムスタンプ（マイクロ秒）。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DescribeDatabaseResponse resp_desc_db;
status = client->DescribeDatabase(
    milvus::DescribeDatabaseRequest()
        .WithDatabaseName(my_db_name), 
    resp_desc_db
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "database.replica.number = " << resp_desc_db.Desc().Properties().at("database.replica.number")
          << std::endl;
```
