---
title: "2025年11月 リリースノート | Cloud"
slug: /release-notes-2511
sidebar_label: "2025年11月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "（プレースホルダー） | Cloud"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 11
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

        Zilliz Cloud では、最高水準のセキュリティ、コンプライアンス、可用性を必要とする組織向けに設計された **Business Critical** プランを提供するようになりました。既存の HIPAA および SOC 2 Type II への対応に加え、このプランでは、グローバルクラスター、自動フェイルオーバーを備えたマルチリージョンレプリケーション、ポイントインタイムリカバリ（PITR）などの高度な機能を提供し、グローバル規模でより強力なデータ保護、規制への適合、運用上のレジリエンスを実現します。詳細を知りたい場合や、このプランがお使いの環境に適しているかどうかを評価する場合は、[お問い合わせください](https://zilliz.com/contact-sales)。

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **Geometry データ型のサポート** — 地理空間検索、ジオフェンシング、ルーティング、地図ベースのアプリケーション向けに、複雑な空間形状（POINT、LINESTRING、POLYGON）を格納してクエリできます。詳細については、[Geometry Field](./use-geometry-field) を参照してください。

        - **Struct データ型のサポート** — ネストされた複数属性のレコードをより自然にモデル化し、スキーマ設計を簡素化するとともに、メタデータが豊富な AI ワークロードでのクエリを改善できます。詳細については、[StructArray Overview](./use-array-of-structs) を参照してください。

        - **既存コレクションでの動的フィールドの有効化** — コレクションを再作成せずに動的フィールドのサポートを有効にし、ビジネス属性の進化に合わせてスキーマの柔軟性を確保できます。詳細については、[コレクションの変更](./modify-collections#example-5-enable-dynamic-field) を参照してください。

        - **ロード中のスカラーインデックスの削除をサポート** — コレクションがロード中の状態でも、スカラーインデックスの削除と再構築を実行できます。

        ## プランがプロジェクトレベルに移行\{#plan-moved-to-the-project-level}

        このリリースにより、サブスクリプションプランはクラスターレベルではなく **Project** レベルで管理されるようになり、構成の一貫性が向上し、機能のガバナンスが簡素化されます。特に複数のクラスターを運用する組織に有効です。

        既存のワークロード、機能、請求は変更されず、構成を更新する必要もありません。

        今後は、**新規プロジェクト**でプランの選択（Standard、Enterprise、Business Critical）が必要になり、**クラスター**ではデプロイオプション（Free、Serverless、Dedicated）を選択します。

        詳細については、[プランの詳細比較](./select-zilliz-cloud-service-plans) を参照してください。

        ## 機能強化\{#enhancements}

        - **全文検索を可能にする移行サポート** - 一般的なベクトルデータベースから移行する際に、BM25 関数を有効化して、Milvus が提供する全文検索機能を最大限に活用できるようになりました。詳細については、[エンドポイント経由での Milvus から Zilliz Cloud への移行](./via-endpoint#getting-started) および [外部移行の基本](./external-migration-basics#configure-full-text-search-for-text-data) を参照してください。

        - <strong>アラートの通知間隔設定をサポート -</strong> 進行中のアラートの通知間隔をカスタマイズして、通知に気付きやすくしつつ、煩わしくなりすぎないようにすることができます。新しいアラートのデフォルト間隔は 1 時間です。詳細については、[プロジェクトアラートの管理](./manage-project-alerts#alert-settings) を参照してください。

    </div>

</Grid>

