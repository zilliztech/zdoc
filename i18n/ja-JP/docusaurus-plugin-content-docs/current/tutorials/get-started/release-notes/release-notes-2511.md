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
sidebar_position: 10
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

        Zilliz Cloud は、最高水準のセキュリティ、コンプライアンス、可用性を求める組織向けに設計された **Business Critical** プランを新たに提供します。既存の HIPAA および SOC 2 Type II 対応に加えて、このプランでは Global クラスター、自動フェイルオーバーを備えたマルチリージョンレプリケーション、point-in-time recovery（PITR）などの高度な機能を提供し、グローバル規模でより強固なデータ保護、規制への適合、運用レジリエンスを実現します。詳細情報の入手、またはこのプランがお使いの環境に適しているかどうかの評価については、[お問い合わせ](https://zilliz.com/contact-sales)ください。

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **Geometry データ型のサポート** — 地理空間検索、ジオフェンシング、ルーティング、地図ベースのアプリケーション向けに、複雑な空間形状（POINT、LINESTRING、POLYGON）を保存およびクエリできます。詳細は、[Geometry Field](./use-geometry-field) を参照してください。

        - **Struct データ型のサポート** — ネストされた複数属性のレコードをより自然にモデル化できるため、メタデータが豊富な AI ワークロードにおけるスキーマ設計を簡素化し、クエリを改善できます。詳細は、[StructArray Overview](./use-array-of-structs) を参照してください。

        - **既存のコレクションでの Dynamic Field の有効化** — コレクションを再作成することなく Dynamic Field サポートを有効にできるため、ビジネス属性の変化に応じてスキーマの柔軟性を確保できます。詳細は、[Modify コレクション](./modify-collections#example-5-enable-dynamic-field) を参照してください。

        - **Loading Status 中のスカラーインデックスの削除をサポート** — コレクションが Loading Status の間でも、スカラーインデックスを削除および再構築できます。

        ## プランが Project レベルに移行\{#plan-moved-to-the-project-level}

        本リリースにより、サブスクリプションの Plan はクラスターレベルではなく **Project** レベルで管理されるようになり、構成の一貫性が向上し、特に複数のクラスターを運用する組織における機能ガバナンスが簡素化されます。

        既存のワークロード、機能、請求に変更はなく、構成の更新も不要です。

        今後は、**新規プロジェクト** で Plan（Standard、Enterprise、Business Critical）の選択が必要となり、**クラスター** では Deployment Option（Free、Serverless、Dedicated）を選択します。

        詳細は、[Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

        ## 機能強化\{#enhancements}

        - **フルテキスト検索を有効にする Migration Support** - 一般的なベクトルデータベースから移行する際に、BM25 function を有効にして、Milvus が提供するフルテキスト検索機能を最大限に活用できるようになりました。詳細は、[Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint#getting-started) および [External Migration Basics](./external-migration-basics#configure-full-text-search-for-text-data) を参照してください。

        - <strong>アラートの通知間隔設定のサポート -</strong> 継続中のアラートの通知間隔をカスタマイズして、見過ごされず、かつ煩わしくならないようにできます。新しいアラートの通知間隔はデフォルトで 1 時間です。詳細は、[Manage Project Alerts](./manage-project-alerts#alert-settings) を参照してください。

    </div>

</Grid>

