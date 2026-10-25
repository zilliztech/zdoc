---
title: "DescribeIndex() | Cloud"
slug: /cpp/cpp/Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション上のインデックスの説明を、そのパラメーターを含めて取得します。 | Cloud"
type: docx
token: WjEJdkVfTo20gWx0dWpcRy4Nnzh
sidebar_position: 4
keywords: 
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
  - OpenAI ベクトル DB
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - DescribeIndex()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DescribeIndex()

この操作は、コレクション上のインデックスの説明を、そのパラメーターを含めて取得します。

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

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空のままにすると、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithFieldName(const std::string& field_name)`

    インデックスが属するフィールドの名前を設定します。

- `WithIndexName(const std::string& index_name)`

    インデックスの名前を設定します。field_name と index_name の両方が指定されている場合、インデックス名が優先されます。

- `WithTimestamp(int64_t ts)`

    このタイムスタンプより前に生成されたセグメントのみがチェックされるように、タイムスタンプを設定します。この値がゼロの場合は、すべてのセグメントがチェックされます。

**戻り値：**

*Status*

操作が成功したかどうかを示す Status を返します。インデックスの説明は、response パラメーターとして渡される DescribeIndexResponse オブジェクトに格納されます。Descs() は IndexDesc エントリのリストを公開します。

- **response** (*DescribeIndexResponse*) -

    - **Descs** (*const std::ベクトル&lt;IndexDesc&gt;&*) -

        インデックスの説明を取得します。

        - **FieldName** (*const std::string&*) -

            インデックスが属するフィールド名です。

        - **IndexName** (*const std::string&*) -

            インデックス名です。インデックス名は空にできません。

        - **IndexId** (*int64_t*) -

            インデックス ID です。

        - **MetricType** (*milvus::MetricType*) -

            メトリックタイプです。

        - **IndexType** (*milvus::IndexType*) -

            インデックスタイプです。

        - **ExtraParams** (*const std::unordered_map&lt;std::string, std::string>&*) -

            追加パラメーターを取得します。注記：このメソッドは v2.4 で再定義されているため、古いクライアントコードに影響する可能性があります。

        - **StateCode** (*milvus::IndexStateCode*) -

            インデックスの状態を取得します。

        - **FailReason** (*std::string*) -

            インデックスの失敗理由を取得します。

        - **IndexedRows** (*int64_t*) -

            インデックス済みの行数を取得します。Compaction 後に一部のセグメントが再インデックス化されるため、インデックス済みの行数が合計行数より多くなる場合があることに注意してください。

        - **TotalRows** (*int64_t*) -

            合計行数を取得します。

        - **PendingRows** (*int64_t*) -

            保留中の未インデックス行数を取得します。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で DescribeIndex() を呼び出し、フィールドに構築されたインデックスの説明を取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DescribeIndexResponse response;
auto request = milvus::DescribeIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name);
status = client->DescribeIndex(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& index_desc : response.Descs()) {
    std::cout << "IndexName: " << index_desc.IndexName() << std::endl;
    std::cout << "FieldName: " << index_desc.FieldName() << std::endl;
}
```
