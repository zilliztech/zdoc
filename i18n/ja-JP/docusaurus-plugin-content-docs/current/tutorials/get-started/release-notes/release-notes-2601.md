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
sidebar_position: 7
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

        ## Milvus v2.6.x の新機能\{#another-milvus-v26x-new-feature}

        - **主キーを使用した検索**: 生の vector の代わりに**主キー**を使用して ANN 検索を実行できるようになりました。これにより、検索前に対象の collection から vector を手動で取得する必要がなくなります。詳細は、[Primary-Key Search](./primary-key-search) を参照してください。

        ## CMEK\{#cmek}

        Zilliz は AWS KMS 統合に対応し、セキュリティ体制をさらに強化できるようになりました。厳格なコンプライアンス（GDPR、HIPAA）に不可欠なこの機能により、お客様自身が専用に管理・統制するキーを使用して、機密資産を保護できます。

        - **包括的なデータ保護:** すべてのストレージ階層および処理状態にわたって資産を厳格に暗号化し、データライフサイクル全体におけるセキュリティギャップを排除します。

        - **安全な分離とアーキテクチャ:** Root Key → Encryption Zone Key → Data Key から成る 3 層の Envelope Hierarchy に支えられた Encryption Zones により、きめ細かなセキュリティ境界の分離を実現します。これにより、パフォーマンスを最適化しながら、データベースを厳密に分離してテナント間アクセスを防ぎます。

        - **ライフサイクルガバナンス:** ダウンタイムなしの自動ローテーション、キー失効による即時データロックダウン、およびセキュリティドリフトを防ぐための不変構成をサポートします。

        詳細は、[Customer-Managed Encryption Keys](./cmek) および [AWS KMS](./aws-kms) を参照してください。

        ## Azure で BYOC が利用可能に\{#byoc-now-available-on-azure}

        Zilliz Cloud は **Bring Your Own Cloud (BYOC)** を Microsoft Azure に拡張し、マネージドサービスのシンプルさと**完全なデータ主権**を両立します。

        - **最大限の制御を実現する BYOC-I デプロイ:** Data Plane を Azure サブスクリプション内に完全にホストします。これにより、データ主権とセキュリティポリシーに対する完全な制御を維持できます。

        - **Terraform 自動化:** 公式 Terraform Provider によりデプロイを高速化し、複雑なネットワーキングと認証を完全に自動化して、再現可能な Infrastructure-as-Code (IaC) を実現します。

        詳細は、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-23**

    </div>

    <div>

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-feature}

        - **Semantic Highlighter**: 完全一致のキーワードではなく、クエリの意図に基づいて検索結果内の最も関連性の高いテキストセグメントを識別してハイライトし、結果の説明性を向上させます。

        - この機能は、最近 Zilliz によってオープンソース化されたセマンティックハイライトモデル（[zilliz/semantic-highlight-bilingual-v1](https://huggingface.co/zilliz/semantic-highlight-bilingual-v1)）によって提供され、Zilliz のホスト型モデルサービスを通じてそのまま推論サポートを利用できます（[Hosted Models](./hosted-models) を参照）。

         詳細は、[Semantic Highlighter](./semantic-highlighter) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-14**

    </div>

    <div>

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **タイムゾーン対応タイムスタンプサポート** — `TIMESTAMPTZ` データ型をサポートし、手動でタイムゾーンを処理することなく、グローバルで一貫したタイムスタンプの保存、比較、フィルタリングを行えます。詳細は、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

        - **Highlighter** — カスタマイズ可能なタグとフラグメントレベルのコンテキストで一致した用語に注釈を付け、フルテキスト検索結果の解釈とデバッグを容易にします。詳細は、[Lexical Highlighter](./text-highlighter) を参照してください。

        ## Function and Model Inference\{#function-and-model-inference}

        Zilliz Cloud におけるモデルベースの Embedding および Reranking Functions の Public Preview と、Zilliz Hosted Models の Private Preview を発表できることを嬉しく思います。このアップデートにより、ユーザーは生のテキストを直接 Zilliz Cloud に挿入でき、システムが自動的に embedding と reranking を処理して、最も関連性の高い検索結果を確保するため、AI 開発プロセスが簡素化されます。

        OpenAI、Cohere、VoyageAI などの一流サードパーティプロバイダーのモデルを選択するか、モデルを Zilliz Cloud 上で直接ホストできるようになりました。

        - **モデルベース Embedding**: collection 作成時にテキスト embedding function を定義します。設定後は、Insert、Upsert、または Import を通じて生のテキストを取り込むだけで、Zilliz が embedding の生成と保存を自動的に処理します。検索時には、システムがテキストを dense vector に変換して効率的な ANN 検索を実行します。詳細は、[Open AI](./openai)、[Voyage AI](./voyage-ai)、および [Cohere](./cohere) の各ページを参照してください。

        - **モデルベース Reranking**: ニーズに最適な reranking モデルを選択でき、特定のユースケースに対して最も関連性の高い検索結果を優先できます。詳細は、[Cohere rerankers](./cohere-model-ranker) および関連ページを参照してください。

        - **Zilliz Hosted Models (Private Preview)**: Zilliz インフラストラクチャ上に完全マネージドのモデルインスタンスを直接デプロイし、安定した高性能な推論をデータ転送料金ゼロで実現します。モデルは Zilliz Cloud 環境内で実行されるため、データはプライベートネットワーク内に留まり、プライバシーの強化と超低レイテンシを実現します。詳細は、[Hosted Models](./hosted-models) を参照してください。

        さらに、サードパーティモデルとの統合を簡素化するために、**Third-Party Model Provider Integration** を導入しました。この機能により、Zilliz Cloud 内で AI モデルの認証情報を管理し、アプリケーションコードを変更することなくいつでも API key をローテーションできるため、柔軟で安全な統合を実現します。詳細は、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

        ## Dynamic Replica Autoscaling\{#dynamic-replica-autoscaling}

        変動する需要を伴う高 QPS 環境向けに設計された重要機能である **Intelligent Replica Autoscaling** を導入します。これは、リアルタイムのトラフィックパターンに基づいて cluster の replica 数を自動調整します。

        - **負荷適応型スケーリング**: 高トラフィック時には replica を自動的にスケールアップし、低需要時にはスケールダウンして、パフォーマンスとコストの両方を最適化します。

        - **手間のかからない信頼性**: シンプルなリソースガードレールにより、システムが予測不能なトラフィックスパイクに自動対応し、手動介入なしで一貫したパフォーマンスを確保します。

        詳細は、[Auto-scaling](./auto-scaling) を参照してください。

        ## Cron による高度なスケジュールスケーリング\{#advanced-scheduled-scaling-with-cron}

        複雑で予測可能なビジネスサイクルをオーケストレーションするために、スケジューリングエンジンをアップグレードしました。業界標準の Cron 式を使用して、CU と Replicas の両方に対する正確なスケーリング戦略を自動化できるようになりました。

        - **柔軟なスケジューリング戦略:** 基本的な日次スケジュールを超え、標準的な Cron 構文（例: `0 9 * * * 1-5`）を使用して、「月末にのみスケールアップする」といった複雑なルールを定義できます。

        - **マルチスケジュールロジック:** 同じ cluster に対して独立した階層型スケジュールを設定できるため、ピーク時の平日とオフピーク時の週末でリソースプロファイルを調整し、実際のビジネス要件に沿って効率を最適化できます。

        詳細は、[Auto-scaling](./auto-scaling) および [Scheduled Scaling](./scheduled-scaling) を参照してください。

        ## Global Cluster\{#global-cluster}

        Zilliz Cloud Business Critical Plan 向けの Global Cluster を発表できることを嬉しく思います。

        Global Cluster は、プライマリ cluster とクロスリージョンのセカンダリ cluster を接続して自動レプリケーションを行うことで、複数の地理リージョンにまたがる統合データベースアーキテクチャを構築します。このソリューションは強力な災害復旧（DR）を提供し、リージョン障害が発生した場合でも、ミッションクリティカルなアプリケーションの回復力とデータの耐久性を確保します。

        - **自動化されたグローバルデプロイ:** システムはワンクリックで Primary-Secondary トポロジーのシームレスなオーケストレーションを処理し、自動データレプリケーションチャネルを備えた Global Cluster を 1 ステップでプロビジョニングできます。

        - **シームレスな DR 拡張:** 稼働中の本番インスタンスへのセカンダリ cluster の動的追加をサポートします。実行中の dedicated cluster を、サービス中断やダウンタイムなしにマルチリージョンのグローバルアーキテクチャへスムーズにアップグレードできます。

        - **可観測性の向上:** 新しい Global Topology ダッシュボードにより、cluster 階層を統合ビューで確認できます。1 つのインターフェースから、リージョン間のリアルタイムなレプリケーションレイテンシと同期状態を監視できるようになりました。

        **近日提供予定:**
        耐障害性ツールキットをさらに拡充しています。次のフェーズでは、リージョンレベルの障害発生時に自動切り替えを行う Failover と、SDK トラフィックを再ルーティングする Global Endpoint を導入し、Recovery Time Objectives (RTO) を大幅に短縮します。

        詳細は、[Global Cluster Explained](./global-cluster-explained)、[Create Global Cluster](./create-global-cluster)、および [Manage Global Cluster](./manage-global-cluster) を参照してください。

        ## BYOC - SaaS に整合したフルオートスケーリングスイート\{#byoc-full-autoscaling-suite-aligns-with-saas}

        **Bring Your Own Cloud (BYOC)** デプロイで、Zilliz Cloud のオートスケーリングエコシステム全体をサポートするようになりました。このアップデートにより、BYOC は SaaS 提供と整合し、これまでにリリースされたすべての最適化機能（自動スケールダウンなど）に加え、**最新機能**にもアクセスできます。

        - **動的スケーリング:** CU と Replicas の両方で利用でき、システムがリアルタイム負荷に基づいてリソースをインテリジェントに調整し、シンプルな Min/Max 設定でパフォーマンスとコストを最適化します。

        - **スケジュールスケーリング:** 新しい Advanced Mode を完全サポート。標準的な Cron 式とマルチスケジュールロジックを活用して、複雑かつ予測可能なビジネスサイクル向けに正確なリソース調整を自動化できます。

        詳細は、[Scale Query CU](/docs/byoc/scale-cluster) および [Scale Replica](/docs/byoc/manage-replica) を参照してください。

        ## BYOC - サポートとトラブルシューティングのアクセス制御\{#byoc-support-and-troubleshooting-access-control}

        data plane への運用アクセスに対する権限を確保できます。これにより、Zilliz エンジニアが明示的に許可された場合にのみ、お客様のインフラストラクチャへアクセスできるようになります。

        - **Just-in-Time (JIT) 権限:** トラブルシューティング期間中のみ一時的なアクセスを付与し、解決後は直ちに取り消せます。

        - **運用分離:** アクセスを取り消すことで、重要な可観測性パイプライン（Metrics、Logs、Alerts）を中断することなく、厳密な分離を実現します。

        - **ガバナンスとコンプライアンス:** すべてのアクセス付与と取り消しは Audit Logs に変更不可能な形で記録されるため、完全な説明責任とセキュリティレビューが可能です。

        詳細は、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws#technical-support-access)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws#technical-support-access)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp#technical-support-access) を参照してください。

        ## 機能強化\{#enhancements}

        - **Collection TTL および AutoID 設定**: Collection Overview GUI から collection TTL と Allow insert AutoID 設定を直接監視および変更できるようになりました。詳細は、[Set Collection TTL](./set-collection-ttl) および [Modify Collection](./modify-collections) を参照してください。

        - **データインポート**: JSON lines 形式（.JSONL および .NDJSON 拡張子）のサポートが利用可能になりました。詳細は、[Import from a JSON/JSON Lines File](./data-import-json) を参照してください。

        - **Milvus Endpoint Migration**: **Geometry** および **Struct** データ型をサポートし、空間形状や深くネストされた属性を持つ collection のシームレスな移行を可能にします。

        - **Job Details View**: ナビゲーション性とユーザー体験を向上させるため、サイドドロワー UI を刷新しました。

        - **BYOC - カスタム S3 バケットのサポート**: カスタムの専用 S3 バケットを使用して BYOC cluster をデプロイできるようになり、きめ細かなデータ分離と独立したライフサイクル管理を実現します。

        - **BYOC - AWS KMS 統合**: S3 バケット暗号化向けに AWS KMS (CMEK) 統合を追加し、厳格なセキュリティコンプライアンス基準を満たします。

        - **強化された Metrics ダッシュボード**: CU および Replicas のスケーリングにおける最適な使用率レベルをユーザーが特定しやすくするため、視覚的なしきい値ガイドラインを追加しました。

        - **RESTful API と Terraform の機能強化:** [Auto Scaling](/reference/restful/modify-cluster-v2)、[Cross-Region Backup](/reference/restful/create-backup-v2)、[Tiered Storage for Create Cluster](/reference/restful/create-dedicated-cluster-v2)、および [Business Critical Plan for Create Project](/reference/restful/create-project-v2) をサポートするようになり、災害復旧とストレージ管理を改善し、より効率的な自動化プログラミングを可能にします。

    </div>

</Grid>

