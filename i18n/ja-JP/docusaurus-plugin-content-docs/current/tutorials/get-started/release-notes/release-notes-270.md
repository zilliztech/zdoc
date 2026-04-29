---
title: "リリースノート（2024 年 4 月 3 日） | Cloud"
slug: /release-notes-270
sidebar_key: release-notes-270
sidebar_label: "2024 年 4 月 3 日"
beta: FALSE
notebook: FALSE
description: "このアップデートでは、オブジェクトストレージなどのソースからのデータ取り込みを容易にする Zilliz Cloud の新しいコネクタ、検索の関連性を向上させるリランカー、システム状態の詳細な分析を可能にするメトリクス監視 API、および AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへの直接インポートを可能にするクロスクラウドデータインポート機能など、強力なツールと機能強化が導入されました。これらの機能は、データの取り込み、検索精度、運用上の洞察を向上させ、クラウド上でのベクトルデータベースの管理を効率化します。 | Cloud"
type: origin
token: S7PMwgqGOiURCpkTFT4cTnTjnAc
sidebar_position: 21
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年4月3日）

今回のアップデートでは、Zilliz Cloud に強力なツールと機能強化が導入されました。オブジェクトストレージなどのソースから簡単にデータを取り込める新しいコネクタ、検索の関連性を向上させるリランカー、システム状態を詳細に分析するためのメトリクス監視 API、そして AWS S3、Google Cloud Storage、Azure Blob Storage からベクトルデータベースインスタンスへ直接データをインポートできるクロスクラウドデータインポート機能です。これらの機能により、データ取り込み、検索精度、運用上のインサイトが向上し、クラウド上でのベクトルデータベース管理がより効率的になります。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

### Azure Marketplace\{#azure-marketplace}

Zilliz Cloud が Azure Marketplace で利用可能になりました。これにより、ユーザーは Azure 上で当社の高度でフルマネージドのベクトルデータベースサービスにこれまで以上に簡単にアクセスできるようになります。スケーラブルな AI アプリケーションへのニーズが高まる中、この新たな統合は極めて重要なタイミングで提供されます。Azure Marketplace での Zilliz Cloud の利用により、ユーザーは迅速かつ容易に AI アプリケーションを構築・拡張できます。今すぐ Azure 上の Zilliz Cloud のパワーを活用して、AI プロジェクトを加速させましょう。詳細については、[Azure Marketplace での Zilliz Cloud](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) をご覧ください。

### コネクタ\{#connectors}

コネクタは、複数のデータソース（オブジェクトストレージ、まもなくサポート予定の Kafka など）から Zilliz Cloud にストリーミングデータを送り込むための組み込みツールです。たとえば、オブジェクトストレージコネクタは指定されたオブジェクトストレージバケットを監視し、PDF や HTML などのファイルを自動的に Zilliz Cloud のインジェスチョンパイプラインと同期できます。これにより、これらのファイルをベクトル表現に変換し、ベクトルデータベースに効率的に読み込んで、検索機能を強化することが可能になります。

### リランカー\{#rerankers}

リランカーが検索パイプラインに統合され、検索結果を関連性に基づいてさらに洗練したいユーザー向けに、オプションとして検索品質を向上させる機能が提供されるようになりました。今回のリリースでは、以下のリランカーオプションを導入しています。

- zilliz/bge-reranker-base

### メトリクス監視のための API\{#api-for-metrics-monitoring}

今回のリリースから、Zilliz Cloud はメトリクス監視専用の API を提供します。この新しく導入された API により、システムのパフォーマンスと効率にとって重要なさまざまな側面を包括的に把握できる、30 種類以上のメトリクスにアクセスできます。

主なメトリクスの内容：

- リソース使用率の追跡：コンピュートユニット（CU）のリソース使用率に関する深いインサイトを得て、コンピュート使用率やストレージ容量を追跡できます。

- 検索およびデータ挿入のパフォーマンスメトリクス：検索クエリやデータ挿入プロセスのパフォーマンスを評価でき、特にレイテンシとスループットに注目します。

- リクエスト失敗率：リクエストの失敗率を監視して、潜在的な問題を迅速に特定・トラブルシューティングし、アプリケーションの信頼性を確保します。

- コレクションおよびエンティティの統計情報：コレクションとエンティティに関する詳細な統計情報を取得し、データ管理を改善できます。

[API の詳細についてさらに知る](/reference/restful/query-metrics)

### クロスクラウドデータインポートおよび移行機能の強化\{#cross-cloud-data-import-and-migration-enhancement}

これにより、Zilliz Cloud ユーザーは、AWS S3、Google Cloud Storage、Azure Blob Storage から、Zilliz Cloud 上の任意のベクトルデータベースインスタンスへ、そのインスタンスがどこに配置されていようとも、簡単にデータをインポートまたは移行できるようになりました。

詳細については、Zilliz Cloud ドキュメントの [データインポート](./data-import) および [移行](./migrations) を参照してください。