---
title: "2025年11月リリースノート | Cloud"
slug: /release-notes-2511
sidebar_label: "2025年11月リリースノート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "2025年11月リリースノート | Cloud"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 0
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025年11月リリースノート

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## ビジネスクリティカルプラン利用可能\{#business-critical-plan-availability}

        Zilliz Cloudは、最高のセキュリティ、コンプライアンス、および可用性を必要とする組織向けに**ビジネスクリティカル**プランを提供するようになりました。既存のHIPAAおよびSOC 2 Type II準備に加え、このプランはグローバルクラスター、自動フェイルオーバー付きマルチリージョンレプリケーション、およびポイントインタイムリカバリー（PITR）などの高度機能を提供し、グローバルスケールでのより強力なデータ保護、規制対応、および運用レジリエンスを実現します。詳細情報またはこのプランが環境に適しているか評価するには、[お問い合わせください](https://zilliz.com/contact-sales)。

        ## Milvus v2.6.x 新機能\{#milvus-v26x-new-features}

        - **ジオメトリデータ型サポート** — 地理空間検索、ジオフェンシング、ルーティング、およびマップベースアプリケーションのため、複雑な空間形状（POINT、LINESTRING、POLYGON）を保存およびクエリできます。詳細については、[ジオメトリフィールド](./use-geometry-field)を参照してください。

        - **Structデータ型サポート** — メタデータの多いAIワークロードでのスキーマ設計の簡素化とクエリ性能向上のため、ネストされたマルチアトリビュートレコードをより自然にモデル化できます。詳細については、[構造体の配列](./use-array-of-structs)を参照してください。

        ## プランがプロジェクトレベルに移行\{#plan-moved-to-the-project-level}

        このリリースにより、サブスクリプションプランがクラスターレベルではなく**プロジェクト**レベルで管理されるようになり、構成の一貫性が向上し、特に複数のクラスターを運用する組織における機能ガバナンスが簡素化されます。

        既存のワークロード、機能、および請求は変更されず、構成の更新は必要ありません。

        今後は、**新規プロジェクト**にはプラン選択（Standard、Enterprise、またはBusiness Critical）が必要になり、**クラスター**はデプロイメントオプション（Free、Serverless、またはDedicated）を選択するようになります。

        詳細については、[詳細プラン比較](./select-zilliz-cloud-service-plans)を参照してください。

        ## 機能強化\{#enhancements}

        - **全文検索を可能にする移行サポート** - 人気のベクターデータベースから移行する際に、Milvusが提供する全文検索機能を最大限に活用するためにBM25機能を有効にできます。詳細については、[エンドポイント経由でMilvusからZilliz Cloudへの移行](./via-endpoint#getting-started)および[外部移行の基本](./external-migration-basics#configure-full-text-search-for-text-data)を参照してください。

        - **アラートサポート間隔設定** - 邪魔にならずに注意を引いたままにするために、継続中のアラートの通知間隔をカスタマイズできます。新しいアラートはデフォルトで1時間間隔になります。詳細については、[プロジェクトアラートの管理](./manage-project-alerts#alert-settings)を参照してください。

        - **既存コレクションでの動的フィールド有効化** — コレクションを再作成することなく動的フィールドサポートを有効にし、ビジネス属性の変化に合わせたスキーマの柔軟性を確保できます。詳細については、[コレクションの変更](./modify-collections#example-4-enable-dynamic-field)を参照してください。

    </div>

</Grid>