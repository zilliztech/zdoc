---
title: "DescribeIndex() | Cloud"
slug: /cpp/cpp/Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "指定したインデックスの説明とパラメーターを取得します。 | Cloud"
type: docx
token: MW7cdYuPyoNF2wxD5oKcibgynKd
sidebar_position: 4
keywords: 
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
  - openai ベクトル db
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

指定したインデックスの説明とパラメーターを取得します。

```c++
Status DescribeIndex(const DescribeIndexRequest& request, DescribeIndexResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name)
    .WithTimestamp(ts);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFieldName(const std::string& field_name)`

    フィールド名を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックス名を設定します。

    <Admonition type="info" icon="📘" title="Notes">

    フィールド名とインデックス名の両方が指定されている場合はインデックス名が使用され、それ以外の場合はフィールド名にフォールバックします。

    </Admonition>

- `WithTimestamp(int64_t ts)`

    タイムスタンプを設定します。設定した場合、この操作ではそのタイムスタンプより前に生成されたセグメントのみがチェックされます。未設定の場合は、すべてのセグメントがチェックされます。

**戻り値:**

*Status* および *DescribeIndexResponse*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

milvus::DescribeIndexResponse desc_response;
status = client->DescribeIndex(milvus::DescribeIndexRequest()
                                        .WithDatabaseName(db_name)
                                        .WithCollectionName(collection_name)
                                        .WithIndexName(index_name),
                                    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& desc : desc_response.Descs()) {
    std::cout << "\tIndexName: " << desc.IndexName() << std::endl;
    std::cout << "\tIndexType: " << std::to_string(desc.IndexType()) << std::endl;
    std::cout << "\tMetricType: " << std::to_string(desc.MetricType()) << std::endl;
    std::cout << "\tTotalRows: " << std::to_string(desc.TotalRows()) << std::endl;
    std::cout << "\tIndexedRows: " << std::to_string(desc.IndexedRows()) << std::endl;
    std::cout << "\tPendingRows: " << std::to_string(desc.PendingRows()) << std::endl;
}
```
