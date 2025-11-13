---
title: "リリースノート (2024年4月3日) | Cloud"
slug: /release-notes-270
sidebar_label: "リリースノート (2024年4月3日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このアップデートでは、Zilliz Cloudに強力なツールと機能強化を導入します：Object Storageなどのソースからの簡単なデータインジェストのための新しいConnector、検索関連性を改善するRerankers、詳細なシステム状態分析のためのメトリクス監視API、およびAWS S3、Google Cloud Storage、およびAzure Blob Storageからベクターデータベースインスタンスへの直接インポートを可能にするクロスクラウドデータインポート機能。これらの機能は、クラウドでのベクターデータベース管理を合理化する、データインジェスト、検索精度、および運用洞察の向上を組み合わせています。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 16
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年4月3日)

このアップデートでは、Zilliz Cloudに強力なツールと機能強化を導入します：Object Storageなどのソースからの簡単なデータインジェストのための新しいConnector、検索関連性を改善するRerankers、詳細なシステム状態分析のためのメトリクス監視API、およびAWS S3、Google Cloud Storage、およびAzure Blob Storageからベクターデータベースインスタンスへの直接インポートを可能にするクロスクラウドデータインポート機能。これらの機能は、クラウドでのベクターデータベース管理を合理化する、データインジェスト、検索精度、および運用洞察の向上を組み合わせています。

### Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.3.x**と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz CloudはAzure Marketplaceで利用可能になり、ユーザーがAzureで高度な完全管理型ベクターデータベースサービスにこれまで以上に簡単にアクセスできるようになりました。この新しい統合は、スケーラブルなAIアプリケーションの必要性が高まり続ける中で重要な時期に登場しました。Zilliz CloudがAzure Marketplaceで利用可能になったことで、ユーザーはAIアプリケーションをすばやく構築し、簡単に拡張できるようになりました。今日からAIプロジェクトを加速するために、AzureのZilliz Cloudのパワーを活用してください。[Azure MarketplaceのZilliz Cloudを参照](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice)。

### コネクタ\{#connectors}

コネクタは、Object Storage、Kafka（まもなくサポート開始）、およびそれ以上の複数データソースからZilliz Cloudへのストリーミングデータ用に設計された組み込みツールです。たとえば、Object Storageコネクタは、指定されたオブジェクトストレージバケットを監視し、PDFおよびHTMLなどのファイルをZilliz Cloudインジェストパイプラインに自動的に同期する機能を持っています。このプロセスは、これらのファイルをベクトル表現に変換し、強化された検索機能のためにベクターデータベースに効率的にロードすることを可能にします。

### リランカー\{#rerankers}

リランカーは現在、検索パイプラインに統合されており、関連性で検索結果を洗練させたい人に向けたオプション強化を提供し、検索品質を向上させます。このリリースでは、以下のリランカーオプションを導入します：

- zilliz/bge-reranker-base

### メトリクス監視用API\{#api-for-metrics-monitoring}

このリリースから、Zilliz Cloudはメトリクス監視に特化したAPIを提供します。この新しく導入されたAPIは、30以上のメトリクスへのアクセスを提供し、システムのパフォーマンスと効率に不可欠なさまざまな側面を包括的に把握できます。

主要メトリクスカバー：

- リソース使用量追跡：Compute Unit（CU）リソース使用量を深く洞察し、コンピュート使用量およびストレージ容量を追跡できます。

- 検索およびデータ挿入パフォーマンスメトリクス：レイテンシとスループットに特に焦点を当てて、検索クエリおよびデータ挿入プロセスのパフォーマンスを評価します。

- リクエスト失敗率：潜在的な問題をすばやく特定し、トラブルシューティングできるように、リクエストの失敗率を監視し、信頼性の高いアプリケーションパフォーマンスを確保します。

- コレクションおよびエンティティ統計：コレクションおよびエンティティの詳細な統計にアクセスし、データ管理の改善を促進します。

[APIの詳細についてはさらに発見](/reference/restful/query-metrics)。

### クロスクラウドデータインポートおよび移行強化\{#cross-cloud-data-import-and-migration-enhancement}

現在、Zilliz Cloudユーザーは、AWS S3、Google Cloud Storage、およびAzure Blob StorageからZilliz Cloud上の任意のベクターデータベースインスタンスに、場所に関係なくデータを容易にインポートまたは移行できます。

詳細については、Zilliz Cloudドキュメントの[データインポート](./data-import)および[移行](./migrations)を参照してください。