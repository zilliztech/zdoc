---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_label: "2024年4月3日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されます。Object Storage などのソースから簡単にデータを取り込める新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへ直接インポートできる Cross Cloud Data Import 機能が含まれます。これらの機能が組み合わさることで、データ取り込み、検索精度、運用上の洞察が向上し、クラウドでのベクトルデータベースの管理が効率化されます。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 25
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されます。Object Storage などのソースから簡単にデータを取り込める新しい Connectors、検索の関連性を向上させる Rerankers、システム状態を詳細に分析するための Metrics Monitoring API、AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへ直接インポートできる Cross Cloud Data Import 機能が含まれます。これらの機能が組み合わさることで、データ取り込み、検索精度、運用上の洞察が向上し、クラウドでのベクトルデータベースの管理が効率化されます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud が Azure Marketplace で利用可能になり、ユーザーは Azure 上で当社の高度でフルマネージドのベクトルデータベースサービスにこれまで以上に簡単にアクセスできるようになりました。スケーラブルな AI アプリケーションへの需要が高まり続ける中、この新しい統合は極めて重要なタイミングで実現しました。Zilliz Cloud が Azure Marketplace で利用可能になったことで、ユーザーは AI アプリケーションを迅速かつ容易に構築・拡張できるようになりました。今すぐ Azure 上の Zilliz Cloud の力を活用して、AI プロジェクトを加速させましょう。詳細は、[Azure Marketplace の Zilliz Cloud](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) を参照してください。

### Connectors\{#connectors}

Connectors は、Object Storage、Kafka（まもなくサポート予定）などの複数のデータソースから Zilliz Cloud にデータをストリーミングするために設計された組み込みツールです。たとえば、Object Storage connector は、特定のオブジェクトストレージバケットを監視し、PDF や HTML などのファイルを Zilliz Cloud Ingestion Pipelines に自動的に同期できます。このプロセスにより、これらのファイルがベクトル表現に変換され、検索機能を強化するために当社のベクトルデータベースに効率的に読み込めるようになります。 

### Rerankers\{#rerankers}

Rerankers は Search Pipeline に統合され、関連性に基づいて検索結果を改善したいユーザー向けに、検索品質を高めるオプションの強化機能を提供します。このリリースでは、以下の reranker オプションを導入します。

- zilliz/bge-reranker-base

### メトリクス監視用 API\{#api-for-metrics-monitoring}

このリリース以降、Zilliz Cloud はメトリクス監視専用の API を提供します。この新たに導入された API を使用すると、30 を超える包括的なメトリクス群にアクセスでき、システムのパフォーマンスと効率にとって重要なさまざまな側面を全体的に把握できます。

主なメトリクス:

- リソース使用率の追跡: Compute Unit（CU）のリソース使用率に関する詳細な分析情報を取得でき、コンピュート使用率とストレージ容量を追跡できます。

- 検索とデータ挿入のパフォーマンスメトリクス: レイテンシーとスループットに特に注目して、検索クエリとデータ挿入プロセスのパフォーマンスを評価できます。

- リクエスト失敗率: リクエストの失敗率を監視して、潜在的な問題を迅速に特定・トラブルシューティングし、信頼性の高いアプリケーションのパフォーマンスを確保します。

- コレクションとエンティティの統計: コレクションとエンティティに関する詳細な統計にアクセスでき、データ管理の改善に役立ちます。

詳細は、[Discover more about the API details](/reference/restful/query-metrics) を参照してください。

### Cross Cloud Data Import と移行の強化\{#cross-cloud-data-import-and-migration-enhancement}

これにより、Zilliz Cloud ユーザーは、AWS S3、Google Cloud Storage、Azure Blob Storage から、データがどこに配置されているかに関係なく、Zilliz Cloud 上の任意のベクトルデータベースインスタンスへデータを簡単にインポートまたは移行できるようになりました。

詳細については、Zilliz Cloud ドキュメントの [データインポート ハンズオン](./data-import-zero-to-hero) および [Zilliz 間の移行](./migrate-between-clusters) を参照してください。
