---
title: "スナップショット | Cloud"
slug: /snapshots
sidebar_label: "スナップショット"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スナップショットは、Milvus collection の特定時点のイメージであり、迅速なロールバック、バージョン管理、テストに最適です。特定のタイムスタンプにおける collection の状態をキャプチャし、スキーマ、インデックス、vector データファイル（binlogs）などのメタデータとマニフェストファイルのみを保存することで、効率的な保存と復元を実現します。 | Cloud"
type: origin
token: XC1ow3jGBi7hVvkINtBcXhQ6n8g
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スナップショット

スナップショットは、Milvus collection の特定時点のイメージであり、迅速なロールバック、バージョン管理、テストに最適です。特定のタイムスタンプにおける collection の状態をキャプチャし、スキーマ、インデックス、vector データファイル（binlogs）などのメタデータとマニフェストファイルのみを保存することで、効率的な保存と復元を実現します。

スナップショットは、データの迅速な特定時点イメージであり、高速なロールバックやテストに適しています（**数日〜数週間**）。一方、バックアップは、長期的な災害復旧（**数週間〜数年**）や、ストレージ全体の障害に対するより高い保護のために、別個に保存される独立した完全コピーです。 

バックアップを作成するには、 を参照してください。

## スナップショットの構造\{#snapshot-anatomy}

Milvus は、実際の vector データを複製することなく、効率的な特定時点のキャプチャ、保存、復元を行うために、マニフェストベースのスナップショットアーキテクチャを実装しています。このアーキテクチャでは、メタデータ管理を物理データストレージから分離しており、オブジェクトストレージ内の既存の segment ファイルを参照する軽量なスナップショットを実現します。

collection のスナップショットを作成すると、Milvus は次の情報を収集します。

- **スナップショットメタデータ**

    スナップショット名と説明、対象 collection ID、スナップショットが作成された時点など、スナップショット作成に必要な基本情報を提供します。

- **Collection の説明**

    スキーマ定義、partition 情報、プロパティを含む、対象 collection の説明を含みます。

- **インデックス情報**

    インデックスメタデータとインデックスファイルへのパスを保存します。

- **Segment データ**

    vector データファイル（binlogs）、削除ログ（deltalogs）、およびインデックスファイルをキャプチャします。

上記の情報のうち、Milvus は各 segment に対して Apache Avro マニフェストファイルを生成し、スナップショットメタデータ、Collection の説明、インデックス情報、およびマニフェストファイルへのパスを JSON ファイルに保存します。次の図は、スナップショットフォルダ構造を示しています。

```python
snapshots/{collection_id}/
├── metadata/
│   └── {snapshot_id}.json         # Snapshot metadata (JSON format)
│
└── manifests/
    └── {snapshot_id}/             # Directory for each snapshot
        ├── {segment_id_1}.avro    # Individual segment manifest (Avro format)
        ├── {segment_id_2}.avro
        └── ...
```

スナップショットの作成には通常ミリ秒単位しかかからず、復元にはデータ量に応じて数秒から数分かかります。

## ストレージへの影響と考慮事項\{#storage-impacts-and-considerations}

Milvus がスナップショット内で segment またはインデックスファイルを参照すると、スナップショットを削除しない限り、それらのファイルはガベージコレクションされません。スナップショットは対象 collection のサイズに比例したストレージを消費し、スナップショット保持にはオブジェクトストレージのコストが発生します。極端な場合、1 つのスナップショットでオブジェクトストレージのコストが 2 倍になることさえあります。次のことを推奨します。

- ストレージを節約するため、古いスナップショットを定期的に削除する。

- 将来参照しやすいよう、わかりやすい名前と説明を使用する。

- スナップショットの作成および復元結果を必ず確認する。

- スナップショットの作成タイムスタンプ、ストレージ使用量、および

- 監視とトラブルシューティングのために復元ジョブ ID を保存する。

## 制限事項\{#limits-and-restrictions}

- スナップショットは作成後に不変になります。

- スナップショットは、元の collection と同じ cluster 内の新しい collection にのみ復元できます。

- 復元された collection は、同じスキーマ、shard 数、および partition 数を保持します。

- 復元された過去データは TTL ポリシーと競合する可能性があります。スナップショットを作成する前に、TTL を無効化するか TTL 設定を調整することを推奨します。

- スナップショットを `milvus-table` の external source として使用するには、ソーススナップショットが通常の StorageV3 Milvus collection から作成されたものである必要があります。external collection のスナップショットは `milvus-table` ソースとしてサポートされていません。

## 関連資料\{#further-readings}

import DocCardList from '@theme/DocCardList';

<DocCardList />
