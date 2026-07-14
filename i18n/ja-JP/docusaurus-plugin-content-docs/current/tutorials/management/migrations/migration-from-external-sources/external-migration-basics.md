---
title: "外部移行の基本 | Cloud"
slug: /external-migration-basics
sidebar_label: "外部移行の基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部移行により、vector database や検索システムを Zilliz Cloud へ移行するプロセスが簡素化されます。Pinecone や Qdrant のような vector database からの移行でも、Elasticsearch や OpenSearch のような vector 機能を備えた検索エンジンからの移行でも、Zilliz Cloud はデータ整合性を確保しながら移行の複雑さを最小限に抑える移行ツールを提供します。 | Cloud"
type: origin
token: WZe4w7lNji6RVHkR5alcrTw8nQ2
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 外部移行の基本

外部移行により、vector database や検索システムを Zilliz Cloud へ移行するプロセスが簡素化されます。Pinecone や Qdrant のような vector database からの移行でも、Elasticsearch や OpenSearch のような vector 機能を備えた検索エンジンからの移行でも、Zilliz Cloud はデータ整合性を確保しながら移行の複雑さを最小限に抑える移行ツールを提供します。

## サポートされているデータソース\{#supported-data-sources}

Zilliz Cloud は主要な vector database および検索プラットフォームからの移行をサポートしています。

| Data Source | Type | Key Features |
| --- | --- | --- |
| [Pinecone](./migrate-from-pinecone) | Vector database | 類似検索を備えた Serverless index |
| [Qdrant](./migrate-from-qdrant) | Vector database | オープンソースエンジン、クラウドおよびセルフホスト対応 |
| [Elasticsearch](./migrate-from-elasticsearch) | Search engine | 全文検索を備えた dense vector サポート |
| [PostgreSQL](./migrate-from-pgvector) | Relational database | vector 拡張機能（pgvector）対応 |
| [Tencent Cloud VectorDB](./migrate-from-tencent-cloud) | Managed service | マネージド vector database サービス |
| [OpenSearch](./migrate-from-opensearch) | Search platform | vector 機能を備えた KNN プラグイン |

## 主要機能\{#core-capabilities}

移行ツールは、データ構造を Zilliz Cloud に最適に適合させるための豊富な設定オプションを提供します。

<table>
   <tr>
     <th><p>機能カテゴリ</p></th>
     <th><p>機能</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>スキーマ制御</strong></p></td>
     <td><p>フィールド名のカスタマイズ</p></td>
     <td><p>移行中にフィールド名を変更して、好みの命名スタイルに合わせる</p></td>
   </tr>
   <tr>
     <td><p>動的フィールドから固定フィールドへ</p></td>
     <td><p>柔軟な metadata を固定された構造化フィールドに変換して、パフォーマンスを向上させます。</p><p>metadata にテキストが含まれている場合、それを固定フィールドに変換すると <code>VARCHAR</code> フィールドが作成されます。これにより、そのテキストに対して Full Text Search を有効にできます。詳細は <a href="./full-text-search">Full Text Search</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>追加フィールド</p></td>
     <td><p>変化する要件に対応するために、ソースデータにない新しいフィールドを追加する</p></td>
   </tr>
   <tr>
     <td><p>データ型マッピング</p></td>
     <td><p>Zilliz Cloud はフィールド型を自動的に検出してマッピングし、必要に応じて手動で調整することもできます</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>Collection の設定</strong></p></td>
     <td><p>スマート命名</p></td>
     <td><p>デフォルトでは、Zilliz Cloud はターゲット collection に対してソーステーブル名を保持します。重複名が検出された場合、ユーザーが名前を変更できるようにシステムがエラーアラートを出します。ソーステーブル名にハイフン（<code>-</code>）が含まれる場合などの命名規則の競合については、データソースに応じて、Zilliz Cloud がハイフン（<code>-</code>）をアンダースコア（<code>_</code>）に自動変換するか、ユーザーに調整を促すエラーを表示します</p></td>
   </tr>
   <tr>
     <td><p>Shard 設定</p></td>
     <td><p>データのクエリ方法に合わせてデータ分散を設定する</p></td>
   </tr>
   <tr>
     <td><p>Partition 戦略</p></td>
     <td><p>自動 partitioning またはカスタムグループ化のいずれかを使用してデータを整理する</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>データ整合性</strong></p></td>
     <td><p>Primary key の処理</p></td>
     <td><p>レコードの一意識別子を作成、保持、または変更する</p></td>
   </tr>
   <tr>
     <td><p>フィールド属性</p></td>
     <td><p>フィールドが null 値を含められるかどうかを設定し、デフォルト値を定義する</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>検証チェック</p></td>
     <td><p>移行の詳細を示す詳細な移行レポートにアクセスする</p></td>
   </tr>
   <tr>
     <td><p><strong>Full Text Search</strong></p></td>
     <td><p>移行中に <strong>VARCHAR</strong> フィールドに対して Full Text Search を有効化</p></td>
     <td><p><strong>Advanced settings</strong> → <strong>Function</strong> で設定し、移行中に <strong>VARCHAR</strong> フィールドに対して Full Text Search を有効にします。</p><p>ソースの metadata にテキストが含まれている場合は、<strong>Convert to Fixed Field</strong> を使用してテキスト metadata から <strong>VARCHAR</strong> を作成します。詳細は <a href="./full-text-search">Full Text Search</a> を参照してください。</p></td>
   </tr>
