---
title: "2026年6月リリースノート | Cloud"
slug: /release-notes-2606
sidebar_key: release-notes-2606
sidebar_label: "2026年6月"
beta: FALSE
notebook: FALSE
description: "2026年6月リリースノート | Cloud"
type: origin
token: OZtawoDUci0CKokf9RlchvInnMf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年6月リリースノート

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-06-17**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - **特定のメジャーバージョンへの復元** — 過去 30 日以内に作成されたバックアップからクラスターを復元する際に、復元先の Milvus メジャーバージョンを選択できるようになりました。たとえば、2.5.x のバックアップを強制的に 2.6.x にアップグレードするのではなく、新しい 2.5.x クラスターとして復元できます。これは、バージョンの一貫性が重要なディザスターリカバリーのシナリオで特に重要です。詳細については、[バックアップファイルからの復元](./restore-from-backup-files)および[ごみ箱を使用](./use-recycle-bin)を参照してください。

        - **クラスター、プロジェクト、API キーの説明フィールド** — RESTful API を使用して、クラスター、プロジェクト、API キーに説明を追加および更新できるようになりました。大規模環境でリソースを整理し、識別しやすくなります。

        - **Console でのマルチベクトル検索** — Zilliz Cloud Console の Search ページがマルチベクトル検索に対応し、UI から複数のベクトルフィールドを横断したハイブリッド検索を直接実行できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-06-03**

    </div>

    <div>

        ## Nullable Vector\{#nullable-vector}

        ベクトルフィールドが `nullable` 属性をサポートするようになり、既存のコレクションに新しいベクトルフィールドを追加できるようになりました。Nullable Vector により、コレクションを稼働させたまま、作成後にベクトル列を追加し、必要なタイミングで埋め込みをバックフィルできます。

        <Admonition type="info" icon="📘" title="Notes">

        <p>Nullable Vector を利用するには、Serving Cluster で最新の Milvus 2.6.x バージョンが必要です。Milvus 3.0.x を実行している On-Demand Cluster では、すでにこの機能がサポートされています。</p>

        </Admonition>

        この機能は、`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`、`BINARY_VECTOR`、`SPARSE_FLOAT_VECTOR` の 6 種類すべてのベクトル型に適用されます。主なポイントは次のとおりです。

        - **既存コレクションへのベクトルフィールド追加** — `AddCollectionField` を使用して、既存データを再構築せずに新しい NULL 許容ベクトル列をオンラインで追加できます。既存エンティティは NULL ベクトルから開始し、段階的にバックフィルできます。

        - **検索からの自動除外** — NULL ベクトルは、ベクトルインデックス構築および検索時に自動的にスキップされ、検索品質に影響しません。

        - **ほぼゼロのストレージ使用量** — NULL ベクトルは実質的にストレージを消費しないため、埋め込みがまだ利用できないエンティティを効率よく保存できます。

        - **ワークフロー全体の対応** — Nullable Vector は、Create Collection、Add Field、Data Preview、Import、Backup & Restore、Migration の各ワークフローでサポートされます。

        詳細については、[NULL 許容フィールド](./nullable-fields)および[既存コレクションへのフィールド追加](./add-fields-to-an-existing-collection)を参照してください。

        ## 機能強化\{#enhancements}

        - **On-Demand Compute が Private Endpoint をサポート** — On-Demand Compute で Private Endpoint がサポートされ、オンデマンド検索ワークロードに対して安全なプライベートネットワークアクセスを利用できるようになりました。設定手順は Serving Cluster と同じです。詳細については、[PrivateLink (AWS) の設定](./setup-a-private-link-aws)を参照してください。

        - **Data Preview の強化** — Data Preview ページで、個別レコードをその場で編集するための upsert、10 件、50 件、100 件のサンプルレコードのワンクリック挿入、大規模データセットを滑らかに閲覧するための無限ページングがサポートされました。

        - **Collection Creation: フィールドセクションの再設計** — フィールド設定のレイアウトがより直感的になり、スキーマ設定をより速く簡単に行えるようになりました。詳細については、[コレクションの管理 (Console)](./manage-collections-console) の Create a collection - Collection schema セクションを参照してください。

    </div>

</Grid>
