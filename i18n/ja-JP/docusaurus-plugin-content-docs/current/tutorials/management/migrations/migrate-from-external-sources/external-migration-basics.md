---
title: "外部移行の基本 | Cloud"
slug: /external-migration-basics
sidebar_label: "外部移行の基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部移行により、ベクトルデータベースや検索システムを Zilliz Cloud へ移行するプロセスが簡素化されます。Pinecone や Qdrant などのベクトルデータベース、または Elasticsearch や OpenSearch などのベクトル機能を備えた検索エンジンから移行する場合でも、Zilliz Cloud はデータ整合性を確保しながら移行の複雑さを最小限に抑える移行ツールを提供します。 | Cloud"
type: origin
token: WZe4w7lNji6RVHkR5alcrTw8nQ2
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 外部移行の基本

外部移行により、ベクトルデータベースや検索システムを Zilliz Cloud へ移行するプロセスが簡素化されます。Pinecone や Qdrant などのベクトルデータベース、または Elasticsearch や OpenSearch などのベクトル機能を備えた検索エンジンから移行する場合でも、Zilliz Cloud はデータ整合性を確保しながら移行の複雑さを最小限に抑える移行ツールを提供します。

## 対応データソース\{#supported-data-sources}

Zilliz Cloud は主要なベクトルデータベースおよび検索プラットフォームからの移行をサポートしています。

| データソース | 種類 | 主な機能 |
| --- | --- | --- |
| [Pinecone](./migrate-from-pinecone) | ベクトルデータベース | 類似検索を備えたサーバーレスインデックス |
| [Qdrant](./migrate-from-qdrant) | ベクトルデータベース | オープンソースエンジン、クラウドおよびセルフホスト対応 |
| [Elasticsearch](./migrate-from-elasticsearch) | 検索エンジン | フルテキスト検索を備えた dense ベクトルのサポート |
| [PostgreSQL](./migrate-from-pgvector) | リレーショナルデータベース | ベクトル拡張（pgvector）のサポート |
| [Tencent Cloud VectorDB](./migrate-from-tencent-cloud) | マネージドサービス | マネージドベクトルデータベースサービス |
| [OpenSearch](./migrate-from-opensearch) | 検索プラットフォーム | ベクトル機能を持つ KNN プラグイン |

## コア機能\{#core-capabilities}

移行ツールには、データ構造を Zilliz Cloud に最適に適合させるための豊富な設定オプションが用意されています。

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
     <td><p>柔軟なメタデータを固定の構造化フィールドに変換し、パフォーマンスを向上させます。</p><p>メタデータにテキストが含まれている場合、それを固定フィールドに変換すると <code>VARCHAR</code> フィールドが作成されます。これにより、そのテキストに対して Full Text Search を有効化できます。詳細は <a href="./full-text-search">Full Text Search</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>追加フィールド</p></td>
     <td><p>変化する要件に対応するため、ソースデータに含まれない新しいフィールドを追加</p></td>
   </tr>
   <tr>
     <td><p>データ型マッピング</p></td>
     <td><p>Zilliz Cloud はフィールド型を自動検出してマッピングし、必要に応じて手動で調整することもできます</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>コレクション設定</strong></p></td>
     <td><p>スマート命名</p></td>
     <td><p>デフォルトでは、Zilliz Cloud はターゲットコレクションに対してソーステーブル名を保持します。重複した名前が検出された場合、ユーザーが名前を変更できるようにシステムがエラー通知を出します。ソーステーブル名にハイフン（<code>-</code>）が含まれる場合など命名規則の競合については、データソースに応じて、Zilliz Cloud がハイフン（<code>-</code>）を自動的にアンダースコア（<code>_</code>）へ変換するか、ユーザーに調整を促すエラーを表示します</p></td>
   </tr>
   <tr>
     <td><p>シャード設定</p></td>
     <td><p>データのクエリ方法に合わせてデータ分散を設定</p></td>
   </tr>
   <tr>
     <td><p>パーティション戦略</p></td>
     <td><p>自動パーティショニングまたはカスタムグルーピングのいずれかを使用してデータを整理</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>データ整合性</strong></p></td>
     <td><p>主キー処理</p></td>
     <td><p>レコードの一意識別子を作成、保持、または変更</p></td>
   </tr>
   <tr>
     <td><p>フィールド属性</p></td>
     <td><p>フィールドに null 値を含められるかどうかを設定し、デフォルト値を定義</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>検証チェック</p></td>
     <td><p>移行の詳細を示す詳細な移行レポートにアクセス</p></td>
   </tr>
   <tr>
     <td><p><strong>Full Text Search</strong></p></td>
     <td><p>移行中に <strong>VARCHAR</strong> フィールドに対して Full Text Search を有効化</p></td>
     <td><p><strong>Advanced settings</strong> → <strong>Function</strong> で設定し、移行中に <strong>VARCHAR</strong> フィールドの Full Text Search を有効化します。</p><p>ソースのメタデータにテキストが含まれている場合は、<strong>Convert to Fixed Field</strong> を使用してテキストメタデータから <strong>VARCHAR</strong> を作成します。詳細は <a href="./full-text-search">Full Text Search</a> を参照してください。</p></td>
   </tr>
