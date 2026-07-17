---
title: "2026年1月 リリースノート | Cloud"
slug: /release-notes-2601
sidebar_label: "2026年1月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: ZBEiwpvlbijhYDkmnNScc7zyn5d
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年1月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-29**

    </div>

    <div>

        ## Milvus v2.6.x の新機能をさらに追加\{#another-milvus-v26x-new-feature}

        - **primary key を使用した検索**: 生の vector の代わりに **primary key** を使用して ANN 検索を実行できるようになりました。これにより、検索前に対象 collection から vector を手動で取得する必要がなくなります。詳細については、[Primary-Key Search](./primary-key-search) を参照してください。

        ## CMEK\{#cmek}

        Zilliz は AWS KMS との統合をサポートし、セキュリティ体制をさらに強化できるようになりました。厳格なコンプライアンス要件（GDPR、HIPAA）に不可欠なこの機能により、機密資産を、お客様自身が専属で管理および統制するキーを用いて保護できます。

        - **包括的なデータ保護:** すべてのストレージ層および処理状態にわたって資産を厳格に暗号化し、データライフサイクル全体におけるセキュリティギャップを排除します。

        - **安全な分離とアーキテクチャ:** Encryption Zone によるきめ細かなセキュリティ境界分離を、3 層の Envelope Hierarchy（Root Key → Encryption Zone Key → Data Key）で支えます。これにより、パフォーマンスを最適化しながら database を厳密に分離し、テナント間アクセスを防止します。

        - **ライフサイクルガバナンス:** ダウンタイムなしの自動ローテーション、キー失効による即時データロックダウン、セキュリティドリフトを防ぐ不変構成をサポートします。

        詳細については、[Customer-Managed Encryption Keys](./cmek) および [AWS KMS](./aws-kms) を参照してください。

        ## BYOC が Azure で利用可能に\{#byoc-now-available-on-azure}

        Zilliz Cloud は **Bring Your Own Cloud (BYOC)** を Microsoft Azure に拡張し、マネージドサービスのシンプルさと **絶対的なデータ主権** を両立させます。

        - **最大限の制御を実現する BYOC-I デプロイ:** Data Plane 全体を Azure サブスクリプション内でホストします。これにより、データ主権とセキュリティポリシーに対する完全な制御を維持できます。

        - **Terraform 自動化:** 公式 Terraform Provider によりデプロイを高速化し、複雑なネットワーク構成と認証を完全自動化して、再現可能な Infrastructure-as-Code (IaC) を実現します。

        詳細については、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-23**

    </div>

    <div>

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-feature}

        - **Semantic Highlighter**: 完全一致のキーワードではなくクエリ意図に基づいて検索結果内の最も関連性の高いテキストセグメントを特定してハイライトし、結果の説明可能性を向上させます。

        - この機能は、Zilliz が最近オープンソース化した semantic highlighting model（[zilliz/semantic-highlight-bilingual-v1](https://huggingface.co/zilliz/semantic-highlight-bilingual-v1)）によって実現されており、Zilliz のホスト型 model service を通じてそのまま推論サポートを利用できます（[Hosted Models](./hosted-models) を参照）。

         詳細については、[Semantic Highlighter](./semantic-highlighter) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-14**

    </div>

    <div>

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **タイムゾーン対応 timestamp サポート** — `TIMESTAMPTZ` データ型をサポートし、手動でタイムゾーンを扱うことなく、グローバルに一貫した timestamp の保存、比較、フィルタリングが可能になりました。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

        - **Highlighter** — 一致した用語にカスタマイズ可能なタグとフラグメントレベルのコンテキストを付与し、全文検索結果の解釈とデバッグを容易にします。詳細については、[Lexical Highlighter](./text-highlighter) を参照してください。

        ## Function and Model Inference\{#function-and-model-inference}

        Zilliz Cloud において、Model-Based Embedding と Reranking Functions の Public Preview、および Zilliz Hosted Models の Private Preview を発表できることを嬉しく思います。この更新により、ユーザーは生のテキストを直接 Zilliz Cloud に挿入でき、システムが embedding と reranking を自動的に処理して最も関連性の高い検索結果を確保するため、AI 開発プロセスが簡素化されます。

        OpenAI、Cohere、VoyageAI のような一流のサードパーティプロバイダーの model を選択することも、model を Zilliz Cloud 上で直接ホストすることもできるようになりました。

        - **Model-Based Embedding**: collection 作成時にテキスト embedding function を定義します。設定後は、Insert、Upsert、または Import を通じて生テキストを取り込むだけで、Zilliz が embedding の生成と保存を自動的に処理します。検索時には、システムがテキストを dense vector に変換して効率的な ANN 検索を実行します。詳細については、[Open AI](./openai)、[Voyage AI](./voyage-ai)、および [Cohere](./cohere) のページを参照してください。

        - **Model-Based Reranking**: ニーズに最も適した reranking model を選択することで、特定のユースケースにおいて最も関連性の高い検索結果が優先されるようにします。詳細については、[Cohere rerankers](./cohere-model-ranker) および関連ページを参照してください。

        - **Zilliz Hosted Models (Private Preview)**: フルマネージドの model インスタンスを Zilliz のインフラ上に直接デプロイし、データ転送料金ゼロで安定した高性能な推論を実現します。model は Zilliz Cloud 環境内で実行されるため、データはプライベートネットワーク内にとどまり、プライバシーの向上と超低遅延が確保されます。詳細については、[Hosted Models](./hosted-models) を参照してください。

        さらに、サードパーティ model との統合を簡素化するため、**Third-Party Model Provider Integration** を導入しました。この機能により、Zilliz Cloud 内で AI model の認証情報を管理し、アプリケーションコードを変更することなくいつでも API key をローテーションできるため、柔軟かつ安全な統合を実現します。詳細については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

        ## Dynamic Replica Autoscaling\{#dynamic-replica-autoscaling}

        変動する需要を伴う高 QPS 環境向けに設計された重要機能、**Intelligent Replica Autoscaling** を導入します。これは、リアルタイムのトラフィックパターンに基づいて cluster の replica 数を自動調整します。

        - **負荷適応型スケーリング**: 高トラフィック時には replica を自動的にスケールアップし、低需要時にはスケールダウンして、パフォーマンスとコストの両方を最適化します。

        - **ゼロタッチの信頼性**: シンプルなリソースガードレールにより、システムが予測不能なトラフィックスパイクを自動的に処理し、手動介入なしで一貫したパフォーマンスを確保します。

        詳細については、[Auto-scaling](./auto-scaling) を参照してください。

        ## Cron を使った高度な Scheduled Scaling\{#advanced-scheduled-scaling-with-cron}

        複雑で予測可能なビジネスサイクルをオーケストレーションするために、スケジューリングエンジンをアップグレードしました。業界標準の Cron 式を使用して、CU と Replica の両方に対する精密なスケーリング戦略を自動化できるようになりました。

        - **柔軟なスケジューリング戦略:** 基本的な日次スケジュールを超えて、標準の Cron 構文（例: `0 9 * * * 1-5`）を使用し、「月末にのみスケールアップする」といった複雑なルールを定義できます。

        - **マルチスケジュールロジック:** 同一 cluster に対して独立したレイヤー型スケジュールを設定できるため、ピーク時の平日とオフピークの週末でリソースプロファイルを調整し、実際のビジネス状況に合わせて効率を最適化できます。

        詳細については、[Auto-scaling](./auto-scaling) および [Scheduled Scaling](./scheduled-scaling) を参照してください。

        ## Global Cluster\{#global-cluster}

        Zilliz Cloud Business Critical Plan 向けに Global Cluster を発表できることを嬉しく思います。

        Global Cluster は、primary cluster をクロスリージョンの secondary cluster と接続して自動レプリケーションを行うことで、複数の地理リージョンにまたがる統合 database アーキテクチャを構築します。このソリューションは堅牢な Disaster Recovery (DR) を提供し、リージョン障害が発生した場合でも、ミッションクリティカルなアプリケーションの回復力とデータの耐久性を確保します。

        - **自動化されたグローバルデプロイ:** システムがワンクリックで Primary-Secondary トポロジーをシームレスにオーケストレーションし、自動データレプリケーションチャネル付きの Global Cluster を単一ステップでプロビジョニングできます。

        - **シームレスな DR 拡張:** 稼働中の本番インスタンスへの secondary cluster の動的追加をサポートします。これにより、実行中の dedicated cluster を、サービス中断やダウンタイムなしでスムーズにマルチリージョンのグローバルアーキテクチャへアップグレードできます。

        - **可観測性の向上:** 新しい Global Topology ダッシュボードにより、cluster 階層を統合ビューで確認できます。リージョン間のリアルタイムのレプリケーション遅延と同期状態を 1 つのインターフェースから監視できるようになりました。

        **近日公開:**
        回復力のためのツールキットをさらに拡張しています。次のフェーズでは、リージョンレベルの障害時に自動で切り替える Failover と、SDK トラフィックを再ルーティングする Global Endpoint を導入し、Recovery Time Objectives (RTO) を大幅に短縮します。

        詳細については、[Global Cluster Explained](./global-cluster-explained)、[Create Global Cluster](./create-global-cluster)、および [Manage Global Cluster](./manage-global-cluster) を参照してください。

        ## BYOC - フル Autoscaling Suite が SaaS と整合\{#byoc-full-autoscaling-suite-aligns-with-saas}

        **Bring Your Own Cloud (BYOC)** デプロイが、Zilliz Cloud の完全な autoscaling エコシステムをサポートするようになりました。この更新により、BYOC は当社の SaaS 提供と整合し、これまでにリリースされたすべての最適化機能（自動スケールダウンなど）に加え、**最新機能** にもアクセスできるようになります。

        - **Dynamic Scaling:** CU と Replica の両方で利用可能で、システムがリアルタイム負荷に基づいてリソースをインテリジェントに調整し、シンプルな Min/Max 設定でパフォーマンスとコストを最適化します。

        - **Scheduled Scaling:** 新しい Advanced Mode を完全サポートしました。標準の Cron 式とマルチスケジュールロジックを活用して、複雑で予測可能なビジネスサイクルに向けた精密なリソース調整を自動化できます。

        詳細については、[Scale Query CU](/docs/byoc/scale-cluster) および [Scale Replica](/docs/byoc/manage-replica) を参照してください。

        ## BYOC - Support & Troubleshooting アクセス制御\{#byoc-support-and-troubleshooting-access-control}

        data plane への運用アクセスに対する権限を確保できます。これにより、Zilliz のエンジニアが明示的に許可された場合にのみ、お客様のインフラへアクセスできるようになります。

        - **Just-in-Time (JIT) 権限:** トラブルシューティング期間中のみ一時的なアクセスを付与し、解決後は即座に取り消せます。

        - **運用分離:** アクセスを取り消しても、重要な可観測性パイプライン（Metrics、Logs、Alerts）を妨げることなく、厳格な分離を実現します。

        - **ガバナンスとコンプライアンス:** すべてのアクセス付与と取り消しは Audit Logs に不変の形で記録され、完全な説明責任とセキュリティレビューを可能にします。

        詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws#technical-support-access)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws#technical-support-access)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp#technical-support-access) を参照してください。

        ## Enhancements\{#enhancements}

        - **Collection TTL と AutoID 設定**: Collection Overview GUI から、collection TTL および Allow insert AutoID 設定を直接監視・変更できるようになりました。詳細については、[Set Collection TTL](./set-collection-ttl) および [Modify Collection](./modify-collections) を参照してください。

        - **Data Import**: JSON lines 形式（.JSONL および .NDJSON 拡張子）のサポートが利用可能になりました。詳細については、[Import from a JSON/JSON Lines File](./data-import-json) を参照してください。

        - **Milvus Endpoint Migration**: **Geometry** および **Struct** データ型をサポートするようになり、空間形状や深くネストされた属性を持つ collection のシームレスな移行が可能になりました。

        - **Job Details View**: ナビゲーションの改善とユーザー体験向上のため、サイドドロワー UI を刷新しました。

        - **BYOC - カスタム S3 バケットのサポート**: カスタムの専用 S3 バケットを使用して BYOC cluster をデプロイできるようになり、きめ細かなデータ分離と独立したライフサイクル管理を実現します。

        - **BYOC - AWS KMS 統合**: S3 バケット暗号化向けの AWS KMS (CMEK) 統合が追加され、厳格なセキュリティコンプライアンス基準を満たせるようになりました。

        - **強化された Metrics ダッシュボード**: CU と Replica のスケーリングに最適な利用レベルをユーザーが特定しやすくするため、視覚的なしきい値ガイドラインが追加されました。

        - **RESTful API と Terraform の強化:** [Auto Scaling](/reference/restful/modify-cluster-v2)、[Cross-Region Backup](/reference/restful/create-backup-v2)、[Tiered Storage for Create Cluster](/reference/restful/create-dedicated-cluster-v2)、および [Business Critical Plan for Create Project](/reference/restful/create-project-v2) をサポートするようになり、災害復旧とストレージ管理を改善し、より効率的な自動化プログラミングを可能にします。

    </div>

</Grid>

