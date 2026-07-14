---
title: "2026年6月 リリースノート | Cloud"
slug: /release-notes-2606
sidebar_label: "2026年6月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: OZtawoDUci0CKokf9RlchvInnMf
sidebar_position: 3
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年6月 リリースノート

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-06-24**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        バックアップシステムをアップグレードし、高度にカスタマイズされたバックアップサイクルをオーケストレーションできるようになりました。これにより、ビジネスニーズに合わせた高度なスケジューリングオプションを使用してバックアップポリシーを定義できるようになりました。

        - **マルチスケジュールロジック:** 単一のポリシー内で、複数の独立したスケジュールを設定して重ね合わせることができます。これにより、異なるバックアップ頻度（例: ピーク時は毎時、オフピーク時は毎日）を組み合わせて、Recovery Point Objective (RPO) を最適化できます。

        - **高度な Cron スケジューリング:** 基本的な日次ルーチンを超える柔軟な設定が可能です。業界標準の Cron 構文（例: `0 9 * * 1-5`）を使用して、月末のみバックアップを実行するといった複雑なバックアップポリシーを定義できます。

        詳細については、[自動バックアップのスケジュール設定](./schedule-automatic-backups) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-06-17**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - **特定のメジャーバージョンへの復元** — 過去30日以内に作成されたバックアップからクラスターを復元する際に、どの Milvus メジャーバージョンに復元するかを選択できるようになりました。たとえば、2.5.x のバックアップを 2.6.x へ強制的にアップグレードするのではなく、新しい 2.5.x クラスターに復元できます。これは、バージョンの一貫性が重要な災害復旧シナリオで特に重要です。詳細については、[バックアップファイルから復元](./restore-from-backup-files) および [Recycle Bin を使用する](./use-recycle-bin) を参照してください。

        - **クラスター、プロジェクト、API キーの説明フィールド** — Web コンソールと REST API の両方を通じて、クラスターとプロジェクトに説明を追加および更新できるようになりました。API キーの説明は現在 Web コンソールでのみサポートされており、大規模なリソースの整理と識別がより容易になります。

        - **コンソールでのマルチベクトル検索** — Zilliz Cloud Console の Search ページでマルチベクトル検索がサポートされ、UI から直接、複数のベクトルフィールドにまたがるハイブリッド検索を実行できるようになりました。

        - **請求メトリクスの Usage ビュー** — 請求機能で Usage ビューがサポートされ、Serverless vCU の read/write 使用量など、請求カテゴリごとの従量使用傾向を追跡できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-06-03**

    </div>

    <div>

        ## Nullable Vector\{#nullable-vector}

        ベクトルフィールドが `nullable` 属性をサポートするようになり、既存のコレクションに新しいベクトルフィールドを追加できるようになりました。これは多くのお客様が待ち望んでいた機能です。nullable ベクトルにより、コレクション作成後にベクトル列を追加してスキーマを進化させ、コレクションを完全に稼働させたまま、自分のペースで埋め込みを後から埋めることができます。

        <Admonition type="info" icon="📘" title="**注意**">

        Nullable Vector を使用するには、Serving Clusters で最新の Milvus 2.6.x バージョンが必要です。Milvus 3.0.x を実行している On-Demand Clusters では、この機能はすでにサポートされています。

        </Admonition>

        これは 6 つすべてのベクトルタイプ — `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`、`BINARY_VECTOR`、`SPARSE_FLOAT_VECTOR` — に適用されます。主な特長は次のとおりです。

        - **既存のコレクションへのベクトルフィールドの追加** — `AddCollectionField` を使用して、既存データを再構築することなく、新しい nullable ベクトル列をオンラインで追加できます。既存のエンティティは NULL ベクトルで開始され、段階的に埋め戻すことができます。

        - **自動検索除外** — NULL ベクトルは、ベクトルインデックスの構築時および検索時に自動的にスキップされるため、検索品質に影響しません。

        - **ほぼゼロのストレージ使用量** — NULL ベクトルは実質的にストレージを消費しないため、埋め込みがまだ利用できないエンティティをコスト効率よく保存できます。

        - **ワークフロー全体をカバー** — Nullable ベクトルは、Create Collection、Add Field、Data Preview、Import、Backup & Restore、Migration の各ワークフローでサポートされています。

        詳細については、[Nullable Fields](./nullable-fields) および [既存のコレクションへのフィールドの追加](./add-fields-to-an-existing-collection) を参照してください。

        ## 機能強化\{#enhancements}

        - **On-Demand Compute が Private Endpoint をサポート** — On-Demand Compute が Private Endpoint をサポートし、オンデマンド検索ワークロードへの安全なプライベートネットワークアクセスが可能になりました。設定手順は Serving Clusters と同じワークフローに従います。詳細については、[PrivateLink を設定する (AWS)](./setup-a-private-link-aws) を参照してください。

        - **強化された Data Preview** — Data Preview ページで、個々のレコードをその場で編集するための upsert、10、50、100 件のサンプルレコードをワンクリックで挿入する機能、大規模データセットをよりスムーズに移動するための無限ページングがサポートされるようになりました。

        - **コレクション作成: フィールドセクションを再設計** — フィールド設定のレイアウトがより直感的になり、スキーマの設定がより速く簡単になりました。詳細については、[Manage Collections (Console)](./manage-collections-console) 内の「Create a collection - Collection schema」セクションを参照してください。

    </div>

</Grid>

