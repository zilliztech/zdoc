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
sidebar_position: 8
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

        ## Milvus v2.6.x の新機能（追加）\{#another-milvus-v26x-new-feature}

        - **主キーを使用した検索**: 生のベクトルの代わりに**主キー**を使用して ANN 検索を実行できるようになりました。これにより、検索前に対象のコレクションからベクトルを手動で取得する必要がなくなります。詳細は、[Primary-Key Search](./primary-key-search) を参照してください。

        ## CMEK\{#cmek}

        Zilliz は AWS KMS 統合により、セキュリティ体制を強化できるようになりました。厳格なコンプライアンス（GDPR、HIPAA）に不可欠なこの機能は、お客様自身だけが管理および統制するキーを使用して、機密性の高い資産を保護します。

        - <strong>包括的なデータ保護:</strong> すべてのストレージ階層と処理状態にわたって資産を厳格に暗号化し、データライフサイクル全体にわたるセキュリティギャップを排除します。

        - <strong>安全な分離とアーキテクチャ:</strong> Encryption Zones によるきめ細かなセキュリティ境界の分離を、3 層の Envelope Hierarchy（Root Key → Encryption Zone Key → Data Key）で実現します。これにより、パフォーマンスを最適化しながらデータベースを厳密に分離し、テナント間のアクセスを防止します。

        - <strong>ライフサイクルガバナンス:</strong> ダウンタイムなしの自動ローテーション、キー失効による即時データロックダウン、およびセキュリティドリフトを防ぐ不変の構成をサポートします。

        詳細は、[Customer-Managed Encryption Keys](./cmek) および [AWS KMS](./aws-kms) を参照してください。

        ## Azure で BYOC が利用可能に\{#byoc-now-available-on-azure}

        Zilliz Cloud は **Bring Your Own Cloud（BYOC）** を Microsoft Azure に拡張し、マネージドサービスのシンプルさと**完全なデータ主権**を両立します。

        - **最大限の制御を実現する BYOC-I デプロイ:** データプレーンを Azure サブスクリプション内に完全にホストします。データ主権とセキュリティポリシーに対する完全な制御を維持できます。

        - <strong>Terraform 自動化:</strong> 公式 Terraform Provider を通じてデプロイを高速化し、複雑なネットワーキングと認証を完全に自動化して、再現可能な Infrastructure-as-Code（IaC）を実現します。

        詳細は、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-14**

    </div>

    <div>

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **タイムゾーン対応のタイムスタンプサポート** — `TIMESTAMPTZ` データ型をサポートし、手動でタイムゾーンを処理することなく、グローバルに一貫したタイムスタンプの保存、比較、フィルタリングを行えます。詳細は、[TIMESTAMPTZ フィールド](./use-timestamptz-field) を参照してください。

        - **Highlighter** — 一致した用語にカスタマイズ可能なタグとフラグメントレベルのコンテキストを付与し、全文検索の結果を解釈およびデバッグしやすくします。詳細は、[Lexical Highlighter](./text-highlighter) を参照してください。

        ## 関数とモデル推論\{#function-and-model-inference}

        Model-Based Embedding and Reranking Functions のパブリックプレビューと、Zilliz Cloud 上の Zilliz Hosted Models のプライベートプレビューを発表できることをうれしく思います。このアップデートにより、ユーザーは生のテキストを Zilliz Cloud に直接挿入でき、システムが埋め込みとリランキングを自動的に処理して最も関連性の高い検索結果を保証するため、AI 開発プロセスが効率化されます。

        OpenAI、Cohere、VoyageAI などの一流のサードパーティプロバイダーのモデルを選択することも、モデルを Zilliz Cloud 上で直接ホストすることもできます。

        - **Model-Based Embedding**: コレクションの作成時にテキスト埋め込み関数を定義します。設定後は、Insert、Upsert、または Import で生のテキストを取り込むだけで、Zilliz が埋め込みの生成と保存を自動的に処理します。検索時には、システムがテキストを密なベクトルに変換し、効率的な ANN 検索を実行します。詳細は、[Open AI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) の各ページを参照してください。

        - **Model-Based Reranking**: ニーズに最適なリランキングモデルを選択し、特定のユースケースで最も関連性の高い検索結果が優先されるようにします。詳細は、[Cohere rerankers](./cohere-model-ranker) およびその関連ページを参照してください。

        - **Zilliz Hosted Models（Private Preview）**: 完全にマネージドされたモデルインスタンスを Zilliz インフラストラクチャ上に直接デプロイし、データ転送料金なしで安定した高性能な推論を実現します。モデルが Zilliz Cloud 環境で実行されるため、データはプライベートネットワーク内に留まり、プライバシーの強化と超低レイテンシーを実現します。詳細は、[Hosted Models](./hosted-models) を参照してください。

        さらに、サードパーティモデルとの統合を効率化するため、**Third-Party Model Provider Integration** を導入しました。この機能を使用すると、Zilliz Cloud 内で AI モデルの認証情報を管理し、アプリケーションコードを変更することなくいつでも API キーをローテーションできるため、柔軟で安全な統合を実現できます。詳細は、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

        ## 動的なレプリカのオートスケーリング\{#dynamic-replica-autoscaling}

        需要が変動する高 QPS 環境向けに設計された主要機能である **Intelligent Replica Autoscaling** を導入します。これは、リアルタイムのトラフィックパターンに基づいてクラスターのレプリカ数を自動的に調整します。

        - **負荷に応じたスケーリング**: トラフィックが多い時間帯にはレプリカを自動的にスケールアップし、需要が少ないときにはスケールダウンして、パフォーマンスとコストの両方を最適化します。

        - **ゼロタッチの信頼性**: シンプルなリソースガードレールにより、システムが予測不能なトラフィックの急増を自動的に処理し、手動による介入なしで一貫したパフォーマンスを確保します。

        詳細は、[Auto-scaling](./auto-scaling) を参照してください。

        ## Cron を使用した高度なスケジュールスケーリング\{#advanced-scheduled-scaling-with-cron}

        複雑で予測可能なビジネスサイクルをオーケストレーションできるよう、スケジューリングエンジンをアップグレードしました。業界標準の Cron 式を使用して、CU とレプリカの両方に対して正確なスケーリング戦略を自動化できるようになりました。

        - **柔軟なスケジューリング戦略:** 基本的な日次スケジュールにとどまりません。標準の Cron 構文（例：`0 9 * * * 1-5`）を使用して、「月末のみスケールアップする」など複雑なルールを定義できます。

        - **マルチスケジュールロジック:** 同じクラスターに対して独立した階層型のスケジュールを構成できるため、平日のピーク時と週末のオフピーク時に合わせてリソースプロファイルを調整し、ビジネスの実情に沿って効率を最適化できます。

        詳細は、[Auto-scaling](./auto-scaling) および [スケジュールスケーリング](./scheduled-scaling) を参照してください。

        ## グローバルクラスター\{#global-cluster}

        Zilliz Cloud Business Critical プラン向けのグローバルクラスターを発表できることをうれしく思います。

        グローバルクラスターは、プライマリクラスターをリージョン間のセカンダリクラスターにリンクして自動レプリケーションを行うことで、複数の地理的リージョンにまたがる統合データベースアーキテクチャを構築します。このソリューションは堅牢な災害復旧（DR）を提供し、リージョンで障害が発生した場合でも、ミッションクリティカルなアプリケーションの耐障害性とデータの耐久性を確保します。

        - <strong>自動化されたグローバルデプロイ:</strong> システムが、プライマリ・セカンダリトポロジのシームレスなオーケストレーションをワンクリックで処理するため、自動化されたデータレプリケーションチャネルを備えたグローバルクラスターを 1 ステップでプロビジョニングできます。

        - <strong>シームレスな DR 拡張:</strong> 稼働中の本番インスタンスにセカンダリクラスターを動的に追加できます。サービスを中断したりダウンタイムを発生させたりすることなく、稼働中の専用クラスターをマルチリージョンのグローバルアーキテクチャにスムーズにアップグレードできるようになりました。

        - <strong>可観測性の強化:</strong> 新しい Global Topology ダッシュボードで、クラスター階層を統一的に確認できます。1 つのインターフェイスから、リージョン間のリアルタイムのレプリケーション遅延と同期ステータスを監視できるようになりました。

        **近日公開予定:**
        耐障害性ツールキットを拡張しています。次のフェーズでは、リージョンレベルの障害発生時に自動的に切り替えるフェイルオーバーと、SDK トラフィックを再ルーティングして目標復旧時間（RTO）を大幅に短縮する Global Endpoint が導入されます。

        詳細は、[グローバルクラスターの説明](./global-cluster-explained)、[グローバルクラスターの作成](./create-global-cluster)、および [グローバルクラスターの管理](./manage-global-cluster) を参照してください。

        ## BYOC - SaaS と整合するフルオートスケーリングスイート\{#byoc-full-autoscaling-suite-aligns-with-saas}

        **Bring Your Own Cloud（BYOC）** のデプロイは、Zilliz Cloud のオートスケーリングエコシステム全体をサポートするようになりました。このアップデートにより、BYOC は SaaS 提供と整合し、これまでにリリースされたすべての最適化（自動スケールダウンなど）に加えて、**最新の機能**にもアクセスできるようになります。

        - <strong>動的スケーリング:</strong> CU とレプリカの両方で利用でき、システムがリアルタイムの負荷に基づいてリソースをインテリジェントに調整し、シンプルな Min/Max 構成でパフォーマンスとコストを最適化します。

        - <strong>スケジュールスケーリング:</strong> 新しい Advanced Mode を完全にサポートします。標準の Cron 式とマルチスケジュールロジックを活用して、複雑で予測可能なビジネスサイクル向けに正確なリソース調整を自動化できるようになりました。

        詳細は、[手動スケーリング](./manual-scaling)、[Auto-scaling](./auto-scaling)、および [スケジュールスケーリング](./scheduled-scaling) を参照してください。

        ## BYOC - サポートとトラブルシューティングのアクセス制御\{#byoc-support-and-troubleshooting-access-control}

        データプレーンへの運用アクセスを制御できるようになりました。Zilliz のエンジニアがお客様のインフラストラクチャにアクセスできるのは、明示的に許可された場合のみです。

        - <strong>Just-in-Time（JIT）権限:</strong> トラブルシューティング期間中に一時的なアクセスを付与し、問題の解決後は直ちに取り消します。

        - <strong>運用の分離:</strong> アクセスを取り消すことで、重要な可観測性パイプライン（Metrics、Logs、Alerts）を中断することなく、厳格な境界を設けます。

        - <strong>ガバナンスとコンプライアンス:</strong> すべてのアクセス付与と取り消しは Audit Logs に変更不可の形で記録され、完全な説明責任とセキュリティレビューが可能になります。

        詳細は、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws#technical-support-access)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws#technical-support-access)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp#technical-support-access) を参照してください。

        ## 機能強化\{#enhancements}

        - **コレクション TTL および AutoID 設定**: コレクション概要 GUI から、コレクション TTL と Allow insert AutoID の設定を直接監視および変更できるようになりました。詳細は、[コレクション TTL の設定](./set-collection-ttl) および [コレクションの変更](./modify-collections) を参照してください。

        - **データインポート**: JSON Lines 形式（.JSONL および .NDJSON 拡張子）のサポートが利用可能になりました。詳細は、[JSON/JSON Lines ファイルからのインポート](./data-import-json) を参照してください。

        - **Milvus Endpoint Migration**: **Geometry** および **Struct** データ型をサポートするようになり、空間形状や深くネストされた属性を持つコレクションをシームレスに移行できます。

        - **Job Details View**: ナビゲーションの改善とユーザーエクスペリエンスの向上のため、サイドドロワー UI を刷新しました。

        - **BYOC - カスタム S3 バケットのサポート**: カスタムの専用 S3 バケットを使用して BYOC クラスターをデプロイできるようになり、きめ細かなデータ分離と独立したライフサイクル管理を実現できます。

        - **BYOC - AWS KMS 統合**: S3 バケット暗号化向けの AWS KMS（CMEK）統合が追加され、厳格なセキュリティコンプライアンス基準を満たします。

        - **メトリクスダッシュボードの強化**: CU とレプリカをスケーリングする際の最適な使用率を特定しやすくするため、視覚的なしきい値ガイドラインが追加されました。

        - <strong>RESTful API と Terraform の機能強化:</strong> [Auto Scaling](/reference/restful/modify-cluster-v2)、[Cross-Region Backup](/reference/restful/create-backup-v2)、[Tiered Storage for Create クラスター](/reference/restful/create-dedicated-cluster-v2)、および [Business Critical Plan for Create Project](/reference/restful/create-project-v2) をサポートするようになり、災害復旧とストレージ管理が改善され、より効率的な自動化プログラミングが可能になります。

    </div>

</Grid>