</table>

## 移行プロセス\{#migration-process}

移行は、データ整合性を確保し、プロセス全体を通じて可視性を提供するよう設計された 3 フェーズのアプローチに従います。

![TlBawqVufhMN4BbNzdXcNQjpnVb](https://zdoc-images.s3.us-west-2.amazonaws.com/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### フェーズ 1: 接続と設定\{#phase-1-connect-and-configure}

1. **接続を確立**: 認証情報（API キー、接続文字列）を指定してソースシステムへアクセスし、接続をテストします

1. **ソースデータを選択**: 移行する特定のインデックス、コレクション、またはテーブルを選択します

1. **ターゲットを設定**: 宛先として Zilliz Cloud クラスターとデータベースを選択します

### フェーズ 2: マッピングを確認\{#phase-2-review-mappings}

このフェーズには 2 つの主要コンポーネントがあります。

#### スキーママッピング\{#schema-mapping}

- **自動検出**: システムがベクトルフィールド、スカラーフィールド、およびメタデータを識別します

- **フィールドのカスタマイズ**: 必要に応じてフィールド名と型を調整します

- **型変換**: ソースとターゲット間のデータ型マッピングを確認して確定します

- **高度なオプション**: 要件に応じてシャード、パーティションキー、および NULL 許容フィールドを設定します

#### シャード設定\{#shard-setting}

最適なパフォーマンスのために、データ量に基づいてシャードを設定します。

- **小規模データセット**（≤100M 行）: 通常は単一シャードで十分です

- **大規模データセット**（>1B 行）: 最適なシャード構成については [サポートにお問い合わせください](https://zilliz.com/contact-sales)

### フェーズ 3: 移行と検証\{#phase-3-migrate-and-verify}

設定が完了したら、移行を実行して進行状況を追跡します。

- **リアルタイム監視**: Jobs ページで移行ステータスを追跡

- **進行状況インジケーター**: 移行済み行数、エラー数、推定完了時間を表示

- **エラー処理**: 問題が発生した場合は詳細なコードログを確認

- **検証**: 自動行数検証によりデータの完全性を保証

## 制限事項\{#limitations}

移行を開始する前に、サポートされているすべてのデータソースに共通して適用される以下の制限事項を確認してください。

| 考慮事項 | 影響 | 対処方法 |
| --- | --- | --- |
| 自動インデックス作成やロードなし | コレクションはすぐにはクエリできません | 移行後に手動でインデックスを作成し、コレクションをロードしてください。詳細な手順については、[AUTOINDEX Explained](./autoindex-explained) および [Load & Release](./load-release-collections) を参照してください。 |
| 空のソースデータ | 空のインデックス/テーブルは選択できません | 移行前にソースにデータが含まれていることを確認してください |
| ベクトルフィールド要件 | コレクションにはベクトルデータが含まれている必要があります | 移行前にソースにベクトルフィールドがあることを確認してください |
| 非対応のデータ型 | 一部の特殊なデータ型は転送されない場合があります | データ型マッピングについては、プラットフォーム別ガイドを確認してください |

## はじめに\{#getting-started}

Zilliz Cloud へのデータ移行を始める準備はできましたか？

### 移行ポータルにアクセス\{#access-migration-portal}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします

1. **Migrations** に移動し、ソースプラットフォームを選択します

1. ガイド付きワークフローに従って移行を完了します

</Procedures>

<Supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - Access Migration Portal Demo" />

### テキストデータ向けに Full Text Search を設定\{#configure-full-text-search-for-text-data}

ソースにテキストが含まれている場合、移行中に Full Text Search を設定してテキスト取得を改善できます。詳細は [Full Text Search](./full-text-search) を参照してください。

<Supademo id="cmhmruu9p0cp7dqxahn1vdnbb" title="Zilliz Cloud - Configure Full Text Search" />

## プラットフォーム別移行ガイド\{#platform-specific-migration-guides}

お使いのプラットフォームに固有の詳細手順、前提条件、およびデータマッピング情報については、以下を参照してください。

- [Pinecone から Zilliz Cloud へ移行](./migrate-from-pinecone)

- [Qdrant から Zilliz Cloud へ移行](./migrate-from-qdrant)

- [Elasticsearch から Zilliz Cloud へ移行](./migrate-from-elasticsearch)

- [PostgreSQL から Zilliz Cloud へ移行](./migrate-from-pgvector)

- [Tencent Cloud から Zilliz Cloud へ移行](./migrate-from-tencent-cloud)

- [OpenSearch から Zilliz Cloud へ移行](./migrate-from-opensearch)

