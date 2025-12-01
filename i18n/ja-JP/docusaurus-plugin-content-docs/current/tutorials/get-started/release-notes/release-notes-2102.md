---
title: "リリースノート (2024年10月14日) | Cloud"
slug: /release-notes-2102
sidebar_label: "リリースノート (2024年10月14日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのこのリリースでは、RAG、埋め込み、マルチモーダル検索などの高度な機能に関する例を提供するNotebookギャラリー、パフォーマンス最適化CUの容量が50%向上し、CUあたり最大150万個の768次元ベクトルを収容可能になり、大容量データでは最大30%のコスト削減が見込まれる、可用性ゾーン（AZ）にまたがるワークロードとレプリカを分散することでクエリパフォーマンスと信頼性を向上させるマルチレプリカ可用性、などの重要なアップデートを紹介します。さらに、Zilliz Cloudはアジア太平洋地域でのパフォーマンス向上のためのAWS東京リージョン、リアルタイム監視およびトラブルシューティングのためのPrometheus統合、SSOを含む複数のログイン方法を提供するAuth0による認証およびログインシステムの刷新をサポートするようになりました。最後に、ユーザーはAWS Marketplace無料トライアルを通じてZilliz製品を評価でき、パフォーマンスとスケーラビリティのテストのためのコア機能へのリスクフリーなアクセスを提供します。 | Cloud"
type: origin
token: PyrrwqrGbirtGTkh4oacaov7nHh
sidebar_position: 11
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';


# リリースノート (2024年10月14日)

Zilliz Cloudのこのリリースでは、いくつかの重要なアップデートを紹介します：RAG、埋め込み、マルチモーダル検索などの高度な機能に関する例を提供する**Notebookギャラリー**、容量が50%向上し、CUあたり最大150万個の768次元ベクトルを収容可能になり、大容量データでは最大30%のコスト削減が見込まれる**パフォーマンス最適化CUの容量向上**、可用性ゾーン（AZ）にまたがるワークロードとレプリカを分散することでクエリパフォーマンスと信頼性を向上させる**マルチレプリカ可用性**。さらに、Zilliz Cloudはアジア太平洋地域でのパフォーマンス向上のための**AWS東京リージョン**、リアルタイム監視およびトラブルシューティングのための**Prometheus統合**、SSOを含む複数のログイン方法を提供するAuth0による**認証およびログインシステムの刷新**をサポートするようになりました。最後に、ユーザーは**AWS Marketplace無料トライアル**を通じてZilliz製品を評価でき、パフォーマンスとスケーラビリティのテストのためのコア機能へのリスクフリーなアクセスを提供します。

### Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.4.x**と互換性があります。

### Notebookギャラリー\{#notebook-gallery}

このリリースで、Zilliz CloudはNotebookギャラリーを導入します。このギャラリーは、Zilliz Cloudの高度な機能を紹介する詳細な例を提供します。Notebookは、RAG（検索拡張生成）、エージェント、埋め込み、テキスト検索、マルチモーダル検索、データインジェスト、移行、パフォーマンス最適化など、さまざまなユースケースをカバーしています。

今すぐ[Notebook](https://zilliz.com/learn/milvus-notebooks)を探索してください！

### パフォーマンス最適化CU容量の向上\{#improved-capacity-of-performance-optimized-cu}

このリリースにより、パフォーマンス最適化CU（コンピュートユニット）の容量が50%向上しました。以前は、768次元ベクトルで推定した場合、各パフォーマンス最適化CUは約100万ベクトルを保持できました。現在、容量はCUあたり150万ベクトルに強化されました。大容量データでは、この改善によりCUコストを約30%削減できます。

### マルチレプリカ一般提供\{#multi-replica-generally-available}

マルチレプリカはZilliz Cloudで一般提供となり、クエリスループットと可用性の両方を向上させるクラスターレベルのレプリケーションを可能にします。

- **クエリ性能の向上**：1秒あたりのクエリ数（QPS）が必要なユーザー向けに、マルチレプリカではクエリワークロードをレプリカ間で分散できます。この並列処理により、全体的なスループットが向上し、レイテンシが削減され、クエリ集約型アプリケーションの効率が向上します。ほとんどの場合、レプリカを追加するにつれて全体的なQPSが直線的に向上します。

- **可用性の強化**：マルチレプリカは、複数の可用性ゾーン（AZ）にレプリカを分散することで可用性を強化します。この構成により、AZの停止が発生した場合でもデータへの継続的なアクセスを確保し、ミッションクリティカルアプリケーションに大きな信頼性を提供します。

- マルチレプリカの構成の詳細については、[レプリカ管理](./manage-replica)を参照してください。

### 利用可能新リージョン：AWS東京\{#new-region-available-aws-tokyo}

Zilliz CloudはAWS東京リージョン（ap-northeast-1）で利用可能になり、アジア太平洋地域のユーザーに改善されたレイテンシとパフォーマンスを提供します。

AWS東京リージョンの価格詳細については、[価格ページ](https://zilliz.com/pricing)にアクセスしてください。

### Prometheus統合サポート\{#prometheus-integration-support}

Zilliz CloudはPrometheusとの統合をサポートするようになり、ユーザーはリアルタイムでシステムメトリクスを監視および視覚化できます。この統合により、ユーザーはパフォーマンス、リソース使用量、およびシステムの健全性を追跡し、能動的な監視と効率的なトラブルシューティングを確保できます。設定および構成の詳細については、[Prometheusとの統合](./prometheus-monitoring)を参照してください。

### Auth0による認証およびログインシステムのリファクタリング\{#authentication-and-login-system-refactoring-with-auth0}

このリリースで、Zilliz CloudはAuth0を使用して認証およびログインシステムを刷新しました。Zilliz Cloudは現在3つのログイン方法をサポートしています：

- メール登録およびログイン。

- GitHubまたはGoogle認証によるクイックログイン。

- 企業顧客のためのSSOログイン。詳細については、[Oktaによるシングルサインオン](./single-sign-on)を参照してください。

### AWS Marketplace無料トライアル\{#aws-marketplace-free-trial}

このリリースにより、Zilliz CloudユーザーはAWS Marketplace無料トライアルオプションを活用できるようになり、より大きな購入決定を行う前にリスクフリーな環境でZilliz製品を探索および評価する機会を提供します。このトライアルはプラットフォームのコア機能への完全なアクセスを提供し、ユーザーがアプリケーションとのパフォーマンス、スケーラビリティ、および互換性を徹底的にテストできるようにします。

[AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e)を通じてZillizサービスを取得してください。