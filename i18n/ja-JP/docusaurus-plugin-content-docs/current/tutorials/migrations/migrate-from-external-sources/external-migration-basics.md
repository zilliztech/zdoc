---
title: "外部移行の基本 | Cloud"
slug: /external-migration-basics
sidebar_label: "外部移行の基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部移行は、ベクターデータベースおよび検索システムをZilliz Cloudへ移動するプロセスを簡素化します。PineconeやQdrantなどのベクターデータベースから移行する場合でも、ElasticsearchやOpenSearchなどのベクター機能付き検索エンジンから移行する場合でも、Zilliz Cloudは移行の複雑さを最小限に抑えながらデータの完全性を確保するための移行ツールを提供します。 | Cloud"
type: origin
token: WZe4w7lNji6RVHkR5alcrTw8nQ2
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - external
  - data source
  - basics
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 外部移行の基本

外部移行は、ベクターデータベースおよび検索システムをZilliz Cloudに移動するプロセスを簡素化します。PineconeやQdrantなどのベクターデータベースから移行する場合でも、ElasticsearchやOpenSearchなどのベクター機能付き検索エンジンから移行する場合でも、Zilliz Cloudは移行の複雑さを最小限に抑えながらデータの完全性を確保するための移行ツールを提供します。

## サポートされているデータソース\{#supported-data-sources}

Zilliz Cloudは、主要なベクターデータベースおよび検索プラットフォームからの移行をサポートしています：

<table>
   <tr>
     <th><p>データソース</p></th>
     <th><p>タイプ</p></th>
     <th><p>主要機能</p></th>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pinecone">Pinecone</a></p></td>
     <td><p>ベクターデータベース</p></td>
     <td><p>類似検索機能付きサーバーレスインデックス</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-qdrant">Qdrant</a></p></td>
     <td><p>ベクターデータベース</p></td>
     <td><p>オープンソースエンジン、クラウドおよびセルフホスト</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-elasticsearch">Elasticsearch</a></p></td>
     <td><p>検索エンジン</p></td>
     <td><p>全文検索機能付き密ベクター対応</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pgvector">PostgreSQL</a></p></td>
     <td><p>リレーショナルデータベース</p></td>
     <td><p>ベクター拡張機能（pgvector）対応</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-tencent-cloud">Tencent Cloud VectorDB</a></p></td>
     <td><p>管理サービス</p></td>
     <td><p>管理されたベクターデータベースサービス</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-opensearch">OpenSearch</a></p></td>
     <td><p>検索プラットフォーム</p></td>
     <td><p>KNNプラグイン、ベクター機能対応</p></td>
   </tr>
</table>

## 主要機能\{#core-capabilities}

移行ツールは、データ構造がZilliz Cloudに完全に適合するように幅広い構成オプションを提供します：

<table>
   <tr>
     <th><p>機能カテゴリ</p></th>
     <th><p>機能</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>スキーマ管理</strong></p></td>
     <td><p>フィールド名のカスタマイズ</p></td>
     <td><p>移行中に好ましい命名スタイルに合わせてフィールド名を変更する</p></td>
   </tr>
   <tr>
     <td><p>動的から固定フィールド</p></td>
     <td>\<p>柔軟なメタデータを固定された構造化フィールドに変換してパフォーマンスを向上。<p>メタデータにテキストが含まれている場合、それを固定フィールドに変換すると<code>VARCHAR</code>フィールドが作成されます。これにより、そのテキストに対して全文検索が可能になります。詳細については、<a href="./full-text-search">全文検索</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>追加フィールド</p></td>
     <td><p>ソースデータを超える新しいフィールドを追加して、進化する要件に対応する</p></td>
   </tr>
   <tr>
     <td><p>データ型マッピング</p></td>
     <td><p>Zilliz Cloudはフィールド型を自動的に検出およびマッピングし、手動で調整するオプションもあります</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>コレクション設定</strong></p></td>
     <td><p>スマートネーミング</p></td>
     <td><p>デフォルトでは、Zilliz Cloudはソーステーブル名をターゲットコレクション用に保持します。重複する名前が検出された場合、システムはエラーアラートを発行してユーザーが名前を変更できるようにします。ハイフン（<code>-</code>）を含むような命名規則の競合については、Zilliz Cloudは自動的にハイフン（<code>-</code>）をアンダースコア（<code>_</code>）に変換するか、データソースに応じてユーザーが調整するよう促すエラーを発生させます</p></td>
   </tr>
   <tr>
     <td><p>シャード構成</p></td>
     <td><p>データクエリ計画に合わせてデータ分散を設定</p></td>
   </tr>
   <tr>
     <td><p>パーティション戦略</p></td>
     <td><p>自動パーティショニングまたはカスタムグループ化を使用してデータを整理</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>データ完全性</strong></p></td>
     <td><p>主キー処理</p></td>
     <td><p>レコードの固有識別子を作成、保持、または変更する</p></td>
   </tr>
   <tr>
     <td><p>フィールド属性</p></td>
     <td><p>フィールドがNULL値を含む可能性があるかどうかを設定し、デフォルト値を定義する</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>検証チェック</p></td>
     <td><p>移行詳細を表示する詳細な移行レポートにアクセスする</p></td>
   </tr>
   <tr>
     <td><p><strong>全文検索</strong></p></td>
     <td><p>移行中に<strong>VARCHAR</strong>フィールドの全文検索を有効化</p></td>
     <td><p><strong>詳細設定</strong> → <strong>機能</strong>で構成して、移行中に<strong>VARCHAR</strong>フィールドの全文検索を有効化。<p>ソースにメタデータにテキストが含まれている場合、<strong>固定フィールドに変換</strong>を使用してテキストメタデータから<strong>VARCHAR</strong>を作成します。詳細については、<a href="./full-text-search">全文検索</a>を参照してください。</p></p></td>
   </tr>
