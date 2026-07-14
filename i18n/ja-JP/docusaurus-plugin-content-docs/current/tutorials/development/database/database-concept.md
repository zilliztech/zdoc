---
title: "Database の説明 | Cloud"
slug: /database-concept
sidebar_label: "Database の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Database は project 内の collection の論理コンテナです。collection 名と操作のスコープを選択した database に限定しながら、異なるアプリケーション、テナント、または環境向けにデータを整理するのに役立ちます。 | Cloud"
type: origin
token: B7SFwbn76iUM06kkYzBcffE8nYf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Database の説明

Database は project 内の collection の論理コンテナです。collection 名と操作のスコープを選択した database に限定しながら、異なるアプリケーション、テナント、または環境向けにデータを整理するのに役立ちます。

Zilliz Cloud は 2 つの database モデルを使用します。

- **Serving Cluster 内の Database**: Dedicated serving cluster でホストされる database です。serving cluster endpoint を通じて、schema 管理、データの書き込み、削除、search、query、その他の collection 操作をサポートします。

- **On-Demand Search 向け Database**: Zilliz Cloud によって管理される project レベルの database です。serving cluster から独立しており、on-demand compute を使用して project endpoint 経由で query されます。

<Admonition type="info" icon="📘" title="注">

このページでは database モデルについて説明します。database を作成および管理するには、[Serving Clusters 内の Database](./database) および [On-Demand Search 向け Database](./on-demand-database) を参照してください。

</Admonition>

## Serving Clusters 内の Database\{#database-in-serving-clusters}

serving cluster 内の database は、特定の Dedicated serving cluster 内に作成されます。Dedicated cluster が作成されると、それに伴って default database が作成されます。必要に応じて、同じ serving cluster 内に追加の database を作成できます。

serving cluster 内の database は、ホスティングしている cluster のライフサイクルに結び付いています。

- serving cluster が停止されると、その databases と collections は cluster が再開されるまで利用できなくなります。

- serving cluster が削除されると、その databases と collections も削除されます。

このモデルは、常時稼働で低レイテンシなデータアクセスを必要とする本番ワークロードに使用します。

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

## On-Demand Search 向け Database\{#database-for-on-demand-search}

On-demand search 向け database は、Zilliz Cloud によって管理される project レベルの database です。serving cluster には結び付いていません。この database 内のデータを search または query する際は、project endpoint を使用し、on-demand compute を指定します。

このモデルは、database と collection の管理、import、search、query をサポートします。insert、upsert、delete 操作はサポートしません。

このモデルは、クエリ頻度が低い、またはバースト的なワークロードで search される大規模データセットに使用します。

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

|  | **Serving Clusters 内の Database** | **On-Demand Search 向け Database** |
| --- | --- | --- |
| 最適な用途 | 常時稼働で低レイテンシなデータアクセスを必要とする本番ワークロード。 | バースト的な search や query を伴う大規模データセット。 |
| ホスト先 | serving cluster | プラットフォーム管理の project リソース |
| Endpoint | Serving cluster endpoint | Project endpoint |
| Compute resource | ホスティング serving cluster | 指定した on-demand compute |
| Database の作成/削除 | Yes | Yes |
| Collection の作成/削除 | Yes | Yes |
| Collection の load/release | Yes | No need |
| Insert/upsert/delete | Yes | No |
| Import | Yes | Yes |
| Search と query | Yes | Yes |
| ライフサイクル | serving cluster に結び付く | serving clusters から独立 |

## 次のステップ\{#next-steps}

- [Serving Clusters 内の Database](./database)

- [On-Demand Search 向け Database](./on-demand-database)

