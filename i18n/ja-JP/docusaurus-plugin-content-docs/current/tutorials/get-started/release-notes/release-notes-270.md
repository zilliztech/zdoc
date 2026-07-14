---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_label: "2024年4月3日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このアップデートでは、Object Storage などのソースから簡単にデータを取り込むための新しい Connectors、検索関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、そして AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへ直接インポートできる Cross Cloud Data Import 機能など、Zilliz Cloud に強力なツールと機能強化が導入されました。これらの機能により、データ取り込み、検索精度、運用上の可視性が向上し、クラウドにおけるベクトルデータベースの管理が効率化されます。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートでは、Object Storage などのソースから簡単にデータを取り込むための新しい Connectors、検索関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、そして AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへ直接インポートできる Cross Cloud Data Import 機能など、Zilliz Cloud に強力なツールと機能強化が導入されました。これらの機能により、データ取り込み、検索精度、運用上の可視性が向上し、クラウドにおけるベクトルデータベースの管理が効率化されます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud が Azure Marketplace で利用可能になり、Azure 上で当社の高度なフルマネージドベクトルデータベースサービスにこれまで以上に簡単にアクセスできるようになりました。スケーラブルな AI アプリケーションへの需要が高まり続ける中、この新しい統合は極めて重要なタイミングで提供されます。Zilliz Cloud が Azure Marketplace で利用可能になったことで、ユーザーは AI アプリケーションを迅速かつ容易に構築・拡張できるようになりました。Azure 上の Zilliz Cloud の力を活用して、今すぐ AI プロジェクトを加速させましょう。詳細は [Azure Marketplace 上の Zilliz Cloud](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) をご覧ください。

### Connectors\{#connectors}

Connectors は、複数のデータソースから Zilliz Cloud にデータをストリーミングするために設計された組み込みツールで、Object Storage、Kafka（まもなくサポート予定）などを対象としています。たとえば、Object Storage connector には、指定されたオブジェクトストレージバケットを監視し、PDF や HTML などのファイルを Zilliz Cloud Ingestion Pipelines に自動同期する機能があります。このプロセスにより、これらのファイルはベクトル表現に変換され、検索機能を強化するために当社のベクトルデータベースに効率的にロードできるようになります。 

### Rerankers\{#rerankers}

Rerankers が Search Pipeline に統合され、関連性に基づいて検索結果を洗練し、検索品質を向上させたいユーザー向けのオプション機能として利用できるようになりました。このリリースでは、次の reranker オプションを導入します。

- zilliz/bge-reranker-base

### Metrics Monitoring 用 API\{#api-for-metrics-monitoring}

このリリースより、Zilliz Cloud はメトリクス監視専用の API を提供します。この新たに導入された API により、30 を超えるメトリクスの包括的なスイートにアクセスでき、システムのパフォーマンスと効率に重要なさまざまな側面を総合的に把握できます。

主なメトリクスの対象:

- リソース使用率の追跡: Compute Unit (CU) リソースの使用率に関する深い洞察を取得し、コンピューティング使用率とストレージ容量を追跡できます。

- 検索およびデータ挿入パフォーマンスのメトリクス: レイテンシとスループットに特に重点を置きながら、検索クエリおよびデータ挿入プロセスのパフォーマンスを評価できます。

- リクエスト失敗率: リクエストの失敗率を監視して潜在的な問題を迅速に特定・トラブルシューティングし、信頼性の高いアプリケーションパフォーマンスを確保できます。

- コレクションおよびエンティティ統計: コレクションとエンティティに関する詳細な統計にアクセスし、データ管理の改善に役立てることができます。

API の詳細については、[こちら](/reference/restful/query-metrics)をご覧ください。

### Cross Cloud Data Import と移行機能の強化\{#cross-cloud-data-import-and-migration-enhancement}

現在、Zilliz Cloud ユーザーは、AWS S3、Google Cloud Storage、Azure Blob Storage から、保存場所に関係なく、Zilliz Cloud 上の任意のベクトルデータベースインスタンスへデータを簡単にインポートまたは移行できます。

詳細については、Zilliz Cloud ドキュメントの [Data Import Hands-On](./data-import-zero-to-hero) および [Zilliz to Zilliz Migrations](./migrate-between-clusters) をご覧ください。
