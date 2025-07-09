---
title: "外部マイグレーションの基本 | Cloud"
slug: /external-migration-basics
sidebar_label: "外部マイグレーションの基本"
beta: FALSE
notebook: FALSE
description: "外部移行により、ベクトルデータベースや検索システムをZilliz Cloudに移行する過程が簡素化されます。PineconeやQdrantなどのベクトルデータベースから移行する場合や、ElasticsearchやOpen Searchなどのベクトル機能を備えた検索エンジンから移行する場合でも、Zilliz Cloudはデータの整合性を確保しながら移行の複雑さを最小限に抑えるための移行ツールを提供します。 | Cloud"
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
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# 外部マイグレーションの基本

外部移行により、ベクトルデータベースや検索システムをZilliz Cloudに移行する過程が簡素化されます。PineconeやQdrantなどのベクトルデータベースから移行する場合や、ElasticsearchやOpen Searchなどのベクトル機能を備えた検索エンジンから移行する場合でも、Zilliz Cloudはデータの整合性を確保しながら移行の複雑さを最小限に抑えるための移行ツールを提供します。

## サポートされているデータソース{#supported-data-sources}

Zilliz Cloudは、主要なベクトルデータベースや検索プラットフォームからの移行をサポートしています

<table>
   <tr>
     <th><p>データソース</p></th>
     <th><p>タイプ</p></th>
     <th><p>主な特徴</p></th>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pinecone">松ぼっくり</a></p></td>
     <td><p>ベクトルデータベース</p></td>
     <td><p>類似検索を備えたサーバーレスインデックス</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-qdrant">Qdrant</a></p></td>
     <td><p>ベクトルデータベース</p></td>
     <td><p>オープンソースエンジン、クラウド、自己ホスト</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-elasticsearch">Elasticsearchについて</a></p></td>
     <td><p>検索エンジン</p></td>
     <td><p>フルテキスト検索による高密度ベクトルサポート</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pgvector">Postgre SQL</a></p></td>
     <td><p>リレーショナルデータベース</p></td>
     <td><p>ベクトル拡張(pgvector)のサポート</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-tencent-cloud">テンセントクラウドVectorDB</a></p></td>
     <td><p>マネージドサービス</p></td>
     <td><p>ベクトルデータベースサービスの管理</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-opensearch">Open Search</a></p></td>
     <td><p>検索プラットフォーム</p></td>
     <td><p>ベクトル機能を備えたKNNプラグイン</p></td>
   </tr>
</table>

## コア機能{#core-capabilities}

Zillizの移行ツールは、データ構造がZilliz Cloudに完全に適合するように、幅広い設定オプションを提供します。

<table>
   <tr>
     <th><p>機能カテゴリー</p></th>
     <th><p>ケイパビリティ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><strong>スキーマ制御</strong></p></td>
     <td><p>フィールド名のカスタマイズ</p></td>
     <td><p>移行中にフィールド名を好みの命名スタイルに合わせて変更してください</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>動的フィールドから固定フィールドへ</p></td>
     <td><p>柔軟なメタデータを固定された構造化されたフィールドに変換して、パフォーマンスを向上させます</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>追加のフィールド</p></td>
     <td><p>進化する要件に対応するために、ソースデータ以外の新しいフィールドを追加してください</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>データ型マッピング</p></td>
     <td><p>Zilliz Cloudは自動的にフィールドタイプを検出してマップし、手動で調整するオプションがあります</p></td>
   </tr>
   <tr>
     <td><p><strong>コレクションの設定</strong></p></td>
     <td><p>スマートな命名</p></td>
     <td><p>デフォルトでは、Zilliz Cloudはターゲットコレクションのソーステーブル名を保持します。重複した名前が検出された場合、システムはエラーアラートを発行してユーザーが名前を変更できるようにします。ソーステーブル名にハイフン(<code>-</code>)が含まれている場合など、命名規則の競合が発生した場合、Zilliz Cloudはハイフン(<code>-</code>)をアンダースコア(<code>_</code>)に自動的に変換するか、データソースに応じてユーザーに調整を促すエラーを発生させます。</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>シャードの設定</p></td>
     <td><p>データのクエリ方法に合わせてデータ配信を設定してください</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>パーティション戦略</p></td>
     <td><p>自動パーティショニングまたはカスタムグループを使用してデータを整理します</p></td>
   </tr>
   <tr>
     <td><p><strong>データの整合性</strong></p></td>
     <td><p>プライマリキーの処理</p></td>
     <td><p>レコードの一意の識別子を作成、保持、または変更します</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>フィールド属性</p></td>
     <td><p>フィールドにnull値を含めることができるかどうかを設定し、デフォルト値を定義します</p></td>
   </tr>
   <tr>
     <td><p></include></p></td>
     <td><p>エラー処理</p><p></include></p></td>
     <td><p>エラーが発生した場合はすぐに失敗するか、最大1,000行の問題のある行をスキップして移行を続けることができます。</p><p></include></p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>検証チェック</p></td>
     <td><p>移行の詳細を示す詳細な移行レポートにアクセスする</p></td>
   </tr>
