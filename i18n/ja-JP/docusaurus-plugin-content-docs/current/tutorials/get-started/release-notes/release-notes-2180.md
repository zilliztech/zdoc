---
title: "リリースノート（2025年7月15日） | Cloud"
slug: /release-notes-2180
sidebar_label: "2025年7月15日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入します。これには、cluster レベルのスケジュール型 auto-scaling のサポート、新しい Merge Data API による schema evolution、データ取り込みを効率化するクラウドネイティブなデータレイヤーである stage の導入、cluster レベルのバックアップからのクロスデータベース選択による部分リストア、そして JSON Path index の UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、保守のオーバーヘッドを削減し、GenAI 時代における開発サイクルを加速できます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 12
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入します。これには、cluster レベルのスケジュール型 auto-scaling のサポート、新しい Merge Data API による schema evolution、データ取り込みを効率化するクラウドネイティブなデータレイヤーである stage の導入、cluster レベルのバックアップからのクロスデータベース選択による部分リストア、そして JSON Path index の UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、保守のオーバーヘッドを削減し、GenAI 時代における開発サイクルを加速できます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud cluster は **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。 

機能の提供状況の詳細については、[Current Feature Availability](./feature-availability#current-feature-availability) を参照してください。

## Merge Data API による Schema Evolution | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI 時代においては、ビジネスロジックの高速な反復により、これまで以上に頻繁な schema 変更が求められますが、それでもなおコストが高く、運用上も複雑です。schema を更新するには、しばしば Collection の再構築が必要になります。つまり、データをエクスポートし、新しい field をマージし、その後すべてを最初から再インポートする必要があります。この手動プロセスは時間がかかり、エラーが発生しやすく、多くの場合、長時間の書き込み停止が必要です。

この課題に対処するため、Zilliz は schema evolution を自動化する新しい **バッチ ETL 機能** を導入します。このリリースの一環として、ETL サービス配下に新しい **Merge Data RESTful API** が追加され、ユーザーは 1 回の API 呼び出しで大規模な schema 更新を実行できるようになります。この API では、既存の Collection（Base）と外部ファイル（primary key と新しい field を含む）をマージし、更新済み schema を持つ新しい Collection（Target）を生成できます。検証後、ユーザーは alias を更新するだけで、最小限の影響で切り替えできます。

内部では、Merge Data API は分散バッチ処理エンジンと、Stage、Backup、Join、Import を単一のオペレーションとしてオーケストレーションします。ユーザーは各ステップを手動で調整する必要がなくなります。データ検証からインポートまでのプロセス全体が自動的に処理されます。これにより運用負荷が大幅に軽減され、schema 更新を **数日ではなく数時間** で完了できるようになります。

<Admonition type="info" icon="📘" title="Notes">

マージ処理中は、データ整合性を確保するため、Base Collection への書き込みを停止する必要があります。

</Admonition>

この機能は現在 **Private Preview** です。ご利用のアカウントで有効化するには、[support にお問い合わせください](https://support.zilliz.com/hc/en-us)。関連する RESTful API リファレンスページについては、[Merge Data](/reference/restful/merge-data-v2) を参照してください。

## Stage の紹介: Zilliz Cloud のデータレイヤー | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

**Stage** というまったく新しい機能、そして **Zilliz Cloud の基盤となる Data Layer** をご紹介できることを嬉しく思います。

Stage は、非構造化データ向けの管理されたクラウドネイティブなステージング領域を提供します。これは、アップロード、キャッシュ、vector cluster への移行およびインポートに向けたデータ準備など、スケーラブルなデータ移動をサポートするために特化して設計されており、Zilliz の各種サービスにまたがる ETL ワークフローのための統合レイヤーとして機能します。

この初期リリース（**Private Preview**）では、ユーザーは以下を実行できます。

- RESTful API を介して **stage を管理** できます。これには、stage の [作成](/reference/restful/create-volume-v2)、[一覧表示](/reference/restful/list-volumes-v2)、[削除](/reference/restful/delete-volume-v2) が含まれます

- **Migration** と **Import** の両サービスに対する **共有ステージングレイヤーとして Stage を使用** し、データオンボーディングを効率化できます。

    - **Migration**: ローカルの Milvus 環境から Zilliz Cloud へデータを 1 ステップでシームレスに移行できます。これまでは、ユーザーは手動でバックアップを作成し、ファイルを S3 にアップロードし、その後別途 import job をトリガーする必要がありました。Stage により、このプロセスは統合され、より高速で、はるかにエラーが起こりにくくなります。詳細については、[Migrate from Milvus to Zilliz Cloud Via Stage](./via-stage) を参照してください。

    - **Import**: import job は現在、ステージングバックエンドとして Stage を受け入れるようになり、オブジェクトストレージへの依存を減らし、トークン期限切れを回避し、クラウドストレージへ直接アクセスできないユーザーでも容易に Zilliz Cloud へデータを移動できるよう支援します。詳細については、[Create Import Jobs](/reference/restful/create-import-jobs-v2) を参照し、**Request Body** で **Use Stage** を選択してください。

Stage は今後、Backup、Import、ETL サービスなどの追加サービスとも統合され、Zilliz Cloud 内での非構造化データ処理、データ共有、パイプライン駆動型ワークロードへのサポートを拡張していく予定です。

この機能は現在 **Private Preview** です。ご利用のアカウントで有効化するには、[support にお問い合わせください](https://support.zilliz.com/hc/en-us)。

## スケジュール型 Cluster Scaling が利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud は現在、**cluster レベル** での **scheduled scaling** をサポートしており、予測可能なワークロードパターンに基づいてリソース割り当てを事前に制御できるようになりました。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CU および Replicas のスケジュールベース Autoscaling:** 特定のスケジュールを定義して、CU と Replicas を自動的にスケールできるようになりました。営業時間中のピークトラフィックに対応するためにリソースを容易にスケールアップし、夜間や週末などの閑散時間帯にはスケールダウンして、手動介入なしでコストを最適化できます。

- **可視性と制御の向上:** このアップデートにより、スケーリングスケジュールの視覚的な表示が導入され、autoscaling 設定の透明性がさらに高まります。

- **プロアクティブな監査:** 透明性のあるメール通知システムと監査証跡を提供し、リソース提供とコストに関する安心感を得られます。

詳細については、[Cluster Auto-scaling](./auto-scaling) を参照してください。

## Cluster レベルのバックアップからの部分リストアでクロスデータベース選択をサポート\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**cluster レベルのバックアップ** から、複数の database にまたがる collection を含めて、特定の **database** および **collections** を選択的にリストアできるようになりました。この機能強化により、復旧時間が短縮され、cluster 全体を復旧することなく、どのデータをリストアするかを細かく制御できます。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[Restore a Partial Cluster](./restore-from-backup-files#restore-a-partial-cluster) を参照してください。

## Zilliz Cloud Console で JSON Path Index を作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud は現在、Web コンソールから直接 JSON Path index の作成をサポートしており、半構造化データに対するクエリをより簡単に高速化できるようになりました。この機能は JSON field と dynamic field の両方をサポートし、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSON path index の詳細については、[Index Values Inside a JSON Field](./json-indexing) および [Index Keys in the Dynamic Field](./enable-dynamic-field#index-keys-in-the-dynamic-field) を参照してください。

## BYOC Project の Instance Quota 設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloud は現在、BYOC project 向けのカスタム instance quota 設定をサポートしています**。このアップデートにより柔軟性が高まり、サービスに対して明確なリソース境界を定義することでコストを最適化できるようになります。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **Project Resource Autoscaling Control:** 伸縮可能なリソースモードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大 instance 数を設定して elasticity を有効にするか、service group の resource を固定サイズにロックできます。

- **Dynamic Configuration:** コンソールの Project Status ページから、node group の resource と quota を直接表示および調整できるようになり、実行中 project のリソース割り当てを簡単に変更できます。

- **Independent Index Service Quotas:** Zilliz Cloud は現在、index node group の resource quota を個別に設定できるようになり、異なるワークロードパターンに応じてパフォーマンスとリソース割り当てを細かく調整できます。

詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- cluster レベルのバックアップリストアを実行する際に、RBAC 設定をリストアするかどうかを選択できます。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="Notes">

    この設定は、新しく作成されたバックアップにのみ適用されます。

    </Admonition>

- **Private Preview** および **Public Preview** の機能について、使用前に確認できるようになりました。これらの機能を使用するには、[Zilliz Cloud support](https://support.zilliz.com/hc/en-us) へお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- import リクエストごとの合計ファイルサイズ上限が、100 GB から 1 TB に引き上げられました。

- 手動作成されたバックアップの保持期間は、組織が凍結状態になると永続のままではなく 30 日に変更されるようになり、ストレージコストの削減に役立ちます。

