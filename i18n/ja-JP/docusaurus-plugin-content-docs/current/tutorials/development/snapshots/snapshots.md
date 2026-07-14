---
title: "Snapshots | Cloud"
slug: /snapshots
sidebar_label: "Snapshots"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スナップショットは、Milvus collection のある時点のイメージであり、迅速なロールバック、バージョニング、テストに最適です。特定のタイムスタンプにおける collection の状態をキャプチャし、効率的な保存と復元のために、スキーマ、index、vector データファイル（binlogs）などのメタデータとマニフェストファイルのみを保存します。 | Cloud"
type: origin
token: XC1ow3jGBi7hVvkINtBcXhQ6n8g
sidebar_position: 15
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Snapshots

スナップショットは、Milvus collection のある時点のイメージであり、迅速なロールバック、バージョニング、テストに最適です。特定のタイムスタンプにおける collection の状態をキャプチャし、効率的な保存と復元のために、スキーマ、index、vector データファイル（binlogs）などのメタデータとマニフェストファイルのみを保存します。

スナップショットは、データの高速なポイントインタイムイメージであり、高速なロールバックやテストに適しています（**数日〜数週間**）。一方、バックアップは、長期的な災害復旧（**数週間〜数年**）や、ストレージ全体の障害に対するより高い保護のために別途保存される、独立した完全なコピーです。 

バックアップを作成するには、 を参照してください。

## Snapshot anatomy\{#snapshot-anatomy}

Milvus は、実際の vector データを複製することなく、効率的なポイントインタイムのキャプチャ、保存、復元を実現するために、manifest ベースのスナップショットアーキテクチャを実装しています。このアーキテクチャでは、メタデータ管理と物理データ保存を分離しており、オブジェクトストレージ内の既存の segment ファイルを参照する軽量なスナップショットを可能にしています。

collection のスナップショットを作成すると、Milvus は次の情報を収集します。

- **スナップショットメタデータ**

    スナップショット名と説明、対象 collection の ID、スナップショットが作成される時点など、スナップショット作成のための基本情報を提供します。

- **Collection の説明**

    スキーマ定義、partition 情報、プロパティなど、対象 collection の説明を含みます。

- **Index 情報**

    index メタデータと index ファイルへのパスを保存します。

- **Segment データ**

    vector データファイル（binlogs）、削除ログ（deltalogs）、index ファイルをキャプチャします。

上記の情報のうち、Milvus は各 segment に対して Apache Avro の manifest ファイルを生成し、スナップショットメタデータ、collection の説明、index 情報、および manifest ファイルへのパスを JSON ファイルに保存します。次の図は、スナップショットのフォルダー構造を示しています。

```plaintext
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

## Storage impacts and considerations\{#storage-impacts-and-considerations}

Milvus がスナップショット内の segment または index ファイルを参照すると、スナップショットを削除しない限り、それらのファイルはガベージコレクションされません。スナップショットは対象 collection のサイズに比例したストレージを消費し、スナップショット保持にはオブジェクトストレージのコストが発生します。極端な場合、1 つのスナップショットでオブジェクトストレージのコストが 2 倍になることもあります。次のことを推奨します。

- ストレージ節約のため、古いスナップショットを定期的に削除する。

- 将来参照しやすいように、わかりやすい名前と説明を使用する。

- スナップショットの作成結果と復元結果を常に確認する。

- スナップショットの作成タイムスタンプ、ストレージ使用量、および を追跡する。

- 監視とトラブルシューティングのために、復元ジョブ ID を保存する。

## Limits and restrictions\{#limits-and-restrictions}

- スナップショットは作成後に変更できなくなります。

- スナップショットは、元の collection と同じ cluster 内の新しい collection にのみ復元できます。

- 復元された collection は、同じスキーマ、shard 数、partition 数を保持します。

- 復元された過去データは TTL ポリシーと競合する可能性があります。スナップショットを作成する前に、TTL を無効にするか、TTL 設定を調整することを推奨します。

- スナップショットを `milvus-table` の外部ソースとして使用するには、ソーススナップショットが通常の StorageV3 Milvus collection から作成されたものである必要があります。外部 collection のスナップショットは、`milvus-table` のソースとしてはサポートされていません。

## Further readings\{#further-readings}

import DocCardList from '@theme/DocCardList';

<DocCardList />
