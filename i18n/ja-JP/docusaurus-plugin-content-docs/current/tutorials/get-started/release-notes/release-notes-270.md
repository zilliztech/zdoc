---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_label: "2024年4月3日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このアップデートでは、Object Storage などのソースから簡単にデータを取り込める Zilliz Cloud の新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、さらに AWS S3、Google Cloud Storage、Azure Blob Storage から vector database インスタンスへ直接インポートできる Cross Cloud Data Import 機能など、強力なツールと機能強化が導入されました。これらの機能により、データ取り込み、検索精度、運用の可視性が向上し、クラウド上での vector database 管理がさらに効率化されます。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 24
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されました。Object Storage などのソースから簡単にデータを取り込める新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、さらに AWS S3、Google Cloud Storage、Azure Blob Storage から vector database インスタンスへ直接インポートできる Cross Cloud Data Import 機能が含まれます。これらの機能により、データ取り込み、検索精度、運用の可視性が向上し、クラウド上での vector database 管理がさらに効率化されます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud が Azure Marketplace で利用可能になり、Azure 上で当社の高度なフルマネージド vector database サービスにこれまで以上に簡単にアクセスできるようになりました。この新しい統合は、スケーラブルな AI アプリケーションへのニーズが高まり続ける重要なタイミングで提供されます。Zilliz Cloud が Azure Marketplace で利用可能になったことで、ユーザーは AI アプリケーションを迅速かつ容易に構築し、拡張できるようになります。今すぐ Azure 上の Zilliz Cloud の力を活用して、AI プロジェクトを加速させましょう。詳細は [Azure Marketplace 上の Zilliz Cloud](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) を参照してください。

### Connectors\{#connectors}

Connectors は、複数のデータソースから Zilliz Cloud にデータをストリーミングするために設計された組み込みツールで、Object Storage、Kafka（まもなくサポート予定）などに対応しています。たとえば、Object Storage connector には、指定された object storage bucket を監視し、PDF や HTML などのファイルを Zilliz Cloud Ingestion Pipelines に自動同期する機能があります。このプロセスにより、これらのファイルは vector 表現へ変換され、検索機能を強化するために当社の vector database に効率的にロードできるようになります。 

### Rerankers\{#rerankers}

Rerankers が Search Pipeline に統合され、関連性に基づいて検索結果をさらに洗練させたいユーザー向けのオプション機能として、検索品質を向上させます。このリリースでは、次の reranker オプションを導入します。

- zilliz/bge-reranker-base

### Metrics Monitoring 用 API\{#api-for-metrics-monitoring}

このリリースから、Zilliz Cloud は metrics monitoring 専用の API を提供します。新たに導入されたこの API により、30 を超える metrics の包括的なスイートにアクセスでき、システムのパフォーマンスと効率にとって重要なさまざまな側面を全体的に把握できます。

主な metrics の対象:

- リソース使用率の追跡: Compute Unit (CU) のリソース使用率に関する詳細なインサイトを取得し、コンピュート使用率とストレージ容量を追跡できます。

- 検索およびデータ挿入のパフォーマンス metrics: 特にレイテンシとスループットに重点を置いて、検索クエリとデータ挿入プロセスのパフォーマンスを評価できます。

- リクエスト失敗率: リクエストの失敗率を監視して潜在的な問題を迅速に特定し、トラブルシュートすることで、信頼性の高いアプリケーションパフォーマンスを確保できます。

- Collection および entity 統計: collections と entities に関する詳細な統計にアクセスし、より良いデータ管理を実現できます。

[API の詳細はこちら](/reference/restful/query-metrics)。

### Cross Cloud Data Import と移行機能の強化\{#cross-cloud-data-import-and-migration-enhancement}

これにより、Zilliz Cloud ユーザーは、AWS S3、Google Cloud Storage、Azure Blob Storage から、保存場所に関係なく、Zilliz Cloud 上の任意の vector database インスタンスへデータを簡単にインポートまたは移行できるようになりました。

詳細については、Zilliz Cloud ドキュメントの [Data Import Hands-On](./data-import-zero-to-hero) および [Zilliz から Zilliz への移行](./migrate-between-clusters) を参照してください。
