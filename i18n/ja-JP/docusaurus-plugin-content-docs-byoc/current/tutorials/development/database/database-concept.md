---
title: "データベースの概要 | BYOC"
slug: /database-concept
sidebar_label: "データベースの概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データベースは、プロジェクト内でコレクションを格納する論理コンテナです。コレクション名や操作を選択したデータベースのスコープに限定しつつ、アプリケーション、テナント、環境ごとにデータを整理できます。 | BYOC"
type: origin
token: B7SFwbn76iUM06kkYzBcffE8nYf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データベースの概要

データベースは、プロジェクト内でコレクションを格納する論理コンテナです。コレクション名や操作を選択したデータベースのスコープに限定しつつ、アプリケーション、テナント、環境ごとにデータを整理できます。

Zilliz Cloud では、2つのデータベースモデルが提供されています。

- **サービングクラスター内のデータベース**: Dedicated サービングクラスター上でホストされるデータベースです。サービングクラスターのエンドポイント経由で、スキーマ管理、データの書き込み・削除、検索、クエリなどのコレクション操作を実行できます。

- **オンデマンド検索用データベース**: Zilliz Cloud が管理するプロジェクトレベルのデータベースです。サービングクラスターから独立しており、オンデマンドコンピュートを利用してプロジェクトエンドポイントからクエリを実行します。

<Admonition type="info" icon="📘" title="Note">

このページでは、各データベースモデルについて説明します。データベースの作成と管理については、「[サービングクラスター内のデータベース](./database)」および「[オンデマンド検索用データベース](./on-demand-database)」を参照してください。

</Admonition>

## サービングクラスター内のデータベース\{#database-in-serving-clusters}

サービングクラスター内のデータベースは、特定の Dedicated サービングクラスター内に作成されます。Dedicated クラスターの作成時に、デフォルトのデータベースも自動的に作成されます。必要に応じて、同じサービングクラスター内に追加のデータベースを作成することも可能です。

サービングクラスター内のデータベースは、ホスト元のクラスターのライフサイクルに連動します。

- サービングクラスターが一時停止されると、クラスターが再開されるまで、そのデータベースとコレクションは利用できなくなります。

- サービングクラスターが削除されると、関連するデータベースとコレクションもすべて削除されます。

常時稼働かつ低レイテンシーでのデータアクセスが求められる本番ワークロードには、このモデルが適しています。

```plaintext
Project
└── Serving Cluster
    ├── Database (default)
    │   ├── Collection_01
    │   └── Collection_02
    └── Database
        ├── Collection_03
        └── Collection_04
```

## オンデマンド検索用データベース\{#database-for-on-demand-search}

オンデマンド検索用データベースは、Zilliz Cloud が管理するプロジェクトレベルのデータベースであり、サービングクラスターには依存しません。このデータベースに対して検索やクエリを実行する際は、プロジェクトエンドポイントを使用し、オンデマンドコンピュートを指定します。

このモデルでは、データベースとコレクションの管理、インポート、検索、クエリがサポートされています。ただし、insert、upsert、delete 操作はサポートされていません。

クエリの頻度が低い大規模データセットや、突発的な負荷が発生する検索ワークロードには、このモデルが適しています。

```plaintext
Project
├── Serving Cluster
│   └── Database (default)
│       ├── Collection_01
│       └── Collection_02
└── Databases for on-demand search
    ├── Database
    │   └── External_Collection_01
    └── Database
        └── Managed_Collection_01
```

## 比較\{#comparison}

|  | **サービングクラスター内のデータベース** | **オンデマンド検索用データベース** |
| --- | --- | --- |
| 最適な用途 | 常時稼働で低レイテンシーのデータアクセスが必要な本番ワークロード。 | バースト的な検索とクエリを伴う大規模データセット。 |
| ホスト先 | サービングクラスター | プラットフォーム管理のプロジェクトリソース |
| エンドポイント | サービングクラスターのエンドポイント | プロジェクトエンドポイント |
| コンピュートリソース | ホスティングサービングクラスター | 指定されたオンデマンドコンピュート |
| Create/drop データベース | Yes | Yes |
| Create/drop コレクション | Yes | Yes |
| Load/release コレクション | Yes | 不要 |
| Insert/upsert/delete | Yes | No |
| Import | Yes | Yes |
| Search and query | Yes | Yes |
| ライフサイクル | サービングクラスターに紐づく | サービングクラスターから独立 |

## 次のステップ\{#next-steps}

- [サービングクラスター内のデータベース](./database)

- [オンデマンド検索用データベース](./on-demand-database)

