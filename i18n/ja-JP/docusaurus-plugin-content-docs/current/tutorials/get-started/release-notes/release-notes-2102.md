---
title: "リリースノート（2024年10月14日） | Cloud"
slug: /release-notes-2102
sidebar_label: "2024年10月14日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回の Zilliz Cloud リリースでは、RAG、埋め込み、マルチモーダル検索などの高度な機能の例を提供する Notebook Gallery、容量が 50% 増加して CU あたり最大 150 万個の 768 次元ベクトルを収容できるようになり、大規模なデータ量ではコストを約 30% 削減できる可能性がある Performance-optimized CU の容量改善、Availability Zones（AZ）全体にワークロードとレプリカを分散することでクエリ性能と信頼性を高める Multi-replica Availability など、いくつかの重要なアップデートが導入されています。さらに、Zilliz Cloud は、アジア太平洋地域での性能向上のための AWS Tokyo Region、リアルタイムの監視とトラブルシューティングのための Prometheus Integration、および SSO を含む複数のログイン方法を提供する Auth0 による刷新された Authentication and Login System をサポートするようになりました。最後に、ユーザーは AWS Marketplace Free Trial を通じて Zilliz 製品を評価でき、性能とスケーラビリティのテストのためにコア機能にリスクなくアクセスできます。 | Cloud"
type: origin
token: PyrrwqrGbirtGTkh4oacaov7nHh
sidebar_position: 20
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年10月14日）

今回の Zilliz Cloud リリースでは、いくつかの重要なアップデートが導入されています。**Notebook Gallery** では、RAG、埋め込み、マルチモーダル検索などの高度な機能の例を提供します。**Performance-optimized CU の容量改善**では、容量が 50% 増加し、CU あたり最大 150 万個の 768 次元ベクトルを収容できるようになり、大規模なデータ量ではコストを約 30% 削減できる可能性があります。さらに、**Multi-replica Availability** は、Availability Zones（AZ）全体にワークロードとレプリカを分散することで、クエリ性能と信頼性を向上させます。また、Zilliz Cloud は、アジア太平洋地域での性能向上のための **AWS Tokyo Region**、リアルタイムの監視とトラブルシューティングのための **Prometheus Integration**、および SSO を含む複数のログイン方法を提供する、Auth0 によって刷新された **Authentication and Login System** をサポートするようになりました。最後に、ユーザーは **AWS Marketplace Free Trial** を通じて Zilliz 製品を評価でき、性能とスケーラビリティのテストのためにコア機能へリスクなくアクセスできます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Notebook Gallery\{#notebook-gallery}

今回のリリースで、Zilliz Cloud は Notebook Gallery を導入しました。このギャラリーでは、Zilliz Cloud の高度な機能を紹介する詳細な例を提供します。notebook は、RAG（Retrieval-Augmented Generation）、エージェント、埋め込み、テキスト検索、マルチモーダル検索、データ取り込み、移行、パフォーマンス最適化など、幅広いユースケースを扱います（ただし、これらに限定されるものではありません）。

今すぐ [notebooks](https://zilliz.com/learn/milvus-notebooks) をご覧ください！

### Performance-optimized CU の容量改善\{#improved-capacity-of-performance-optimized-cu}

今回のリリースにより、Performance-optimized CU（Compute Unit）の容量が 50% 増加しました。以前は、768 次元のベクトルで見積もると、各 Performance-optimized CU は約 100 万個のベクトルを保持できました。現在、容量は CU あたり 150 万個のベクトルに拡張されています。大規模なデータ量では、この改善により CU コストを約 30% 削減できます。

### Multi-replica の一般提供\{#multi-replica-generally-available}

Multi-replica が Zilliz Cloud で一般提供になりました。これにより、クラスターレベルのレプリケーションでクエリのスループットと可用性の両方を向上できます。

- **クエリ性能の向上**: 高い 1 秒あたりのクエリ数（QPS）を必要とするユーザー向けに、Multi-replica ではクエリのワークロードをレプリカ全体に分散できます。この並列処理により、全体的なスループットが向上し、レイテンシが低減され、クエリ集約型アプリケーションの効率が改善されます。ほとんどの場合、レプリカを追加するにつれて全体の QPS は線形に向上します。

- **可用性の強化**: Multi-replica は、複数の Availability Zones（AZ）にレプリカを分散することで、可用性を強化します。この構成により、AZ に障害が発生した場合でもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションに対してより高い信頼性を提供します。

- Multi-replica の構成方法の詳細については、[Plan クラスター Scaling](./plan-cluster-scaling) を参照してください。

### 新しい利用可能リージョン: AWS Tokyo\{#new-region-available-aws-tokyo}

Zilliz Cloud は AWS Tokyo リージョン（ap-northeast-1）で利用できるようになり、アジア太平洋地域のユーザーにレイテンシと性能の向上を提供します。

AWS Tokyo リージョンの料金の詳細については、[pricing page](https://zilliz.com/pricing) をご覧ください。

### Prometheus 統合のサポート\{#prometheus-integration-support}

Zilliz Cloud は Prometheus との統合をサポートするようになり、ユーザーはシステムメトリクスをリアルタイムで監視および可視化できます。この統合により、ユーザーはパフォーマンス、リソース使用量、システムの健全性を追跡でき、プロアクティブな監視と効率的なトラブルシューティングを実現できます。セットアップと構成の詳細については、[Integrate with Prometheus](./prometheus-monitoring) を参照してください。

### Auth0 による認証およびログインシステムの刷新\{#authentication-and-login-system-refactoring-with-auth0}

このリリースで、Zilliz Cloud は Auth0 を使用して認証およびログインシステムを刷新しました。Zilliz Cloud は現在、次の 3 つのログイン方法をサポートしています。

- メールアドレスによる登録とログイン。

- GitHub または Google 認証によるクイックログイン。

- エンタープライズのお客様向けの SSO ログイン。詳細については、[Single Sign-on with Okta](./single-sign-on) をご覧ください。

### AWS Marketplace Free Trial\{#aws-marketplace-free-trial}

このリリースにより、Zilliz Cloud のユーザーは AWS Marketplace Free Trial オプションを利用できます。これにより、より大きな購入を決定する前に、リスクのない環境で Zilliz 製品を試して評価する機会が得られます。このトライアルでは、プラットフォームのコア機能に完全にアクセスできるため、ユーザーは自分のアプリケーションとのパフォーマンス、スケーラビリティ、互換性を十分にテストできます。

[AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e) から Zilliz サービスを入手できます。
