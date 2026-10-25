---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのベクトルフィールドまたはスカラーフィールドに 1 つ以上のインデックスを作成します。1 回の呼び出しで複数のインデックスを指定でき、同期モードでは、インデックスの構築が完了するまで呼び出しが待機します。 | Cloud"
type: docx
token: F2mid3PxKova16x44f8cyyIFnoe
sidebar_position: 3
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# CreateIndex()

この操作は、コレクションのベクトルフィールドまたはスカラーフィールドに 1 つ以上のインデックスを作成します。1 回の呼び出しで複数のインデックスを指定でき、同期モードでは、インデックスの構築が完了するまで呼び出しが待機します。

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .AddIndex(index)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象データベースの名前を設定します。名前が空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    フィールドにインデックスを作成するコレクションの名前を設定します。

- `WithIndexes(std::vector<IndexDesc>&& indexes)`

    作成するインデックスを設定します。リクエストにムーブされる std::ベクトル&lt;IndexDesc&gt; の右辺値を受け入れます。

- `AddIndex(IndexDesc&& index)`

    作成するインデックスを追加します。リクエストにムーブされる IndexDesc の右辺値を受け入れます。

- `WithSync(bool sync)`

    インデックスの構築が完了するまでクライアントが待機するかどうかを設定します。デフォルトは true です。false の場合、インデックスの構築の進行状況に関係なく、呼び出しは直ちに返されます。

- `WithTimeoutMs(int64_t timeout_ms)`

    インデックスの構築を待機するタイムアウトをミリ秒単位で設定します。デフォルトは 60000 ms で、同期モードでのみ有効になります。値が 0 の場合は、インデックスの構築が完了するまで DescribeIndex() をポーリングします。正の値の場合は、指定した時間が経過すると CreateIndex() がタイムアウトステータスを返します。

**戻り値:**

*Status*

インデックスが正常に作成されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、トランスポート、または応答の処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で CreateIndex() を呼び出し、ベクトルフィールドに HNSW インデックスを構築し、準備が完了するまで待機します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index("vector", "vector_idx", milvus::IndexType::HNSW, milvus::MetricType::L2);
index.AddExtraParam("M", "16");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
