---
title: "リリースノート（2025年7月15日） | Cloud"
slug: /release-notes-2180
sidebar_label: "2025年7月15日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は、運用効率、柔軟性、ユーザーエクスペリエンスの向上を目的とした複数の強力な機能強化を導入します。これには、クラスターレベルのスケジュールされたオートスケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーである Stage の導入、クロスデータベース選択によるクラスターレベルのバックアップからの部分リストア、および JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI 時代における開発サイクルを加速できます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 13
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

このリリースでは、Zilliz Cloud は、運用効率、柔軟性、ユーザーエクスペリエンスの向上を目的とした複数の強力な機能強化を導入します。これには、クラスターレベルのスケジュールされたオートスケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーである Stage の導入、クロスデータベース選択によるクラスターレベルのバックアップからの部分リストア、および JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI 時代における開発サイクルを加速できます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。

機能の提供状況の詳細については、[現在の機能の提供状況](./feature-availability#current-feature-availability) を参照してください。

## Merge Data API によるスキーマ進化 | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI 時代においては、ビジネスロジックの迅速な反復により、これまで以上に頻繁なスキーマ変更が求められますが、依然としてコストが高く、運用も複雑です。スキーマを更新するには、多くの場合コレクションを再構築する必要があります。つまり、データをエクスポートし、新しいフィールドをマージし、すべてをゼロから再インポートする必要があります。この手動のプロセスは時間がかかり、エラーが発生しやすく、多くの場合、長時間の書き込み停止を伴います。

この課題に対処するため、Zilliz はスキーマ進化を自動化する新しい **バッチ ETL 機能** を導入します。このリリースの一環として、ETL サービス配下に新しい **Merge Data RESTful API** が追加され、ユーザーは 1 回の API 呼び出しで大規模なスキーマ更新を実行できるようになります。この API では、既存のコレクション（Base）と外部ファイル（プライマリキーと新しいフィールドを含む）をマージして、更新されたスキーマを持つ新しいコレクション（Target）を生成できます。検証後は、エイリアスを更新するだけで、最小限の中断で切り替えることができます。

内部では、Merge Data API は分散バッチ処理エンジンと、Stage、Backup、Join、Import を単一の操作としてオーケストレーションします。ユーザーは各ステップを手動で調整する必要がなくなりました。データ検証からインポートまでのプロセス全体が自動的に処理されます。これにより運用負荷が大幅に軽減され、スキーマ更新を **数日ではなく数時間** で完了できるようになります。

<Admonition type="info" title="Notes">

マージ処理中は、データの整合性を確保するため、ベースのコレクションへの書き込みを停止する必要があります。

</Admonition>

この機能は現在 **Private Preview** です。ご利用のアカウントで有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。関連する RESTful API リファレンスページについては、[Merge Data](/reference/restful/merge-data-v2) を参照してください。

## Stage の紹介: Zilliz Cloud のデータレイヤー | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

まったく新しい機能であり、**Zilliz Cloud の基盤となるデータレイヤー** である **Stage** を紹介できることを嬉しく思います。

Stage は、非構造化データ向けのマネージドでクラウドネイティブなステージング領域を提供します。これは、ベクトルクラスターへの移行とインポートに向けたデータのアップロード、キャッシュ、準備など、スケーラブルなデータ移動をサポートするために専用に設計されており、Zilliz の各種サービスにまたがる ETL ワークフローのための統合レイヤーとして機能します。

この最初のリリース（**Private Preview**）では、次のことができます:

- RESTful API を介して **Stage を管理**できます。これには Stage の [Create](/reference/restful/create-volume-v2)、[list](/reference/restful/list-volumes-v2)、[delete](/reference/restful/delete-volume-v2) が含まれます。

- **Migration** サービスと **Import** サービスの両方で **共有ステージングレイヤーとして Stage を使用**して、データのオンボーディングを効率化できます:

    - **Migration**: ローカルの Milvus 環境から Zilliz Cloud へデータを 1 ステップでシームレスに移行できます。これまでは、バックアップを手動で作成し、ファイルを S3 にアップロードし、その後別途インポートジョブをトリガーする必要がありました。Stage を使用すると、プロセスが統合され、より高速で、はるかにエラーが発生しにくくなります。詳細については、[Stage を介した Milvus から Zilliz Cloud への移行](./via-stage) を参照してください。

    - **Import**: インポートジョブはステージングバックエンドとして Stage を受け入れるようになり、オブジェクトストレージへの依存を軽減し、トークンの有効期限切れを回避し、クラウドストレージに直接アクセスできないユーザーでも簡単に Zilliz Cloud へデータを移動できるようになります。詳細については、[Create Import Jobs](/reference/restful/create-import-jobs-v2) を参照し、**Request Body** で **Use Stage** を選択してください。

Stage は間もなく、Backup、Import、ETL サービスなどの追加サービスと統合され、Zilliz Cloud 内での非構造化データ処理、データ共有、パイプライン駆動型のワークロードへのサポートを拡張する予定です。

この機能は現在 **Private Preview** です。ご利用のアカウントで有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

## スケジュールされたクラスタースケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud は、**クラスターレベル** で **スケジュールされたスケーリング** をサポートするようになり、予測可能なワークロードパターンに基づいてリソース割り当てを事前に制御できるようになりました。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CU とレプリカのスケジュールベースのオートスケーリング:** 特定のスケジュールを定義して、CU とレプリカを自動的にスケールできるようになりました。ビジネスアワーのピークトラフィックに対応するためにリソースを簡単にスケールアップし、夜間や週末などの閑散期にスケールダウンして、手動介入なしでコストを最適化できます。

- **可視性と制御の強化:** このアップデートでは、スケーリングスケジュールを視覚的に表現することで、オートスケーリング設定の透明性が向上します。

- **プロアクティブな監査:** 透過的なメール通知システムと監査証跡を提供し、リソースの提供とコストについて安心していただけます。

詳細については、[Auto-scaling](./auto-scaling) を参照してください。

## クロスデータベース選択によるクラスターレベルのバックアップからの部分リストア\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

特定の **データベース** と **コレクション** を **クラスターレベルのバックアップ** から選択してリストアできるようになりました。複数のデータベースにまたがるコレクションも対象になります。この機能強化により、復旧時間が短縮され、クラスター全体を復旧することなく、リストアするデータをきめ細かく制御できます。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[クラスターの部分復元](./restore-from-backup-files#restore-a-partial-cluster) を参照してください。

## Zilliz Cloud コンソールでの JSON Path インデックスの作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud は、Web コンソールから直接 JSON Path インデックスを作成できるようになり、半構造化データに対するクエリをより簡単に高速化できるようになりました。この機能は JSON フィールドと動的フィールドの両方をサポートし、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSON path インデックスの詳細については、[JSON フィールド内の値のインデックス作成](./json-indexing) および [dynamic field 内のキーのインデックス作成](./enable-dynamic-field#index-keys-in-the-dynamic-field) を参照してください。

## BYOC プロジェクトのインスタンスクォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloud は、BYOC プロジェクトのカスタムインスタンスクォータ設定をサポートするようになりました。** このアップデートにより柔軟性が向上し、サービスに対して明確なリソース境界を定義することでコストを最適化できます。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **プロジェクトリソースのオートスケーリング制御:** 伸縮自在なリソースモードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定して伸縮性を有効にするか、サービスグループのリソースを固定サイズにロックできます。

- **動的な構成:** コンソールの Project Status ページから、ノードグループのリソースとクォータを直接表示および調整できるようになり、実行中のプロジェクトのリソース割り当てを簡単に変更できます。

- **インデックスサービスクォータの独立した設定:** Zilliz Cloud では、インデックスノードグループのリソースクォータを個別に設定できるようになり、さまざまなワークロードパターンに応じてパフォーマンスとリソース割り当てを細かく調整できます。

詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスターレベルのバックアップリストアを実行する際に、RBAC 構成をリストアするかどうかを選択できます。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" title="Notes">

    この設定は、新しく作成されたバックアップにのみ適用されます。

    </Admonition>

- **Private Preview** および **Public Preview** の機能について、使用する前に確認できるようになりました。これらの機能を使用するには、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- インポートリクエストごとの合計ファイルサイズが、100 GB から 1 TB に引き上げられました。

- 手動で作成されたバックアップの保持期間は、組織が凍結状態になると、永続のままではなく 30 日に変更されるようになり、ストレージコストの削減に役立ちます。
