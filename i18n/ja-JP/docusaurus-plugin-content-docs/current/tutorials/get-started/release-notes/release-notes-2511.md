---
title: " 2025年11月 リリースノート  | Cloud"
slug: /release-notes-2511
sidebar_label: "2025年11月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 9
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  2025年11月 リリースノート 

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## Business Critical プランの提供開始\{#business-critical-plan-availability}

        Zilliz Cloud は、最高レベルのセキュリティ、コンプライアンス、可用性要件を持つ組織向けに設計された **Business Critical** プランの提供を開始しました。既存の HIPAA および SOC 2 Type II 対応に加え、このプランでは Global Cluster、マルチリージョンレプリケーションと自動フェイルオーバー、ポイントインタイムリカバリ（PITR）などの高度な機能を提供し、グローバル規模でより強力なデータ保護、規制対応、運用レジリエンスを実現します。詳細情報、またはこのプランがお客様の環境に適しているかを評価したい場合は、[お問い合わせください](https://zilliz.com/contact-sales)。

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **Geometry データ型のサポート** — 複雑な空間形状（POINT、LINESTRING、POLYGON）を保存およびクエリできるようになり、地理空間検索、ジオフェンシング、ルーティング、地図ベースのアプリケーションに対応します。詳細は [Geometry Field](./use-geometry-field) を参照してください。

        - **Struct データ型のサポート** — ネストされた複数属性のレコードをより自然にモデリングできるため、スキーマ設計が簡素化され、メタデータが豊富な AI ワークロードでのクエリがしやすくなります。詳細は [StructArray Overview](./use-array-of-structs) を参照してください。

        - **既存の collection で Dynamic Field を有効化** — collection を再作成することなく dynamic field サポートを有効にできるため、ビジネス属性の変化に応じたスキーマの柔軟性を確保できます。詳細は [Modify Collection](./modify-collections#example-5-enable-dynamic-field) を参照してください。

        - **loading status 中の scalar index の削除をサポート** — collection が loading status の間でも scalar index の削除および再構築が可能になりました。

        ## プランが Project レベルに移行\{#plan-moved-to-the-project-level}

        このリリースにより、サブスクリプションプランは Cluster レベルではなく **Project** レベルで管理されるようになりました。これにより、設定の一貫性が向上し、特に複数の Cluster を運用する組織において、機能ガバナンスが簡素化されます。 

        既存のワークロード、機能、請求には変更はなく、設定更新も不要です。

        今後、**新しい Project** ではプラン（Standard、Enterprise、または Business Critical）の選択が必要になり、**Clusters** ではデプロイオプション（Free、Serverless、または Dedicated）を選択します。 

        詳細は [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

        ## 機能強化\{#enhancements}

        - **フルテキスト検索を有効にする Migration Support** - 一般的な vector database から移行する際に、Milvus が提供するフルテキスト検索機能を最大限活用するため、BM25 function を有効にできるようになりました。詳細は [Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint#getting-started) および [External Migration Basics](./external-migration-basics#configure-full-text-search-for-text-data) を参照してください。

        - **アラートの通知間隔設定をサポート -** 継続中のアラートに対する通知間隔をカスタマイズできるようになり、煩わしさを抑えながら確実に気付けるようになります。新しいアラートのデフォルト間隔は 1 時間です。詳細は [Manage Project Alerts](./manage-project-alerts#alert-settings) を参照してください。

    </div>

</Grid>

