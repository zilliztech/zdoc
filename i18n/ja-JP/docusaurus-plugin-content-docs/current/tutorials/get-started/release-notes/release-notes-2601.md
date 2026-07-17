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

        ## Another Milvus v2.6.x new feature\{#another-milvus-v26x-new-feature}

        - **主キーを使用した検索**: 生の vector の代わりに **primary key** を使用して ANN 検索を実行できるようになりました。これにより、検索前に対象 collection から vector を手動で取得する必要がなくなります。詳細については、[Primary-Key Search](./primary-key-search) を参照してください。

        ## CMEK\{#cmek}

        Zilliz は AWS KMS との統合をサポートし、セキュリティ体制をさらに強化できるようになりました。厳格なコンプライアンス要件（GDPR、HIPAA）に不可欠なこの機能により、ユーザー自身が専用に管理・統制するキーを使用して機密資産を保護できます。

        - **包括的なデータ保護:** すべてのストレージ階層および処理状態にわたって資産を厳格に暗号化し、データライフサイクル全体を通じてセキュリティギャップを排除します。

        - **安全な分離とアーキテクチャ:** Root Key → Encryption Zone Key → Data Key から成る 3 層の Envelope Hierarchy に支えられた Encryption Zones により、きめ細かなセキュリティ境界分離を実現します。これにより、データベースを厳密に分離してテナント間アクセスを防止しつつ、パフォーマンスを最適化します。

        - **ライフサイクルガバナンス:** ダウンタイムなしの自動ローテーション、キーの失効による即時データロックダウン、セキュリティドリフトを防ぐ不変構成をサポートします。

        詳細については、[Customer-Managed Encryption Keys](./cmek) および [AWS KMS](./aws-kms) を参照してください。

        ## Azure で BYOC が利用可能に\{#byoc-now-available-on-azure}

        Zilliz Cloud は **Bring Your Own Cloud (BYOC)** を Microsoft Azure に拡張し、マネージドサービスのシンプルさと **絶対的なデータ主権** を両立します。

        - **最大限の制御を実現する BYOC-I デプロイメント:** Data Plane を完全に Azure サブスクリプション内でホストします。これにより、データ主権とセキュリティポリシーに対する完全な制御を維持できます。

        - **Terraform 自動化:** 公式 Terraform Provider によりデプロイを加速し、複雑なネットワーク設定と認証を完全に自動化して、再現可能な Infrastructure-as-Code (IaC) を実現します。

        詳細については、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-23**

    </div>

    <div>

        ## Milvus v2.6.x new feature\{#milvus-v26x-new-feature}

        - **Semantic Highlighter**: 完全一致するキーワードではなくクエリ意図に基づいて、検索結果内で最も関連性の高いテキストセグメントを識別してハイライトし、結果の説明可能性を向上させます。

        - この機能は、Zilliz が最近オープンソース化した semantic highlighting モデル（[zilliz/semantic-highlight-bilingual-v1](https://huggingface.co/zilliz/semantic-highlight-bilingual-v1)）によって実現されており、Zilliz のホスト型モデルサービスを通じてすぐに推論サポートを利用できます（[Hosted Models](./hosted-models) を参照）。

         詳細については、[Semantic Highlighter](./semantic-highlighter) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-01-14**

    </div>

    <div>

        ## Milvus v2.6.x new features\{#milvus-v26x-new-features}

        - **タイムゾーン対応 timestamp サポート** — `TIMESTAMPTZ` データ型をサポートし、手動でタイムゾーンを処理することなく、グローバルに一貫した timestamp の保存、比較、フィルタリングを可能にします。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

        - **Highlighter** — 一致した用語にカスタマイズ可能なタグとフラグメントレベルのコンテキストを付加し、フルテキスト検索結果の解釈とデバッグを容易にします。詳細については、[Lexical Highlighter](./text-highlighter) を参照してください。

        ## Function and Model Inference\{#function-and-model-inference}

        Zilliz Cloud において、Model-Based Embedding および Reranking Functions の Public Preview と、Zilliz Hosted Models の Private Preview を発表できることを嬉しく思います。この更新により、ユーザーは生のテキストを Zilliz Cloud に直接挿入でき、システムが自動的に embedding と reranking を処理して、最も関連性の高い検索結果を確保するため、AI 開発プロセスが簡素化されます。

        OpenAI、Cohere、VoyageAI などの一流のサードパーティプロバイダーのモデルを選択することも、モデルを Zilliz Cloud 上で直接ホストすることも可能になりました。

        - **Model-Based Embedding**: collection 作成時にテキスト embedding 関数を定義します。構成後は、Insert、Upsert、または Import を使って生のテキストを取り込むだけで、Zilliz が自動的に embedding の生成と保存を行います。検索時には、システムがテキストを dense vector に変換して効率的な ANN 検索を実現します。詳細については、[Open AI](./openai)、[Voyage AI](./voyage-ai)、および [Cohere](./cohere) の各ページを参照してください。

        - **Model-Based Reranking**: ニーズに最も適した reranking モデルを選択し、特定のユースケースに対して最も関連性の高い検索結果が優先されるようにします。詳細については、[Cohere rerankers](./cohere-model-ranker) および関連ページを参照してください。

        - **Zilliz Hosted Models (Private Preview)**: 完全マネージドのモデルインスタンスを Zilliz インフラストラクチャ上に直接デプロイし、データ転送料金ゼロで安定した高性能な推論を確保します。モデルは Zilliz Cloud 環境内で動作するため、データはプライベートネットワーク内にとどまり、プライバシー強化と超低レイテンシを実現します。詳細については、[Hosted Models](./hosted-models) を参照してください。

        さらに、サードパーティモデルとの統合を簡素化するために、**Third-Party Model Provider Integration** を導入しました。この機能により、Zilliz Cloud 内で AI モデルの認証情報を管理し、アプリケーションコードを変更することなくいつでも API key をローテーションできるため、柔軟で安全な統合を実現します。詳細については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

        ## Dynamic Replica Autoscaling\{#dynamic-replica-autoscaling}

        需要が変動する高 QPS 環境向けに設計された主要機能、**Intelligent Replica Autoscaling** を導入します。これは、リアルタイムのトラフィックパターンに基づいて cluster の replica 数を自動調整します。

        - **負荷適応型スケーリング**: 高トラフィック時には replica を自動的にスケールアップし、低需要時にはスケールダウンして、パフォーマンスとコストの両方を最適化します。

        - **ゼロタッチの信頼性**: シンプルなリソースガードレールにより、予測不能なトラフィックスパイクにもシステムが自動対応し、手動介入なしで一貫したパフォーマンスを確保します。

        詳細については、[Auto-scaling](./auto-scaling) を参照してください。

        ## Cron による高度な Scheduled Scaling\{#advanced-scheduled-scaling-with-cron}

        複雑で予測可能なビジネスサイクルをオーケストレーションするため、スケジューリングエンジンをアップグレードしました。業界標準の Cron 式を使用して、CU と Replicas の両方に対する精密なスケーリング戦略を自動化できるようになりました。

        - **柔軟なスケジューリング戦略:** 基本的な日次スケジュールを超えて、標準 Cron 構文（例: `0 9 * * * 1-5`）を利用し、「月末に限ってスケールアップする」といった複雑なルールを定義できます。

        - **マルチスケジュールロジック:** 同一の cluster に対して独立した階層的スケジュールを構成できるため、ピーク時の平日とオフピークの週末に応じてリソースプロファイルを調整し、実際のビジネス状況に沿って効率を最適化できます。

        詳細については、[Auto-scaling](./auto-scaling) および [Scheduled Scaling](./scheduled-scaling) を参照してください。

        ## Global Cluster\{#global-cluster}

        Zilliz Cloud Business Critical Plan 向けの Global Cluster を発表できることを嬉しく思います。

        Global Cluster は、プライマリ cluster とリージョン間のセカンダリ cluster を接続して自動レプリケーションを行うことで、複数の地理リージョンにまたがる統合データベースアーキテクチャを構築します。このソリューションは堅牢な災害復旧（DR）を提供し、リージョン障害が発生した場合でも、ミッションクリティカルなアプリケーションの回復力とデータの耐久性を確保します。

        - **自動化されたグローバルデプロイメント:** システムがワンクリックで Primary-Secondary トポロジーのシームレスなオーケストレーションを処理し、自動データレプリケーションチャネルを備えた Global Cluster を単一ステップでプロビジョニングできます。

        - **シームレスな DR 拡張:** アクティブな本番インスタンスへのセカンダリ cluster の動的追加をサポートします。これにより、稼働中の dedicated cluster をサービス中断やダウンタイムなしでマルチリージョンのグローバルアーキテクチャへ円滑にアップグレードできます。

        - **可観測性の向上:** 新しい Global Topology ダッシュボードにより、cluster 階層を統合ビューで確認できます。単一のインターフェースから、リージョン間のリアルタイムなレプリケーションレイテンシと同期ステータスを監視できるようになりました。

        **近日公開:**
        回復力ツールキットをさらに拡張しています。次のフェーズでは、リージョンレベルの障害時に自動切り替えを行う Failover と、SDK トラフィックを再ルーティングする Global Endpoint を導入し、Recovery Time Objectives (RTO) を大幅に短縮します。

        詳細については、[Global Cluster Explained](./global-cluster-explained)、[Create Global Cluster](./create-global-cluster)、および [Manage Global Cluster](./manage-global-cluster) を参照してください。

        ## BYOC - Full Autoscaling Suite aligns with SaaS\{#byoc-full-autoscaling-suite-aligns-with-saas}

        **Bring Your Own Cloud (BYOC)** デプロイメントが、Zilliz Cloud の autoscaling エコシステム全体をサポートするようになりました。この更新により、BYOC は SaaS 提供と整合し、以前にリリースされたすべての最適化機能（自動スケールダウンなど）に加えて、**最新機能** も利用できるようになります。

        - **Dynamic Scaling:** CU と Replicas の両方で利用可能で、シンプルな Min/Max 構成により、リアルタイム負荷に基づいてシステムがリソースをインテリジェントに調整し、パフォーマンスとコストを最適化します。

        - **Scheduled Scaling:** 新しい Advanced Mode を全面的にサポートします。標準 Cron 式とマルチスケジュールロジックを活用して、複雑で予測可能なビジネスサイクルに対する精密なリソース調整を自動化できるようになりました。

        詳細については、[Scale Query CU](/docs/byoc/scale-cluster) および [Scale Replica](/docs/byoc/manage-replica) を参照してください。

        ## BYOC - サポートおよびトラブルシューティングのアクセス制御\{#byoc-support-and-troubleshooting-access-control}

        data plane への運用アクセスに対する権限を強化できます。これにより、Zilliz のエンジニアは、明示的に許可された場合にのみユーザーのインフラストラクチャへアクセスできます。

        - **Just-in-Time (JIT) 権限:** トラブルシューティングの時間枠に限定して一時的なアクセスを付与し、解決後すぐに取り消せます。

        - **運用上の分離:** アクセスを取り消しても、重要な可観測性パイプライン（Metrics、Logs、Alerts）を妨げることなく、厳格な分離を実現します。

        - **ガバナンスとコンプライアンス:** すべてのアクセス許可と取り消しは Audit Logs に不変の形で記録され、完全な説明責任とセキュリティレビューを実現します。

        詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws#technical-support-access)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws#technical-support-access)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp#technical-support-access) を参照してください。

        ## Enhancements\{#enhancements}

        - **Collection TTL と AutoID 設定**: Collection Overview GUI から collection TTL と Allow insert AutoID 設定を直接監視および変更できるようになりました。詳細については、[Set Collection TTL](./set-collection-ttl) および [Modify Collection](./modify-collections) を参照してください。

        - **Data Import**: JSON lines 形式（.JSONL および .NDJSON 拡張子）のサポートが利用可能になりました。詳細については、[Import from a JSON/JSON Lines File](./data-import-json) を参照してください。

        - **Milvus Endpoint Migration**: **Geometry** および **Struct** データ型をサポートするようになり、空間形状や深くネストされた属性を持つ collection のシームレスな移行が可能になりました。

        - **Job Details View**: ナビゲーション性とユーザー体験を向上させるため、サイドドロワー UI を刷新しました。

        - **BYOC - カスタム S3 Bucket サポート**: カスタムの専用 S3 bucket を使用して BYOC cluster をデプロイできるようになり、きめ細かなデータ分離と独立したライフサイクル管理を提供します。

        - **BYOC - AWS KMS 統合**: S3 bucket 暗号化向けの AWS KMS (CMEK) 統合が追加され、厳格なセキュリティコンプライアンス基準を満たします。

        - **強化された Metrics ダッシュボード**: CU および Replicas のスケーリングに適した利用レベルをユーザーが判別しやすいように、視覚的なしきい値ガイドラインが追加されました。

        - **RESTful API と Terraform の機能強化:** [Auto Scaling](/reference/restful/modify-cluster-v2)、[Cross-Region Backup](/reference/restful/create-backup-v2)、[Tiered Storage for Create Cluster](/reference/restful/create-dedicated-cluster-v2)、および [Business Critical Plan for Create Project](/reference/restful/create-project-v2) をサポートするようになり、災害復旧とストレージ管理が向上し、より効率的な自動化プログラミングが可能になります。

    </div>

</Grid>

