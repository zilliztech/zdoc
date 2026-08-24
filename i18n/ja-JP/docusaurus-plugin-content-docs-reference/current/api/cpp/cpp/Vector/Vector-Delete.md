---
title: "Delete() | Cloud"
slug: /cpp/cpp/Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、フィルター式またはID配列を指定してエンティティを削除します。 | Cloud"
type: docx
token: B9XjdA1Cgo0oBRxglOlcrlPan9e
sidebar_position: 1
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Delete()

この操作は、フィルター式またはID配列を指定してエンティティを削除します。

```c++
Status Delete(const DeleteRequest& request, DeleteResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DeleteRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithFilter(filter)
    .WithFilterTemplates(value)
    .WithIDs(id_array);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。空の場合はデフォルトのパーティションが適用されます。

- `WithFilter(const std::string& filter)`

    フィルター式を設定します。

- `AddFilterTemplate(std::string key, nlohmann::json&& filter_template)`

    フィルターテンプレートを追加します。これは`WithFilter()`が設定されている場合にのみ有効です。詳細については、[フィルターテンプレート](https://milvus.io/docs/filtering-templating.md)のページを参照してください。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルターテンプレートを設定します。これは`WithFilter()`が設定されている場合にのみ有効です。詳細については、[フィルターテンプレート](https://milvus.io/docs/filtering-templating.md)のページを参照してください。

- `WithIDs(std::ベクトル<int64_t>&& id_array)`

    整数主キーのセットを設定します。これは`WithFilter()`が空の場合にのみ有効です。

**戻り値:**

*DeleteResponse* を含む *Status*

成功したかどうかを確認するには、`status.IsOk()`をチェックしてください。

### DmlResults\{#dmlresults}

このクラスは、データ変更操作（挿入、アップサート、削除）の結果を保持します。`InsertResponse`、`UpsertResponse`、または`DeleteResponse`の`Results()`からアクセスできます。

```c++
const DmlResults& results = response.Results();
```

**メソッド:**

- `const IDArray& IdArray() const`

    挿入、アップサート、または削除されたエンティティのIDです。自動IDコレクションの場合、サーバーが挿入後にこの値を設定します。整数または文字列のIDの取得方法については、IDArrayを参照してください。

- `uint64_t Timestamp() const`

    サーバー側の操作タイムスタンプです。後続の検索やクエリ呼び出しで`guarantee_timestamp`として渡すことで、読み取り後の書き込み整合性を確保できます。

- `uint64_t InsertCount() const`

    挿入された行数です。`InsertResponse`および`UpsertResponse`で設定されます。

- `uint64_t DeleteCount() const`

    削除された行数です。`DeleteResponse`および`UpsertResponse`で設定されます。

- `uint64_t UpsertCount() const`

    アップサートされた行数（新規挿入または既存データの置換）です。`UpsertResponse`で設定されます。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()`および`status.Message()`を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DeleteResponse resp_delete;
status = client->Delete(milvus::DeleteRequest()
                            .WithCollectionName(collection_name)
                            .WithPartitionName(partition_name)
                            .WithFilter(field_id + "== 5"),
                        resp_delete);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
