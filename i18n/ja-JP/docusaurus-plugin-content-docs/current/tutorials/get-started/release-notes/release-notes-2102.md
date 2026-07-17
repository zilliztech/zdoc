---
title: "リリースノート（2024年10月14日） | Cloud"
slug: /release-notes-2102
sidebar_label: "2024年10月14日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースの Zilliz Cloud では、RAG、embeddings、multi-modal search などの高度な機能の例を提供する Notebook Gallery、Performance-optimized CU の容量を 50% 向上させ、CU あたり最大 150 万個の 768-dim vectors を格納可能にし、大規模データ量ではコストを最大 30% 削減できる Improved Capacity of Performance-optimized CU、そして Availability Zones（AZs）全体にワークロードと replicas を分散することでクエリ性能と信頼性を向上させる Multi-replica Availability など、複数の重要な更新が導入されています。さらに、Zilliz Cloud はアジア太平洋地域での性能向上のための AWS Tokyo Region、リアルタイム監視とトラブルシューティングのための Prometheus Integration、SSO を含む複数のログイン方法を提供する Auth0 を用いた刷新された Authentication and Login System をサポートするようになりました。最後に、ユーザーは AWS Marketplace Free Trial を通じて Zilliz 製品を評価でき、性能およびスケーラビリティのテストのために主要機能へリスクなくアクセスできます。 | Cloud"
type: origin
token: PyrrwqrGbirtGTkh4oacaov7nHh
sidebar_position: 19
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年10月14日）

このリリースの Zilliz Cloud では、いくつかの重要な更新が導入されています。**Notebook Gallery** では、RAG、embeddings、multi-modal search などの高度な機能の例を提供します。**Improved Capacity of Performance-optimized CU** では容量が 50% 増加し、CU あたり最大 150 万個の 768-dim vectors を格納可能となり、大規模データ量ではコストを 30% 削減できる可能性があります。さらに、**Multi-replica Availability** により、Availability Zones（AZs）全体にワークロードと replicas を分散して、クエリ性能と信頼性を向上させます。加えて、Zilliz Cloud はアジア太平洋地域での性能向上のための **AWS Tokyo Region**、リアルタイム監視とトラブルシューティングのための **Prometheus Integration**、そして SSO を含む複数のログイン方法を提供する、Auth0 を用いた刷新された **Authentication and Login System** をサポートするようになりました。最後に、ユーザーは **AWS Marketplace Free Trial** を通じて Zilliz 製品を評価でき、性能およびスケーラビリティをテストするために主要機能へリスクなくアクセスできます。

### Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Notebook Gallery\{#notebook-gallery}

このリリースでは、Zilliz Cloud は Notebook Gallery を導入しました。このギャラリーでは、Zilliz Cloud の高度な機能を紹介する詳細な例を提供します。notebooks は、RAG（Retrieval-Augmented Generation）、agents、embeddings、text search、multi-modal search、data ingestion、migration、performance optimization などを含む幅広いユースケースをカバーしています。

今すぐ [notebooks](https://zilliz.com/learn/milvus-notebooks) をご覧ください。

### Improved Capacity of Performance-optimized CU\{#improved-capacity-of-performance-optimized-cu}

このリリースでは、Performance-optimized CU（Compute Unit）の容量が 50% 向上しました。以前は、各 Performance-optimized CU は 768-dimension vectors で見積もった場合、約 100 万 vectors を保持できました。現在では、容量が CU あたり 150 万 vectors に向上しています。大規模データ量では、この改善により CU コストを約 30% 削減できます。

### Multi-replica Generally Available\{#multi-replica-generally-available}

Zilliz Cloud で Multi-replica が一般提供になり、cluster レベルのレプリケーションによってクエリのスループットと可用性の両方を向上できるようになりました。

- **クエリ性能の向上**: 高い query-per-second（QPS）を必要とするユーザーにとって、Multi-replica はクエリワークロードを replicas 全体に分散できます。この並列処理により、全体的なスループットが向上し、レイテンシが低減され、クエリ集約型アプリケーションの効率が改善されます。ほとんどの場合、全体の QPS は replicas を追加するにつれて線形に向上します。

- **可用性の強化**: Multi-replica は、複数の Availability Zones（AZs）に replicas を分散することで可用性を強化します。この構成により、AZ 障害が発生した場合でもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションに対してより高い信頼性を提供します。

- Multi-replica の設定方法の詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

### New Region Available: AWS Tokyo\{#new-region-available-aws-tokyo}

Zilliz Cloud は現在、AWS Tokyo region（ap-northeast-1）で利用可能であり、アジア太平洋地域のユーザーに改善されたレイテンシと性能を提供します。

AWS Tokyo region の価格詳細を確認するには、[pricing page](https://zilliz.com/pricing) をご覧ください。

### Prometheus Integration Support\{#prometheus-integration-support}

Zilliz Cloud は現在、Prometheus との統合をサポートしており、ユーザーはシステムメトリクスをリアルタイムで監視および可視化できます。この統合により、ユーザーは性能、リソース使用量、システムの健全性を追跡でき、プロアクティブな監視と効率的なトラブルシューティングを実現できます。セットアップおよび設定の詳細については、[Integrate with Prometheus](./prometheus-monitoring) を参照してください。

### Authentication and Login System Refactoring with Auth0\{#authentication-and-login-system-refactoring-with-auth0}

このリリースでは、Zilliz Cloud は Auth0 を使用して認証およびログインシステムを刷新しました。Zilliz Cloud は現在、3 つのログイン方法をサポートしています。 

- Email による登録とログイン。

- GitHub または Google 認証によるクイックログイン。

- エンタープライズ顧客向けの SSO ログイン。詳細については、[Single Sign-on with Okta](./single-sign-on) をご覧ください。

### AWS Marketplace Free Trial\{#aws-marketplace-free-trial}

このリリースにより、Zilliz Cloud ユーザーは AWS Marketplace Free Trial オプションを利用できるようになりました。これにより、より大きな購入判断を行う前に、リスクのない環境で Zilliz 製品を探索および評価する機会が提供されます。このトライアルでは、プラットフォームの主要機能に完全にアクセスできるため、ユーザーは性能、スケーラビリティ、および自社アプリケーションとの互換性を徹底的にテストできます。

[AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e) から Zilliz サービスを入手してください。