</table>

## 移住の過程{#migration-process}

移行は、データの整合性を確保し、プロセス全体で可視性を提供するように設計された3段階のアプローチに従います。

![TlBawqVufhMN4BbNzdXcNQjpnVb](/img/TlBawqVufhMN4BbNzdXcNQjpnVb.png)

### フェーズ1:接続と設定{#phase-1-connect-and-configure}

1. **接続を確立する**:ソースシステムにアクセスするための認証資格情報(APIキー、接続文字列)を提供してください

1. **ソースデータの選択**:移行する特定のインデックス、コレクション、またはテーブルを選択してください

1. **ターゲットの設定**: Zilliz Cloudクラスターとデータベースを宛先として選択してください

### フェーズ2:マッピングのレビュー{#phase-2-review-mappings}

このフェーズには2つの主要なコンポーネントが含まれます。

#### スキーママッピング{#schema-mapping}

- 自動検出:システムはベクトル場、スカラー場、およびメタデータを識別します

- **フィールドのカスタマイズ**:必要に応じてフィールド名とタイプを調整します

- **型変換**:ソースとターゲット間のデータ型マッピングを確認してください

- **高度なオプション**:要件に基づいてシャード、パーティションキー、およびnull許容フィールドを構成します

#### シャード設定{#shard-setting}

最適なパフォーマンスを得るには、データ量に基づいてシャードを構成します。

- **小規模データセット**(≤100 M行):通常、単一のシャードで十分です

- **大規模なデータセット**(>1 B行):最適なシャード構成のための[サポートに問い合わせる](https://zilliz.com/contact-sales)

#### ジョブの設定{#job-configuration}

移行ジョブがエラー行を処理する方法を構成します。

- **最初のエラーで停止**(デフォルト):行が失敗するとすぐに移行が停止します-100%の精度が必要な重要なデータに最適です

- **1,000エラー行までスキップ**:問題のある行をスキップしながら移行を続ける-一部のデータ品質の問題が許容される大規模なデータセットに適しています

</include>

### フェーズ3:移行と検証{#phase-3-migrate-and-verify}

設定が完了したら、移行を実行して進捗状況を追跡してください

- **リアルタイムモニタリング**:ジョブページを通じて移行状況を追跡する

- **進捗インジケーター**:移行された行、エラー数、および予想完了時間を表示します

- **エラー処理**:問題が発生した場合は、詳細なコードログを確認してください

- **検証**:自動行数検証により、データの完全性が確保されます

## 制限事項{#limitations}

移行を開始する前に、サポートされているすべてのデータソースに適用される共通の制限事項に注意してください。

<table>
   <tr>
     <th><p>考慮により</p></th>
     <th><p>インパクト</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>インデックスやロードの自動化はありません</p></td>
     <td><p>すぐにクエリできないコレクション</p></td>
     <td><p>インデックスを手動で作成し、移行後にコレクションをロードします。詳細な手順については、<a href="./index-vector-fields">インデックスベクトルフィールド</a>と<a href="./load-release-collections">ロード&リリース</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>ソースデータが空です</p></td>
     <td><p>空のインデックス/テーブルを選択できません</p></td>
     <td><p>移行前にソースにデータが含まれていることを確認する</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>コレクションにはベクトルデータを含める必要があります</p></td>
     <td><p>移行前にソースにベクトルフィールドがあることを確認してください</p></td>
   </tr>
   <tr>
     <td><p>サポートされていないデータ型</p></td>
     <td><p>一部の特殊なデータ型は転送されない場合があります</p></td>
     <td><p>データタイプマッピングのプラットフォーム固有のガイドをレビューする</p></td>
   </tr>
</table>

## スタートする{#getting-started}

Zilliz Cloudにデータを移行する準備はできましたか?

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインしてください。

1. **マイグレーション**に移動し、ソースプラットフォームを選択してください

1. ガイドされたワークフローに従って移行を完了してください

<supademo id="cmb7mg34n4sqrppkp8pnm8dub" title="Zilliz Cloud - Access Migration Portal Demo"></supademo>

## プラットフォーム固有の移行ガイド{#platform-specific-migration-guides}

プラットフォームに固有の詳細な手順、前提条件、およびデータマッピング情報については、次のとおりです。

- [PineconeからZilliz Cloudへの移行](./migrate-from-pinecone)

- [QdrantからZilliz Cloudへの移行](./migrate-from-qdrant)

- [ElasticsearchからZilliz Cloudへの移行](./migrate-from-elasticsearch)

- [Postgre SQLからZilliz Cloudに移行](./migrate-from-pgvector)

- [テンセントクラウドからZilliz Cloudへの移行](./migrate-from-tencent-cloud)

- [Open SearchからZilliz Cloudへの移行](./migrate-from-opensearch)

