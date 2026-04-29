---
title: "2025 年 11 月リリースノート | Cloud"
slug: /release-notes-2511
sidebar_key: release-notes-2511
sidebar_label: "2025 年 11 月"
beta: FALSE
notebook: FALSE
description: "2025 年 11 月の Zilliz Cloud リリースノートです。"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025 年 11 月リリースノート

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## ビジネスクリティカル プランの利用開始\{#business-critical-plan-availability}

        Zilliz Cloud では、最高レベルのセキュリティ、コンプライアンス、可用性要件を持つ組織向けに設計された**ビジネスクリティカル**プランを提供開始しました。既存の HIPAA および SOC 2 Type II への対応に加え、このプランではグローバルクラスター、自動フェイルオーバーを備えたマルチリージョンレプリケーション、ポイントインタイムリカバリ（PITR）などの高度な機能を提供し、グローバル規模でより強力なデータ保護、規制対応、運用回復力を実現します。詳細については、またはこのプランがお客様の環境に適しているか評価するには、[お問い合わせください](https://zilliz.com/contact-sales)。

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **ジオメトリ データ型サポート** — 複雑な空間形状（POINT、LINESTRING、POLYGON）を保存およびクエリでき、地理空間検索、ジオフェンシング、ルーティング、マップベースのアプリケーションに活用できます。詳細は、[ジオメトリ フィールド](./use-geometry-field) を参照してください。

        - **構造体 データ型サポート** — ネストされた複数属性のレコードをより自然にモデル化でき、メタデータ豊富な AI ワークロードにおけるスキーマ設計の簡素化とクエリ性能の向上を実現します。詳細は、[構造体 の配列](./use-array-of-structs) を参照してください。

        - **既存のコレクションでのダイナミックフィールドの有効化** — コレクションを再作成せずにダイナミックフィールドサポートを有効化でき、ビジネス属性の変化に応じたスキーマの柔軟性を提供します。詳細は、[コレクションの変更](./modify-collections#example-5-enable-dynamic-field) を参照してください。

        - **ロード状態下でのスカラーインデックスの削除サポート** — コレクションがロード状態にある間でも、スカラーインデックスの削除と再構築が可能になります。

        ## プランがプロジェクトレベルに移行\{#plan-moved-to-the-project-level}

        このリリースにより、サブスクリプションプランはクラスターレベルではなく**プロジェクト**レベルで管理されるようになり、設定の一貫性が向上し、特に複数のクラスターを運用する組織における機能ガバナンスが簡素化されました。

        既存のワークロード、機能、請求に変更はなく、設定の更新も不要です。

        これ以降、**新規プロジェクト**ではプラン（Standard、Enterprise、または ビジネスクリティカル）の選択が必要となり、**クラスター**ではデプロイメントオプション（Free、Serverless、または Dedicated）を選択します。

        詳細は、[プランの詳細比較](./select-zilliz-cloud-service-plans) を参照してください。

        ## 機能強化\{#enhancements}

        - **全文検索を有効化する移行サポート** - 一般的なベクトルデータベースから移行する際、Milvus が提供する全文検索機能を最大限に活用するために BM25 関数を有効化できるようになりました。詳細は、[エンドポイントを介した Milvus から Zilliz Cloud への移行](./via-endpoint#getting-started) および [外部移行の基本](./external-migration-basics#configure-full-text-search-for-text-data) を参照してください。

        - **アラート間隔設定のサポート -** 進行中のアラートの通知間隔をカスタマイズでき、目立たなくなりすぎることなく、かつ邪魔にならないように確保できます。新しいアラートのデフォルト間隔は 1 時間です。詳細は、[プロジェクトアラートの管理](./manage-project-alerts#alert-settings) を参照してください。

    </div>

</Grid>

