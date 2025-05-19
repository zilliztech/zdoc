---
title: "リリースノート（2024年10月14日） | Cloud"
slug: /release-notes-2102
sidebar_label: "リリースノート（2024年10月14日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのこのリリースでは、いくつかの主要なアップデートが導入されています。Notebook Galleryでは、RAG、埋め込み、マルチモーダル検索などの高度な機能の例が提供されます。Improved Capacity ofPerformance-optimizedCUは50%増加し、CUあたり最大150万個の768-dimベクトルを収容し、大量のデータに対してコストを30%削減する可能性があります。そして、マルチレプリカアベイラビリティは、ワークロードとレプリカをアベイラビリティゾーン(AZ)全体に分散することで、クエリのパフォーマンスと信頼性を向上させます。さらに、Zilliz Cloudは現在、アジア太平洋地域でのパフォーマンス向上のためのAWS Tokyo Region、リアルタイムモニタリングとトラブルシューティングのためのPrometheus Integration、およびSSOを含む複数のログイン方法を提供する改良されたAuthentication and Login System with Auth 0をサポートしています。最後に、ユーザーはAWS Marketplace Free Trialを通じてZilliz製品を評価でき、パフォーマンスとスケーラビリティのテストのためのコア機能へのリスクフリーアクセスを提供します。 | Cloud"
type: origin
token: Anm3wgkIeibZapkuZr7cb5lqn9B
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年10月14日）

Zilliz Cloudのこのリリースでは、いくつかの主要なアップデートが導入されています。**Notebook Gallery**では、RAG、埋め込み、マルチモーダル検索などの高度な機能の例が提供されます。**Improved Capacity ofPerformance-optimizedCU**は50%増加し、CUあたり最大150万個の768-dimベクトルを収容し、大量のデータに対してコストを30%削減する可能性があります。そして、**マルチレプリカアベイラビリティ**は、ワークロードとレプリカをアベイラビリティゾーン(AZ)全体に分散することで、クエリのパフォーマンスと信頼性を向上させます。さらに、Zilliz Cloudは現在、アジア太平洋地域でのパフォーマンス向上のための**AWS Tokyo Region**、リアルタイムモニタリングとトラブルシューティングのための**Prometheus Integration**、およびSSOを含む複数のログイン方法を提供する改良された**Authentication and Login System with Auth 0**をサポートしています。最後に、ユーザーは**AWS Marketplace Free Trial**を通じてZilliz製品を評価でき、パフォーマンスとスケーラビリティのテストのためのコア機能へのリスクフリーアクセスを提供します。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.4. x**と互換性があります。

### ノートブックギャラリー{#notebook-gallery}

このリリースでは、Zilliz CloudはNotebook Galleryを紹介しています。このギャラリーでは、Zilliz Cloudの高度な機能を紹介する詳細な例が提供されています。Notebookは、RAG(Retrieval-Augmented Generation)、エージェント、埋め込み、テキスト検索、マルチモーダル検索、データ取り込み、移行、パフォーマンス最適化など、幅広いユースケースをカバーしています。

今すぐ[ノートブック](https://zilliz.com/learn/milvus-notebooks)を探検しよう!

### CUのPerformance-optimized能力の向上{#improved-capacity-of-performance-optimized-cu}

このリリースにより、performance-optimizedCU(Compute Unit)の容量が50%増加しました。以前は、各performance-optimizedCUには768次元ベクトルで推定される約100万個のベクトルを保持できました。現在、容量はCUあたり150万個のベクトルに強化されています。この改善により、大量のデータに対してCUコストを約30%削減できます。

### 一般的にマルチレプリカが利用可能です{#multi-replica-generally-available}

Zilliz Cloudでは、マルチレプリカが一般的に利用可能になりました。これにより、クラスターレベルのレプリケーションが可能になり、クエリのスループットと可用性の両方が向上します。

- **改善されたクエリパフォーマンス**:高いクエリ毎秒(QPS)を必要とするユーザーにとって、マルチレプリカはクエリワークロードをレプリカ全体に分散させることができます。この並列処理により、全体的なスループットが向上し、レイテンシが減少し、クエリ集中型アプリケーションの効率が向上します。ほとんどの場合、レプリカが追加されるにつれて、全体的なQPSは線形に改善されます。

- **拡張可用性**:マルチレプリカは、複数の可用性ゾーン(AZ)にレプリカを配布することで可用性を強化します。この設定により、AZの障害が発生してもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションの信頼性が向上します。

- マルチレプリカの設定の詳細については、「[レプリカの管理](./manage-replica)」を参照してください。

### 新しいリージョンが利用可能になりました: AWS東京{#new-region-available-aws-tokyo}

Zilliz Cloudは現在、AWS東京リージョン（ap-北東-1）で利用可能であり、アジア太平洋リージョンのユーザーに改善されたレイテンシーとパフォーマンスを提供しています。

AWS東京リージョンの価格の詳細については、[価格ページ](https://zilliz.com/pricing)をご覧ください。

### Prometheusの統合サポート{#prometheus-integration-support}

Zilliz Cloudは現在、Prometheusとの統合をサポートしており、ユーザーはシステムメトリクスを実際立って監視および可視化できます。この統合により、ユーザーはパフォーマンス、リソース使用状況、およびシステムの健康状態を追跡し、プロアクティブな監視と効率的なトラブルシューティングを確保できます。セットアップと構成の詳細については、[Prometheusと統合する](./prometheus-monitoring)するを参照してください。

### Auth 0による認証とログインシステムのリファクタリング{#authentication-and-login-system-refactoring-with-auth0}

このリリースでは、Zilliz CloudはAuth 0を使用した認証とログインシステムを改良しました。Zilliz Cloudは現在、3つのログイン方法をサポートしています。

- メール登録とログイン

- GitHubまたはGoogle認証によるクイックログイン。

- 企業のお客様向けのSSOログイン。詳細については、[Oktaによるシングルサインオン](./single-sign-on-with-okta)をご覧ください。

### AWS Marketplace無料トライアル{#aws-marketplace-free-trial}

このリリースにより、Zilliz CloudのユーザーはAWS Marketplaceの無料トライアルオプションを利用することができ、大きな購入決定をする前にリスクのない環境でZilliz製品を探索し評価する機会を提供します。このトライアルでは、プラットフォームのコア機能にすべりの権限が付与され、ユーザーはアプリケーションとのパフォーマンス、スケーラビリティ、互換性を徹底的にテストすることができます。

Zillizのサービスは[AWS Marketplace: Zilliz](https://aws.amazon.com/marketplace/seller-profile?id=4922a541-e428-480d-8e32-db4ee9a7f46e)から入手できます。