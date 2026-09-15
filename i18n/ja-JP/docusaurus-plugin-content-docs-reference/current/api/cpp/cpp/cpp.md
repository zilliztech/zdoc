---
title: "C++ SDK リファレンス | Cloud"
slug: /cpp
sidebar_label: "概要"
sidebar_position: 5
displayed_sidebar: cppSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# C++ SDK リファレンス

[Milvus C++ SDK](https://github.com/milvus-io/milvus-sdk-cpp) は、Milvus および Zilliz Cloud の公式 C++ クライアントです。コレクション、ベクトル、インデックス、データベース操作を管理するためのネイティブ C++ API を提供し、流れるようなリクエストビルダースタイルを採用しています。

## 機能

- **ネイティブ C++ API** — `Status` の戻り値を伴う流れるようなリクエストビルダーパターン
- **コレクションとベクトルの管理** — コレクションの作成、詳細情報の取得、ロード、削除、およびスキーマとインデックスの管理
- **データ操作** — 挿入、アップサート、削除、クエリ、検索（ハイブリッド検索とスパースベクトル検索を含む）
- **データベースとユーザーの管理** — RBAC、リソースグループ、エイリアス、およびデータベース管理
- **最新のフィールドタイプ** — Array、JSON、スパース、バイナリ、float16/bfloat16, int8、struct フィールド
- **Milvus と Zilliz Cloud** — URI 経由で、セルフホスト型 Milvus と Zilliz Cloud の両方のインスタンスに接続

## 互換性

次の表は、Milvus の各バージョンに対応する推奨の milvus-sdk-cpp バージョンを示しています。

| Milvus バージョン | 推奨 SDK バージョン |
|:-----:|:-----:|
| 2.3.x | 2.3 (branch) |
| 2.4.x | v2.4.1 |
| 2.5.x | v2.5.4 |
| 2.6.x | v2.6.6 |
| 3.0.x | v3.0.2 |

## インストール

ソースから SDK をコンパイルしてインストールする方法の詳細については、[開発ガイド](https://github.com/milvus-io/milvus-sdk-cpp/blob/master/DEVELOPMENT.md) を参照してください。

## クイックスタート

```cpp
#include <milvus/MilvusClientV2.h>

using namespace milvus;

int main() {
    auto client = MilvusClientV2::Create();
    ConnectParam connect_param{"http://localhost:19530", "root:Milvus"};
    auto status = client->Connect(connect_param);
    if (!status.IsOk()) {
        return 1;
    }

    // Create a simple collection with a primary field and a vector field
    CreateSimpleCollectionRequest req;
    req.WithCollectionName("my_collection")
       .WithPrimaryFieldName("id")
       .WithVectorFieldName("embedding")
       .WithDimension(128);
    status = client->CreateSimpleCollection(req);

    client->Disconnect();
    return 0;
}
```

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 例

ドキュメントに加えて、当社の [GitHub リポジトリ](https://github.com/milvus-io/milvus-sdk-cpp) にある [サンプルセット](https://github.com/milvus-io/milvus-sdk-cpp/tree/master/examples/src) も参照できます。
