---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_label: "リリースノート（2024年4月3日）"
beta: FALSE
notebook: FALSE
description: "このアップデートにより、Zilliz Cloudに強力なツールと強化が導入されました。Object Storageなどのソースから簡単にデータを取り込むための新しいコネクタ、検索の関連性を向上させるためのRerankers、詳細なシステム状態分析のためのMetrics Monitoring API、AWS S 3、Google Cloud Storage、Azure Blob Storageからベクトルデータベースインスタンスに直接インポートすることができるCross Cloud Data Import機能が追加されました。これらの機能は、データの取り込み、検索精度、運用洞察を向上させ、クラウド上のベクトルデータベースの管理を効率化します。 | Cloud"
type: origin
token: K2piwxZFZiL00xkf2TtctY80nSe
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートにより、Zilliz Cloudに強力なツールと強化が導入されました。Object Storageなどのソースから簡単にデータを取り込むための新しいコネクタ、検索の関連性を向上させるためのRerankers、詳細なシステム状態分析のためのMetrics Monitoring API、AWS S 3、Google Cloud Storage、Azure Blob Storageからベクトルデータベースインスタンスに直接インポートすることができるCross Cloud Data Import機能が追加されました。これらの機能は、データの取り込み、検索精度、運用洞察を向上させ、クラウド上のベクトルデータベースの管理を効率化します。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。

### Azure Marketplace Azureブログ{#azure-marketplace}

Zilliz CloudがAzure Marketplaceで利用可能になりました。これにより、ユーザーはAzure上で高度で完全に管理されたベクトルデータベースサービスにアクセスすることがこれまで以上に簡単になりました。この新しい統合は、スケーラブルなAIアプリケーションの必要性がますます高まる中で、重要な時期に到着しました。Zilliz CloudがAzure Marketplaceに登場したことで、ユーザーは簡単にAIアプリケーションを構築および拡張することができます。Zilliz Cloud on Azureのパワーを活用して、AIプロジェクトを加速しましょう。[Zilliz Cloud on Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice)をご覧ください。

### コネクタ{#connectors}

コネクタは、Object Storage、Kafka(近日中にサポートが提供されます)など、複数のデータソースからZilliz Cloudにデータをストリーミングするために設計された組み込みツールです。たとえば、Object Storageコネクタには、特定のオブジェクトストレージバケットを監視し、PDFやHTMLなどのファイルをZilliz Cloud Ingestion Pipelinesに自動的に同期する機能があります。この過程により、これらのファイルをベクトル表現に変換し、検索機能を強化するために効率的にベクトルデータベースにロードできます。詳細については、「[データに接続する](./connectors)」を参照してください。

### リランカーズ{#rerankers}

リランカーは現在、検索パイプラインに統合されており、関連性によって検索結果を絞り込み、検索品質を向上させるためのオプションの強化を提供しています。このリリースでは、以下のリランカーオプションを導入しています。

- zilliz/bge-reranker-base-ダウンロード

[リランカーの機能と利点の詳細をご覧ください](./reranker)。

### メトリクスモニタリング用API{#api-for-metrics-monitoring}

今回のリリースから、Zilliz Cloudはメトリクスモニタリング専用のAPIを提供します。この新しく導入されたAPIにより、30以上のメトリクスの包括的なスイートへのアクセスが可能となり、システムのパフォーマンスと効率に重要なさまざまな側面を包括的に把握できます。

主な指標のカバー:

- リソース使用率の追跡:コンピューティングユニット（CU）のリソース使用率に関する深い洞察を得て、コンピューティングの使用率とストレージ容量を追跡できます。

- 検索とデータ挿入のパフォーマンスメトリック:検索クエリとデータ挿入プロセスのパフォーマンスを評価し、特にレイテンシとスループットに焦点を当てます。

- リクエストの失敗率:リクエストの失敗率を監視して、潜在的な問題を迅速に特定してトラブルシューティングし、信頼性の高いアプリケーションパフォーマンスを確保します。

- コレクションとエンティティの統計:コレクションとエンティティの詳細な統計にアクセスし、データ管理を改善します。

[APIの詳細についてはこちらをご覧ください](/reference/restful/query-metrics)。

### クロスクラウドデータのインポートと移行の強化{#cross-cloud-data-import-and-migration-enhancement}

今や、Zilliz Cloudのユーザーは、AWS S 3、Google Cloud Storage、Azure Blob Storageからデータを簡単にインポートまたはZilliz Cloud上の任意のベクトルデータベースインスタンスに移行できます。

詳細については、Zilliz Cloudドキュメントの[データインポート](./data-import)と[マイグレーション](./migrations)を参照してください。