</table>

## 移行プロセス\{#migration-process}

移行は、データの完全性を確保し、プロセス全体を可視化するように設計された3段階アプローチに従います：

![TlBawqVufhMN4BbNzdXcNQjpnVb](/img/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### フェーズ1: 接続と構成\{#phase-1-connect-and-configure}

1. **接続確立**: 認証資格情報（APIキー、接続文字列）を提供してソースシステムにアクセスし、接続をテスト

1. **ソースデータ選択**: 移行する特定のインデックス、コレクション、またはテーブルを選択

1. **ターゲット構成**: Zilliz Cloudクラスターとデータベースを宛先として選択

### フェーズ2: マッピングの確認\{#phase-2-review-mappings}

このフェーズには2つのキーコンポーネントが含まれます：

#### スキーママッピング\{#schema-mapping}

- **自動検出**: システムがベクター filed、スカラー filed、およびメタデータを識別

- **フィールドカスタマイズ**: 必要に応じてフィールド名と型を調整

- **型変換**: ソースとターゲット間のデータ型マッピングを確認して確定

- **高度なオプション**: 要件に応じてシャード、パーティションキー、および NULL 許容フィールドを構成

#### シャード設定\{#shard-setting}

パフォーマンスを最適化するには、データ量に応じてシャードを構成してください：

- **小型データセット**（≤1億件の行）：通常は単一シャードで十分

- **大規模データセット**（>10億件の行）：最適なシャード構成については[サポートに連絡](https://zilliz.com/contact-sales)してください

### フェーズ3: 移行と検証\{#phase-3-migrate-and-verify}

構成が完了すると、移行を実行し進行状況を追跡します：

- **リアルタイムモニタリング**: ジョブページで移行状況を追跡

- **進行状況表示**: 移行された行数、エラー数、推定完了時間の表示

- **エラー処理**: 問題が発生した場合は詳細なコードログを確認

- **検証**: 自動行数検証によりデータの完全性を確保

## 制限\{#limitations}

移行を始める前に、サポートされているすべてのデータソースに共通するこれらの一般的な制限を認識しておく必要があります：

<table>
   <tr>
     <th><p>考慮事項</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p>自動インデックス作成またはロードなし</p></td>
     <td><p>コレクションは即座にクエリ可能にならない</p></td>
     <td><p>移行後に手動でインデックスを作成し、コレクションをロードします。詳細手順については、<a href="./index-vector-fields">ベクター検索のインデックス作成</a>および<a href="./load-release-collections">ロードとリリース</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>空のソースデータ</p></td>
     <td><p>空のインデックス/テーブルは選択できません</p></td>
     <td><p>移行前にソースにデータが含まれていることを確認してください</p></td>
   </tr>
   <tr>
     <td><p>ベクターフール要件</p></td>
     <td><p>コレクションにはベクターのデータが含まれている必要があります</p></td>
     <td><p>移行前にソースにベクターフールが含まれていることを確認してください</p></td>
   </tr>
   <tr>
     <td><p>サポートされていないデータ型</p></td>
     <td><p>一部の特殊なデータ型は転送できない場合があります</p></td>
     <td><p>データ型マッピングについては、プラットフォーム固有のガイドを確認してください</p></td>
   </tr>
</table>

## はじめに\{#getting-started}

Zilliz Cloudにデータを移行する準備ができましたか？

### 移行ポータルへのアクセス\{#access-migration-portal}

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログイン

1. **移行**に移動し、ソースプラットフォームを選択

1. ガイド付きワークフローに従って移行を完了

<Supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - 移行ポータルアクセスデモ" />

### テキストデータに対して全文検索を構成\{#configure-full-text-search-for-text-data}

ソースにテキストが含まれている場合、移行中に全文検索を構成してテキスト検索を改善できます。詳細については、[全文検索](./full-text-search)を参照してください。

<Supademo id="cmhmruu9p0cp7dqxahn1vdnbb" title="Zilliz Cloud - 全文検索を構成" />

## プラットフォーム固有の移行ガイド\{#platform-specific-migration-guides}

プラットフォームに固有の詳細な指示、前提条件、およびデータマッピング情報については：

- [PineconeからZilliz Cloudへの移行](./migrate-from-pinecone)

- [QdrantからZilliz Cloudへの移行](./migrate-from-qdrant)

- [ElasticsearchからZilliz Cloudへの移行](./migrate-from-elasticsearch)

- [PostgreSQLからZilliz Cloudへの移行](./migrate-from-pgvector)

- [Tencent CloudからZilliz Cloudへの移行](./migrate-from-tencent-cloud)

- [OpenSearchからZilliz Cloudへの移行](./migrate-from-opensearch)

