---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_label: "2024年4月3日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されます。Object Storage などのソースから簡単にデータを取り込める新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、さらに AWS S3、Google Cloud Storage、Azure Blob Storage から vector database インスタンスへ直接インポートできる Cross Cloud Data Import 機能が含まれます。これらの機能により、データ取り込み、検索精度、運用の可視性が向上し、クラウド上での vector databases の管理が効率化されます。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 24
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されます。Object Storage などのソースから簡単にデータを取り込める新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、さらに AWS S3、Google Cloud Storage、Azure Blob Storage から vector database インスタンスへ直接インポートできる Cross Cloud Data Import 機能が含まれます。これらの機能により、データ取り込み、検索精度、運用の可視性が向上し、クラウド上での vector databases の管理が効率化されます。

### Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud は Azure Marketplace で利用可能になり、Azure 上で当社の高度なフルマネージド vector database サービスにこれまで以上に簡単にアクセスできるようになりました。スケーラブルな AI アプリケーションの需要が高まり続ける中、この新しい統合は非常に重要なタイミングで提供されます。Zilliz Cloud が Azure Marketplace に登場したことで、ユーザーは AI アプリケーションを迅速かつ容易に構築し、拡張できるようになりました。今すぐ Azure 上の Zilliz Cloud の力を活用して、AI プロジェクトを加速させましょう。詳細は [Azure Marketplace 上の Zilliz Cloud](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) を参照してください。

### Connectors\{#connectors}

Connectors は、複数のデータソースから Zilliz Cloud にデータをストリーミングするために設計された組み込みツールであり、Object Storage、Kafka（近日対応予定）などに対応しています。たとえば、Object Storage connector は指定された object storage bucket を監視し、PDF や HTML などのファイルを自動的に Zilliz Cloud Ingestion Pipelines に同期できます。このプロセスにより、これらのファイルは vector 表現に変換され、強化された検索機能のために当社の vector database に効率的にロードできるようになります。 

### Rerankers\{#rerankers}

Rerankers は Search Pipeline に統合され、関連性に基づいて検索結果をさらに洗練したいユーザー向けのオプション機能として、検索品質を向上させます。このリリースでは、以下の reranker オプションを導入します。

- zilliz/bge-reranker-base

### API for Metrics Monitoring\{#api-for-metrics-monitoring}

このリリース以降、Zilliz Cloud は metrics monitoring 専用の API を提供します。この新たに導入された API により、30 を超える包括的な metrics セットにアクセスでき、システムのパフォーマンスと効率にとって重要なさまざまな側面を全体的に把握できます。

主な metrics の対象:

- リソース使用率の追跡: Compute Unit (CU) のリソース使用率に関する詳細な分析情報を取得し、コンピュート使用率とストレージ容量を追跡できます。

- 検索およびデータ挿入のパフォーマンス metrics: レイテンシーとスループットに特に注目しながら、検索クエリとデータ挿入プロセスのパフォーマンスを評価できます。

- リクエスト失敗率: リクエストの失敗率を監視して、潜在的な問題を迅速に特定およびトラブルシューティングし、信頼性の高いアプリケーションパフォーマンスを確保します。

- Collection および entity の統計: collections と entities に関する詳細な統計にアクセスし、データ管理の改善に役立てることができます。

[API の詳細を見る](/reference/restful/query-metrics)。

### Cross Cloud Data Import and Migration Enhancement\{#cross-cloud-data-import-and-migration-enhancement}

現在、Zilliz Cloud ユーザーは、AWS S3、Google Cloud Storage、Azure Blob Storage から、配置場所に関係なく、Zilliz Cloud 上の任意の vector database インスタンスへ簡単にデータをインポートまたは移行できるようになりました。

詳細については、Zilliz Cloud ドキュメントの [Data Import Hands-On](./data-import-zero-to-hero) および [Zilliz to Zilliz Migrations](./migrate-between-clusters) を参照してください。
