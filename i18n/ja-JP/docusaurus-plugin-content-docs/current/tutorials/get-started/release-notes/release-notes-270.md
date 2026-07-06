---
title: "リリースノート（2024年4月3日） | Cloud"
slug: /release-notes-270
sidebar_key: release-notes-270
sidebar_label: "2024年4月3日"
beta: FALSE
notebook: FALSE
description: "今回のアップデートでは、Zilliz Cloud の強力なツールと機能強化が導入されました。オブジェクトストレージなどからの簡単なデータ取り込みを実現する新しい Connectors、検索の関連性を向上させる Rerankers、システム状態の詳細な分析を可能にする Metrics Monitoring API、および AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへの直接インポートを可能にする Cross Cloud Data Import 機能です。これらの機能が組み合わさることで、データの取り込み、検索の精度、運用の可視性が向上し、クラウド上でのベクトルデータベースの管理が効率化されます。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 23
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

このアップデートでは、Zilliz Cloud の強力なツールと機能強化が導入されています：Object Storage などのソースからの簡単なデータ取り込みのための新しい Connectors、検索関連性を向上させる Rerankers、システム状態の詳細な分析のための Metrics Monitoring API、および AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへの直接インポートを可能にする Cross Cloud データインポート 機能です。これらの機能が組み合わさることで、データ取り込み、検索精度、運用インサイトが向上し、クラウドでのベクトルデータベースの管理が効率化されます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud が Azure Marketplace で利用可能になり、Azure 上で当社の高度なフルマネージドベクトルデータベースサービスにアクセスすることがこれまで以上に簡単になりました。この新しい統合は、スケーラブルな AI アプリケーションの需要が継続的に高まる重要な時期に登場しました。Zilliz Cloud が Azure Marketplace で利用可能になったことで、ユーザーは AI アプリケーションを迅速に構築し、簡単に拡張することができます。今日から Azure 上の Zilliz Cloud のパワーを活用して、AI プロジェクトを加速させましょう。詳細については、[Zilliz Cloud on Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) を参照してください。

### Connectors\{#connectors}

Connectors は、Object Storage、Kafka（近日対応予定）など、複数のデータソースから Zilliz Cloud にストリーミングデータを取り込むために設計された組み込みツールです。例えば、Object Storage connector は、指定されたオブジェクトストレージバケットを監視し、PDF や HTML などのファイルを Zilliz Cloud Ingestion Pipelines に自動的に同期する機能を持っています。このプロセスにより、これらのファイルをベクトル表現に変換し、効率的に当社のベクトルデータベースに読み込んで、検索機能を強化することができます。

### Rerankers\{#rerankers}

Rerankers が Search Pipeline に統合され、関連性によって検索結果を絞り込むことで検索品質を向上させたいユーザーにとって、オプションの機能強化を提供します。このリリースでは、以下の reranker オプションを導入しています：

- zilliz/bge-reranker-base

### Metrics Monitoring 用 API\{#api-for-metrics-monitoring}

このリリースから、Zilliz Cloud はメトリクス監視専用の API を提供します。この新しく導入された API により、30 以上の包括的なメトリクススイートにアクセスでき、システムのパフォーマンスと効率性に重要なさまざまな側面を包括的に把握することができます。

キーメトリクスの対象範囲：

- リソース使用率の追跡：Compute Unit（CU）のリソース使用率に関する深いインサイトを得て、コンピュート使用率とストレージ容量を追跡できます。

- 検索およびデータ挿入のパフォーマンスメトリクス：検索クエリとデータ挿入プロセスのパフォーマンスを評価し、特にレイテンシとスループットに焦点を当てます。

- リクエスト失敗率：リクエストの失敗率を監視して、潜在的な問題を迅速に特定し、トラブルシューティングを行い、アプリケーションの信頼性の高いパフォーマンスを確保します。

- コレクションおよびエンティティの統計情報：コレクションとエンティティに関する詳細な統計情報にアクセスし、データ管理を改善します。

[API の詳細についてさらに確認する](/reference/restful/query-metrics)。

### Cross Cloud データインポート および移行の機能強化\{#cross-cloud-data-import-and-migration-enhancement}

これで、Zilliz Cloud ユーザーは AWS S3、Google Cloud Storage、Azure Blob Storage から、Zilliz Cloud 上のどのベクトルデータベースインスタンスに対しても、場所に関係なく、簡単にデータをインポートまたは移行できます。

詳細については、Zilliz Cloud ドキュメントの [データインポート](./data-import) および [移行](./migrations) を参照してください。