</table>

## 移行プロセス\{#migration-process}

移行は、データ整合性を確保し、プロセス全体を通して可視性を提供するよう設計された 3 段階のアプローチに従います。

![TlBawqVufhMN4BbNzdXcNQjpnVb](https://zdoc-images.s3.us-west-2.amazonaws.com/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### フェーズ 1: 接続と設定\{#phase-1-connect-and-configure}

1. **接続の確立**: 認証情報（API keys、接続文字列）を提供してソースシステムにアクセスし、接続をテストします

1. **ソースデータの選択**: 移行する特定の index、collection、またはテーブルを選択します

1. **ターゲットの設定**: 宛先として Zilliz Cloud cluster と database を選択します

### フェーズ 2: マッピングの確認\{#phase-2-review-mappings}

このフェーズには 2 つの主要コンポーネントがあります。

#### スキーママッピング\{#schema-mapping}

- **自動検出**: システムが vector フィールド、scalar フィールド、metadata を識別します

- **フィールドのカスタマイズ**: 必要に応じてフィールド名と型を調整します

- **型変換**: ソースとターゲット間のデータ型マッピングを確認し、確定します

- **高度なオプション**: 要件に応じて shards、partition keys、nullable fields を設定します

#### Shard 設定\{#shard-setting}

最適なパフォーマンスを得るには、データ量に基づいて shards を設定してください。

- **小規模データセット**（≤100M rows）: 通常は単一 shard で十分です

- **大規模データセット**（>1B rows）: 最適な shard 設定については [サポートにお問い合わせください](https://zilliz.com/contact-sales)

### フェーズ 3: 移行と検証\{#phase-3-migrate-and-verify}

設定が完了したら、移行を実行して進行状況を追跡します。

- **リアルタイム監視**: Jobs ページで移行ステータスを追跡

- **進行状況インジケーター**: 移行済み rows、エラー数、完了予定時刻を表示

- **エラーハンドリング**: 問題が発生した場合は詳細なコードログを確認

- **検証**: 自動 row 数検証によりデータの完全性を確保

## 制限事項\{#limitations}

移行を開始する前に、サポート対象のすべてのデータソースに共通して適用される以下の制限事項を把握しておいてください。

| Consideration | Impact | Solution |
| --- | --- | --- |
| 自動 index 作成や load なし | Collection はすぐにはクエリできない | 移行後に手動で index を作成し、collection を load してください。詳細な手順については、[AUTOINDEX Explained](./autoindex-explained) および [Load & Release](./load-release-collections) を参照してください。 |
| 空のソースデータ | 空の index/テーブルは選択できない | 移行前にソースにデータが含まれていることを確認してください |
| Vector フィールド要件 | Collection には vector データが含まれている必要がある | 移行前にソースに vector フィールドがあることを確認してください |
| サポートされていないデータ型 | 一部の特殊なデータ型は移行できない場合がある | データ型マッピングについてはプラットフォーム固有のガイドを確認してください |

## はじめに\{#getting-started}

Zilliz Cloud へのデータ移行を始める準備はできましたか？

### 移行ポータルにアクセス\{#access-migration-portal}

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします

1. **Migrations** に移動し、ソースプラットフォームを選択します

1. ガイド付きワークフローに従って移行を完了します

</Procedures>

<Supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - Access Migration Portal Demo" />

### テキストデータのための Full Text Search を設定\{#configure-full-text-search-for-text-data}

ソースにテキストが含まれている場合、移行中に Full Text Search を設定してテキスト検索を改善できます。詳細は [Full Text Search](./full-text-search) を参照してください。

<Supademo id="cmhmruu9p0cp7dqxahn1vdnbb" title="Zilliz Cloud - Configure Full Text Search" />

## プラットフォーム別移行ガイド\{#platform-specific-migration-guides}

プラットフォーム固有の詳細な手順、前提条件、データマッピング情報については、以下を参照してください。

- [Pinecone から Zilliz Cloud へ移行](./migrate-from-pinecone)

- [Qdrant から Zilliz Cloud へ移行](./migrate-from-qdrant)

- [Elasticsearch から Zilliz Cloud へ移行](./migrate-from-elasticsearch)

- [PostgreSQL から Zilliz Cloud へ移行](./migrate-from-pgvector)

- [Tencent Cloud から Zilliz Cloud へ移行](./migrate-from-tencent-cloud)

- [OpenSearch から Zilliz Cloud へ移行](./migrate-from-opensearch)

