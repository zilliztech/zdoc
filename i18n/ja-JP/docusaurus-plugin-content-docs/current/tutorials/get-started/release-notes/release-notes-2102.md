---
title: "リリースノート（2024年10月14日） | Cloud"
slug: /release-notes-2102
sidebar_label: "2024年10月14日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この Zilliz Cloud リリースでは、RAG、embeddings、マルチモーダル検索などの高度な機能に関する例を提供する Notebook Gallery、容量が 50% 増加し、CU あたり最大 150 万件の 768-dim vector を収容でき、大規模データではコストを 30% 削減できる可能性がある Performance-optimized CU の容量向上、そして Availability Zones（AZs）全体にワークロードと replicas を分散することでクエリ性能と信頼性を高める Multi-replica Availability など、いくつかの重要な更新が導入されました。さらに、Zilliz Cloud はアジア太平洋地域での性能向上のため AWS Tokyo Region をサポートし、リアルタイム監視とトラブルシューティングのための Prometheus Integration、そして SSO を含む複数のログイン方法を提供する Auth0 による刷新された Authentication and Login System を提供します。最後に、ユーザーは AWS Marketplace Free Trial を通じて Zilliz 製品を評価でき、性能およびスケーラビリティのテストのために主要機能へリスクなくアクセスできます。 | Cloud"
type: origin
token: PyrrwqrGbirtGTkh4oacaov7nHh
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年10月14日）

この Zilliz Cloud リリースでは、いくつかの重要な更新が導入されています。**Notebook Gallery** では、RAG、embeddings、マルチモーダル検索などの高度な機能に関する例を提供します。**Performance-optimized CU の容量向上**では、容量が 50% 増加し、CU あたり最大 150 万件の 768-dim vector を収容できるようになり、大規模データではコストを 30% 削減できる可能性があります。また、**Multi-replica Availability** により、Availability Zones（AZs）全体にワークロードと replicas を分散することで、クエリ性能と信頼性が向上します。さらに、Zilliz Cloud はアジア太平洋地域での性能向上のため **AWS Tokyo Region** をサポートし、リアルタイム監視とトラブルシューティングのための **Prometheus Integration**、そして SSO を含む複数のログイン方法を提供する、Auth0 による刷新された **Authentication and Login System** を提供します。最後に、ユーザーは **AWS Marketplace Free Trial** を通じて Zilliz 製品を評価でき、性能およびスケーラビリティのテストのために主要機能へリスクなくアクセスできます。

### Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Notebook Gallery\{#notebook-gallery}

このリリースで、Zilliz Cloud は Notebook Gallery を導入しました。このギャラリーでは、Zilliz Cloud の高度な機能を紹介する詳細な例を提供します。Notebook は、RAG（Retrieval-Augmented Generation）、agents、embeddings、テキスト検索、マルチモーダル検索、データ取り込み、移行、パフォーマンス最適化など、幅広いユースケースをカバーしています。

今すぐ [notebooks](https://zilliz.com/learn/milvus-notebooks) をご覧ください。

### Improved Capacity of Performance-optimized CU\{#improved-capacity-of-performance-optimized-cu}

このリリースにより、Performance-optimized CU（Compute Unit）の容量が 50% 増加しました。以前は、768-dimension vector で見積もった場合、各 Performance-optimized CU は約 100 万件の vectors を保持できました。現在では、CU あたり 150 万件の vectors まで容量が強化されています。大規模データでは、この改善により CU コストを約 30% 削減できます。

### Multi-replica Generally Available\{#multi-replica-generally-available}

Multi-replica が Zilliz Cloud で一般提供となり、cluster レベルのレプリケーションによってクエリスループットと可用性の両方を向上できるようになりました。

- **クエリ性能の向上**: 高い 1 秒あたりクエリ数（QPS）を必要とするユーザーに対して、Multi-replica はクエリワークロードを replicas 間に分散できます。この並列処理により、全体的なスループットが向上し、レイテンシが低減され、クエリ集約型アプリケーションの効率が改善されます。ほとんどの場合、replicas を追加するにつれて全体の QPS は線形に向上します。

- **可用性の強化**: Multi-replica は、複数の Availability Zones（AZs）に replicas を分散することで可用性を強化します。この構成により、AZ 障害が発生した場合でもデータへの継続的なアクセスが保証され、ミッションクリティカルなアプリケーションに対してより高い信頼性を提供します。

- Multi-replica の設定の詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

### New Region Available: AWS Tokyo\{#new-region-available-aws-tokyo}

Zilliz Cloud が AWS Tokyo リージョン（ap-northeast-1）で利用可能になり、アジア太平洋地域のユーザーに改善されたレイテンシと性能を提供します。

AWS Tokyo リージョンの価格の詳細については、[pricing page](https://zilliz.com/pricing) をご覧ください。

### Prometheus Integration Support\{#prometheus-integration-support}

Zilliz Cloud は Prometheus との統合をサポートするようになり、ユーザーはシステムメトリクスをリアルタイムで監視および可視化できます。この統合により、パフォーマンス、リソース使用量、システムの健全性を追跡できるため、プロアクティブな監視と効率的なトラブルシューティングが可能になります。セットアップと設定の詳細については、[Integrate with Prometheus](./prometheus-monitoring) を参照してください。

### Authentication and Login System Refactoring with Auth0\{#authentication-and-login-system-refactoring-with-auth0}

このリリースで、Zilliz Cloud は Auth0 を使用して認証およびログインシステムを刷新しました。Zilliz Cloud は現在、次の 3 つのログイン方法をサポートしています。 

- メールによる登録とログイン。

- GitHub または Google 認証によるクイックログイン。

- エンタープライズ顧客向けの SSO ログイン。詳細については、[Single Sign-on with Okta](./single-sign-on) をご覧ください。

### AWS Marketplace Free Trial\{#aws-marketplace-free-trial}

このリリースにより、Zilliz Cloud ユーザーは AWS Marketplace Free Trial オプションを利用できるようになりました。これにより、より大きな購入判断を行う前に、リスクのない環境で Zilliz 製品を探索および評価する機会が提供されます。この試用版では、プラットフォームの主要機能に完全にアクセスできるため、パフォーマンス、スケーラビリティ、およびアプリケーションとの互換性を十分にテストできます。

[AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e) から Zilliz サービスをご利用ください。
