---
slug: /python
beta: FALSE
notebook: FALSE
sidebar_position: 1
displayed_sidebar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Python SDK リファレンス

[PyMilvus](https://github.com/milvus-io/pymilvus) Python SDK は、Milvus と Zilliz Cloud の公式 Python クライアントです。`MilvusClient` を介した高レベルの関数型 API と、従来の ORM 形式 API の両方を提供します。

## 機能

- **MilvusClient** — 一般的な操作用の簡素化された関数型 API
- **ORM API** — 従来のオブジェクトリレーショナルマッピング形式 API
- **Bulk import** — 大規模なデータ取り込み向けのローカルおよびリモートの bulk writer
- **Embedding models** — `pymilvus[model]` によるテキストおよび画像埋め込みの統合サポート
- **Rerankers** — ハイブリッド検索向けの組み込み reranking 関数

## インストールと更新

ターミナルで次のコマンドを実行すると、最新の PyMilvus をインストールするか、PyMilvus をこのバージョンに更新できます。

```shell
pip install --upgrade pymilvus==3.0.1
```

インストール後は、次のコマンドを実行して pymilvus のバージョンを確認できます。

```python
from pymilvus import __version__

print(__version__)

# 3.0.1
```

## クラスターへの接続

```python
from pymilvus import MilvusClient

# Authentication enabled with a cluster user
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password", # replace this with your token
)
```

## 新機能

このバージョンでは、PyMilvus に MilvusClient モジュールが追加され、複数の関数型メソッドが組み込まれています。これにより、その機能は全体として従来の ORM モジュールと整合しています。

import DocCardList from '@theme/DocCardList';

<DocCardList />

## 例

ドキュメントに加えて、[example sets](https://github.com/milvus-io/pymilvus/tree/master/examples) や当社の [GitHub repository](https://github.com/milvus-io/pymilvus) も参照できます。
