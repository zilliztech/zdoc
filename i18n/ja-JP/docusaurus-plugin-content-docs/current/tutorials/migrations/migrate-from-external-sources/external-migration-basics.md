---
title: "外部移行の基本 | Cloud"
slug: /external-migration-basics
sidebar_key: external-migration-basics
sidebar_label: "外部移行の基本"
beta: FALSE
notebook: FALSE
description: "外部移行により、ベクトルデータベースや検索システムを Zilliz Cloud へ移行するプロセスが簡素化されます。Pinecone や Qdrant などのベクトルデータベースから、あるいは Elasticsearch や OpenSearch などのベクトル機能を備えた検索エンジンからの移行において、Zilliz Cloud はデータの整合性を確保しつつ、移行の複雑さを最小限に抑えるための移行ツールを提供します。 | Cloud"
type: origin
token: WZe4w7lNji6RVHkR5alcrTw8nQ2
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 移行
  - 外部
  - データソース
  - 基本

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 外部移行の基本

外部移行は、ベクトルデータベースや検索システムを Zilliz Cloud に移動するプロセスを簡素化します。Pinecone や Qdrant などのベクトルデータベースから、Elasticsearch や OpenSearch などのベクトル機能を備えた検索エンジンまで、Zilliz Cloud はデータの整合性を確保しつつ移行の複雑さを最小限に抑えるための移行ツールを提供します。

## サポートされているデータソース\{#supported-data-sources}

Zilliz Cloud は、主要なベクトルデータベースおよび検索プラットフォームからの移行をサポートしています：

<table>
   <tr>
     <th><p>データソース</p></th>
     <th><p>タイプ</p></th>
     <th><p>主な機能</p></th>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pinecone">Pinecone</a></p></td>
     <td><p>ベクトルデータベース</p></td>
     <td><p>類似度検索を備えたサーバーレスインデックス</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-qdrant">Qdrant</a></p></td>
     <td><p>ベクトルデータベース</p></td>
     <td><p>オープンソースエンジン、クラウドおよびセルフホスト型</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-elasticsearch">Elasticsearch</a></p></td>
     <td><p>検索エンジン</p></td>
     <td><p>全文検索をサポートする密ベクトル</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pgvector">PostgreSQL</a></p></td>
     <td><p>リレーショナルデータベース</p></td>
     <td><p>ベクトル拡張機能 (pgvector) のサポート</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-tencent-cloud">Tencent Cloud VectorDB</a></p></td>
     <td><p>マネージドサービス</p></td>
     <td><p>マネージドベクトルデータベースサービス</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-opensearch">OpenSearch</a></p></td>
     <td><p>検索プラットフォーム</p></td>
     <td><p>ベクトル機能を備えた KNN プラグイン</p></td>
   </tr>
</table>

## コア機能\{#core-capabilities}

当社の移行ツールは、データ構造が Zilliz Cloud に完璧に適合することを保証するための広範な設定オプションを提供します：

<table>
   <tr>
     <th><p>機能カテゴリ</p></th>
     <th><p>機能</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>スキーマ制御</strong></p></td>
     <td><p>フィールド名のカスタマイズ</p></td>
     <td><p>希望する命名スタイルに合わせて、移行中にフィールド名を変更します</p></td>
   </tr>
   <tr>
     <td><p>動的フィールドから固定フィールドへ</p></td>
     <td><p>柔軟なメタデータを、より良いパフォーマンスのために固定された構造化フィールドに変換します。</p><p>メタデータにテキストが含まれている場合、それを固定フィールドに変換すると <code>VARCHAR</code> フィールドが作成されます。これにより、そのテキストに対して全文検索が可能になります。詳細については、<a href="./full-text-search">全文検索</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>追加フィールド</p></td>
     <td><p>進化する要件に対応するために、ソースデータ以外の新しいフィールドを追加します</p></td>
   </tr>
   <tr>
     <td><p>データ型マッピング</p></td>
     <td><p>Zilliz Cloud はフィールド型を自動的に検出してマッピングしますが、手動で調整するオプションもあります</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>コレクション設定</strong></p></td>
     <td><p>スマートネーミング</p></td>
     <td><p>デフォルトでは、Zilliz Cloud はターゲットコレクションに対してソーステーブル名を保持します。重複した名前が検出された場合、システムはエラーアラートを発行し、ユーザーに名前の変更を促します。ソーステーブル名にハイフン (<code>-</code>) が含まれている場合など、命名規則の競合が発生した場合、Zilliz Cloud はデータソースに応じてハイフン (<code>-</code>) をアンダースコア (<code>_</code>) に自動変換するか、ユーザーに調整を促すエラーを発生させます</p></td>
   </tr>
   <tr>
     <td><p>シャード設定</p></td>
     <td><p>データのクエリ方法に合わせてデータ分布を設定します</p></td>
   </tr>
   <tr>
     <td><p>パーティション戦略</p></td>
     <td><p>自動パーティショニングまたはカスタムグループ化を使用してデータを整理します</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p><strong>データ整合性</strong></p></td>
     <td><p>主キーの処理</p></td>
     <td><p>レコードの一意の識別子を作成、保持、または変更します</p></td>
   </tr>
   <tr>
     <td><p>フィールド属性</p></td>
     <td><p>フィールドに null 値を含めることができるかどうかを設定し、デフォルト値を定義します</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>検証チェック</p></td>
     <td><p>移行の詳細を示す詳細な移行レポートにアクセスします</p></td>
   </tr>
   <tr>
     <td><p><strong>全文検索</strong></p></td>
     <td><p>移行中に <strong>VARCHAR</strong> フィールドに対して全文検索を有効にします</p></td>
     <td><p><strong>詳細設定</strong> → <strong>機能</strong> で設定し、移行中に <strong>VARCHAR</strong> フィールドに対して全文検索を有効にします。</p><p>ソースにメタデータ内のテキストが含まれている場合は、<strong>固定フィールドに変換</strong> を使用してテキストメタデータから <strong>VARCHAR</strong> を作成します。詳細については <a href="./full-text-search">全文検索</a> を参照してください。</p></td>
   </tr>
