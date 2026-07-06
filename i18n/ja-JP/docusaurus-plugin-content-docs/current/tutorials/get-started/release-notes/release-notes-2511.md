---
title: "2025年11月リリースノート | Cloud"
slug: /release-notes-2511
sidebar_key: release-notes-2511
sidebar_label: "2025年11月"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 2025年11月のリリースノート。"
type: origin
token: CK0ewQWC2iz6lakP0kscqogbnGh
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025年11月リリースノート

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-11-06**

    </div>

    <div>

        ## ビジネスクリティカルプランの提供開始\{#business-critical-plan-availability}

        Zilliz Cloud において、最高レベルのセキュリティ、コンプライアンス、可用性を求める組織向けに **ビジネスクリティカル** プランが提供開始されました。既存の HIPAA および SOC 2 Type II 対応に加えて、このプランでは グローバルクラスター、マルチリージョンレプリケーションによる自動フェイルオーバー、ポイントインタイムリカバリ（PITR）などの高度な機能を提供し、グローバル規模でのより強固なデータ保護、規制対応、および運用のレジリエンスを実現します。詳細情報、またはお客様の環境にこのプランが適しているかどうかの評価については、[お問い合わせ](https://zilliz.com/contact-sales) ください。

        ## Milvus v2.6.x の新機能\{#milvus-v26x-new-features}

        - **ジオメトリデータ型サポート** — ジオスペーシャル検索、ジオフェンシング、ルーティング、および地図ベースのアプリケーションのために、複雑な空間形状（POINT、LINESTRING、POLYGON）を保存およびクエリできます。詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

        - **構造体データ型サポート** — メタデータが豊富な AI ワークロードにおいて、スキーマ設計を簡素化し、クエリを改善するために、ネストされた複数属性のレコードをより自然にモデリングできます。詳細については、[配列の構造体](./use-array-of-structs) を参照してください。

        - **既存コレクションでの Dynamic Field の有効化** — コレクションを再作成することなく動的フィールドサポートを有効にでき、ビジネス属性の変化に応じてスキーマの柔軟性を確保できます。詳細については、[コレクションの変更](./modify-collections#example-5-enable-dynamic-field) を参照してください。

        - **Loading 状態でのスカラーインデックスの削除サポート** — コレクションが loading 状態にある間にスカラーインデックスの削除と再構築を許可します。

        ## プランのプロジェクトレベルへの移行\{#plan-moved-to-the-project-level}

        本リリースより、サブスクリプションプランはクラスターレベルではなく **プロジェクト** レベルで管理されるようになり、設定の一貫性が向上し、特に複数のクラスターを運用する組織において機能ガバナンスが簡素化されます。

        既存のワークロード、機能、および課金は変更されず、設定の更新は必要ありません。

        今後、**新規プロジェクト** ではプランの選択（Standard、Enterprise、または ビジネスクリティカル）が必要となり、**クラスター** ではデプロイメントオプション（Free、Serverless、または Dedicated）を選択します。

        詳細については、[詳細なプラン比較](./select-zilliz-cloud-service-plans) を参照してください。

        ## 機能強化\{#enhancements}

        - **フルテキスト検索を有効化する移行サポート** - 人気のあるベクトルデータベースからの移行時に、Milvus が提供するフルテキスト検索機能を最大限に活用するために BM25関数 を有効化できるようになりました。詳細については、[エンドポイント経由で Milvus から Zilliz Cloud へ移行](./via-endpoint#getting-started) および [外部移行の基本](./external-migration-basics#configure-full-text-search-for-text-data) を参照してください。

        - **アラートの通知間隔設定サポート** — 継続中のアラートの通知間隔をカスタマイズでき、目立ちすぎずに認識しやすい状態を維持できます。新規アラートのデフォルト間隔は1時間です。詳細については、[プロジェクトアラートの管理](./manage-project-alerts#alert-settings) を参照してください。

    </div>

</Grid>

