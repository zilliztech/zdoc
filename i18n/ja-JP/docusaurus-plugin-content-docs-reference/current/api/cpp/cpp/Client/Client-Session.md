---
title: "Session() | Cloud"
slug: /cpp/cpp/Client-Session
sidebar_label: "Session()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "DQL インターフェースのみを公開するクラスタースコープのセッションを作成します。 | Cloud"
type: docx
token: VTkhdUYKvoYBPRx7EDiczhJhnhe
sidebar_position: 15
keywords: 
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - 最近傍探索
  - LLM 評価
  - zilliz
  - zilliz cloud
  - cloud
  - Session()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Session()

DQL インターフェースのみを公開するクラスタースコープのセッションを作成します。

```c++
Status Session(const std::string& cluster_id, MilvusClientV2SessionPtr& session)
```

**パラメーター:**

- **cluster_id** (*const std::string&*)

    対象クラスターの識別子です。

- **session** (*MilvusClientV2SessionPtr&*)

    クラスタースコープのクライアントビューを受け取る出力パラメーターです。

**戻り値:**

*Status*

`status.IsOk()` を確認して成功を確かめます。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を確認してください。

### MilvusClientV2Session\{#milvusclientv2session}

特定のクラスターにバインドされた読み取り専用（DQL）インターフェースを公開するクラスタースコープのクライアントビューです。

**メソッド:**

- `const std::string& ClusterID() const`

    対象クラスターの識別子を返します。

- `Status Search(const SearchRequest& request, SearchResponse& response)`

    対象クラスターに対して検索を実行します。詳細は [Search](./Vector-Search) を参照してください。

- `Status SearchIterator(const SearchIteratorRequest& request, SearchIteratorPtr& iterator)`

    対象クラスターの検索イテレーターを作成します。詳細は [SearchIterator](./Vector-SearchIterator) を参照してください。

- `Status HybridSearch(const HybridSearchRequest& request, HybridSearchResponse& response)`

    対象クラスターに対してハイブリッド検索を実行します。詳細は [HybridSearch](./Vector-HybridSearch) を参照してください。

- `Status Query(const QueryRequest& request, QueryResponse& response)`

    対象クラスターに対してクエリを実行します。詳細は [Query](./Vector-Query) を参照してください。

- `Status Get(const GetRequest& request, GetResponse& response)`

    対象クラスターに対して主キーによる取得クエリを実行します。詳細は [Get](./Vector-Get) を参照してください。

- `Status QueryIterator(const QueryIteratorRequest& request, QueryIteratorPtr& iterator)`

    対象クラスターのクエリイテレーターを作成します。詳細は [QueryIterator](./Vector-QueryIterator) を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::MilvusClientV2SessionPtr session;
status = client->Session(cluster_id, session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