</table>

## 移行プロセス\{#migration-process}

移行は、データの整合性を確保し、プロセス全体を通じて可視性を提供するように設計された 3 つのフェーズに従います：

![TlBawqVufhMN4BbNzdXcNQjpnVb](https://zdoc-images.s3.us-west-2.amazonaws.com/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### フェーズ 1: 接続と設定\{#phase-1-connect-and-configure}

1. **接続を確立する**: 認証情報（API キー、接続文字列）を提供してソースシステムにアクセスし、接続をテストします

1. **ソースデータの選択**: 移行する特定のインデックス、コレクション、またはテーブルを選択します

1. **ターゲットの設定**: 宛先として Zilliz Cloud クラスターとデータベースを選択します

### フェーズ 2: マッピングの確認\{#phase-2-review-mappings}

このフェーズには、2 つの主要なコンポーネントが含まれます：

#### スキーママッピング\{#schema-mapping}

- **自動検出**: システムがベクトルフィールド、スカラーフィールド、およびメタデータを識別します

- **フィールドのカスタマイズ**: 必要に応じてフィールド名とタイプを調整します

- **型変換**: ソースとターゲット間のデータ型マッピングを確認し、確定します

- **詳細オプション**: 要件に基づいてシャード、パーティションキー、および null 許容フィールドを設定します

#### シャード設定\{#shard-setting}

最適なパフォーマンスを得るために、データ量に基づいてシャードを設定します：

- **小規模データセット** (≤100M 行): 通常、単一のシャードで十分です

- **大規模データセット** (>1B 行): 最適なシャード構成については [サポートにお問い合わせください](https://zilliz.com/contact-sales)

### フェーズ 3: 移行と検証\{#phase-3-migrate-and-verify}

設定が完了したら、移行を実行し、進捗を追跡します：

- **リアルタイム監視**: ジョブページを通じて移行ステータスを追跡します

- **進捗インジケーター**: 移行された行数、エラー数、推定完了時間を表示します

- **エラー処理**: 問題が発生した場合は、詳細なコードログを確認します

- **検証**: 自動的な行数検証により、データの完全性が保証されます

## 制限事項\{#limitations}

移行を開始する前に、サポートされているすべてのデータソースに共通して適用される以下の一般的な制限事項に注意してください：

<table>
   <tr>
     <th><p>考慮事項</p></th>
     <th><p>影響</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>自動インデックス作成またはロードなし</p></td>
     <td><p>コレクションはすぐにクエリできません</p></td>
     <td><p>移行後に手動でインデックスを作成し、コレクションをロードします。詳細な手順については、<a href="./index-vector-fields">ベクトルフィールドのインデックス作成</a> および <a href="./load-release-collections">ロードとリリース</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>空のソースデータ</p></td>
     <td><p>空のインデックス/テーブルは選択できません</p></td>
     <td><p>移行前にソースにデータが含まれていることを確認してください</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>コレクションにはベクトルデータが含まれている必要があります</p></td>
     <td><p>移行前にソースにベクトルフィールドがあることを確認してください</p></td>
   </tr>
   <tr>
     <td><p>サポートされていないデータ型</p></td>
     <td><p>一部の特殊なデータ型は転送されない場合があります</p></td>
     <td><p>データ型マッピングについては、プラットフォーム固有のガイドを確認してください</p></td>
   </tr>
</table>

## 始め方\{#getting-started}

データを Zilliz Cloud に移行する準備はできましたか？

### 移行ポータルへのアクセス\{#access-migration-portal}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします

1. **移行** に移動し、ソースプラットフォームを選択します

1. ガイド付きワークフローに従って移行を完了します

</Procedures>

<Supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - Access Migration Portal Demo" />

### テキストデータに対する全文検索の設定\{#configure-full-text-search-for-text-data}

ソースにテキストが含まれている場合、移行中に全文検索を設定してテキスト検索を改善できます。詳細については [全文検索](./full-text-search) を参照してください。

<Supademo id="cmhmruu9p0cp7dqxahn1vdnbb" title="Zilliz Cloud - Configure Full Text Search" />

## プラットフォーム固有の移行ガイド\{#platform-specific-migration-guides}

プラットフォーム固有の詳細な手順、前提条件、およびデータマッピング情報については：

- [Pinecone から Zilliz Cloud への移行](./migrate-from-pinecone)

- [Qdrant から Zilliz Cloud への移行](./migrate-from-qdrant)

- [Elasticsearch から Zilliz Cloud への移行](./migrate-from-elasticsearch)

- [PostgreSQL から Zilliz Cloud への移行](./migrate-from-pgvector)

- [Tencent Cloud から Zilliz Cloud への移行](./migrate-from-tencent-cloud)

- [OpenSearch から Zilliz Cloud への移行](./migrate-from-opensearch)

