---
title: "リリースノート（2025年7月15日） | Cloud"
slug: /release-notes-2180
sidebar_label: "2025年7月15日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入しています。これには、クラスター レベルのスケジュールされたオートスケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーである Stage の導入、クラスター レベルのバックアップからのクロスデータベース選択による部分リストア、JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、保守負荷を削減し、GenAI 時代における開発サイクルを加速できます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 12
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入しています。これには、クラスター レベルのスケジュールされたオートスケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーである Stage の導入、クラスター レベルのバックアップからのクロスデータベース選択による部分リストア、JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、保守負荷を削減し、GenAI 時代における開発サイクルを加速できます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能は **Generally Available** です。 

機能の提供状況の詳細については、[Current Feature Availability](./feature-availability#current-feature-availability) を参照してください。

## Merge Data API によるスキーマ進化 | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI 時代では、ビジネスロジックの高速な反復により、これまで以上に頻繁なスキーマ変更が発生していますが、それでもなおコストが高く、運用面でも複雑です。スキーマの更新には、多くの場合コレクションの再構築が必要です。つまり、データをエクスポートし、新しいフィールドをマージし、すべてを最初から再インポートしなければなりません。この手動プロセスは時間がかかり、エラーが発生しやすく、長時間の書き込み停止が必要になることも少なくありません。

この課題に対処するため、Zilliz はスキーマ進化を自動化する新しい **バッチ ETL 機能** を導入します。このリリースの一環として、ETL サービス配下に新しい **Merge Data RESTful API** が追加され、ユーザーは 1 回の API 呼び出しで大規模なスキーマ更新を実行できるようになりました。この API では、既存のコレクション（Base）と外部ファイル（主キーと新しいフィールドを含む）をマージし、更新されたスキーマを持つ新しいコレクション（Target）を生成できます。検証後は、エイリアスを更新するだけで最小限の中断で切り替えられます。

内部的には、Merge Data API は分散バッチ処理エンジンと、Stage、Backup、Join、Import を単一の操作としてオーケストレーションします。ユーザーは各ステップを手動で調整する必要がなくなります。データ検証からインポートまでの全プロセスは自動的に処理されます。これにより運用負荷が大幅に軽減され、スキーマ更新を **数日ではなく数時間** で完了できるようになります。

<Admonition type="info" icon="📘" title="Notes">

マージ処理中は、データ整合性を確保するため、ベースコレクションへの書き込みを停止する必要があります。

</Admonition>

この機能は現在 **Private Preview** です。アカウントで有効にするには、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。関連する RESTful API リファレンスページについては、[Merge Data](/reference/restful/merge-data-v2) を参照してください。

## Stage の紹介: Zilliz Cloud のデータレイヤー | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

**Stage** というまったく新しい機能、そして Zilliz Cloud の基盤となる **Data Layer** を導入できることを嬉しく思います。

Stage は、非構造化データ向けの管理されたクラウドネイティブなステージング領域を提供します。これは、アップロード、キャッシュ、ベクトルクラスターへの移行およびインポートに向けたデータ準備など、スケーラブルなデータ移動をサポートするために専用に設計されており、Zilliz サービス全体の ETL ワークフローに対する統合レイヤーとして機能します。

この初回リリース（**Private Preview**）では、ユーザーは次のことができます。

- [Create](/reference/restful/create-volume-v2)、[list](/reference/restful/list-volumes-v2)、[delete](/reference/restful/delete-volume-v2) などの RESTful API を使用して **Stage を管理** できます

- **Migration** と **Import** の両サービスで **共有ステージングレイヤーとして Stage を使用** し、データオンボーディングを効率化できます。

    - **Migration**: ローカルの Milvus 環境から Zilliz Cloud へ、データを 1 ステップでシームレスに移行できます。これまでは、ユーザーは手動でバックアップを作成し、ファイルを S3 にアップロードし、その後で個別にインポートジョブを起動する必要がありました。Stage により、このプロセスは統合され、より高速かつはるかにエラーが起こりにくくなります。詳細については、[Stage を介して Milvus から Zilliz Cloud へ移行する](./via-stage) を参照してください。

    - **Import**: Import ジョブで Stage をステージングバックエンドとして使用できるようになり、オブジェクトストレージへの依存を減らし、トークンの有効期限切れを回避し、クラウドストレージに直接アクセスできないユーザーでも簡単にデータを Zilliz Cloud に移動できるようになります。詳細については、[Create Import Jobs](/reference/restful/create-import-jobs-v2) を参照し、**Request Body** で **Use Stage** を選択してください。

Stage は今後、Backup、Import、ETL サービスなどの追加サービスとも統合され、Zilliz Cloud 内での非構造化データ処理、データ共有、パイプライン駆動型ワークロードへのサポートが拡張される予定です。

この機能は現在 **Private Preview** です。アカウントで有効にするには、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。

## スケジュールされたクラスター スケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud は **クラスター レベル** での **スケジュールスケーリング** をサポートするようになり、予測可能なワークロードパターンに基づいてリソース割り当てを事前に制御できるようになりました。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CU と Replicas のスケジュールベースのオートスケーリング:** CU と Replicas を自動的にスケーリングするための特定のスケジュールを定義できるようになりました。営業時間中のピークトラフィックに対応するためにリソースを簡単にスケールアップし、夜間や週末などの閑散時間帯にはスケールダウンすることで、手動介入なしにコストを最適化できます。

- **可視性と制御の強化:** この更新により、スケーリングスケジュールの視覚的な表示が導入され、オートスケーリング設定の透明性が向上します。

- **プロアクティブな監査:** 透明性の高いメール通知システムと監査証跡を提供し、リソース提供とコストに関して安心感を得られます。

詳細については、[Cluster Auto-scaling](./auto-scaling) を参照してください。

## クラスター レベルのバックアップからの部分リストアでクロスデータベース選択をサポート\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**クラスター レベルのバックアップ** から、複数のデータベースにまたがるコレクションを含め、特定の **データベース** と **コレクション** を選択的にリストアできるようになりました。この機能強化により、クラスター全体を復旧することなく、復旧時間を短縮し、どのデータをリストアするかを細かく制御できます。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[Restore a Partial Cluster](./restore-from-backup-files#restore-a-partial-cluster) を参照してください。

## Zilliz Cloud Console で JSON Path インデックスを作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud は、Web コンソールから直接 JSON Path インデックスを作成できるようになり、半構造化データに対するクエリをより簡単に高速化できるようになりました。この機能は、JSON フィールドと動的フィールドの両方をサポートし、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSON Path インデックスの詳細については、[JSON フィールド内の値にインデックスを作成する](./json-indexing) および [動的フィールド内のキーにインデックスを作成する](./enable-dynamic-field#index-keys-in-the-dynamic-field) を参照してください。

## BYOC プロジェクトのインスタンスクォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloud は、BYOC プロジェクト向けのカスタムインスタンスクォータ設定をサポートするようになりました**。この更新により柔軟性が向上し、サービスに対して明確なリソース境界を定義することでコストを最適化できます。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **プロジェクトリソースのオートスケーリング制御:** エラスティックモードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定してエラスティシティを有効にするか、サービスグループのリソースを固定サイズにロックできます。

- **動的な構成:** コンソールの Project Status ページから、ノードグループのリソースとクォータを直接表示および調整できるようになり、実行中のプロジェクトのリソース割り当てを簡単に変更できます。

- **独立したインデックスサービスクォータ:** Zilliz Cloud では、インデックスノードグループのリソースクォータを個別に設定できるようになり、異なるワークロードパターンに合わせてパフォーマンスとリソース割り当てを細かく調整できます。

詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスター レベルのバックアップリストアを実行する際に、RBAC 構成をリストアするかどうかを選択できます。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="Notes">

    この設定は、新しく作成されたバックアップにのみ適用されます。

    </Admonition>

- **Private Preview** および **Public Preview** の機能について、使用前に確認できるようになりました。これらの機能を使用するには、[Zilliz Cloud support](https://support.zilliz.com/hc/en-us) にお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- インポートリクエストあたりの合計ファイルサイズが、100 GB から 1 TB に引き上げられました。

- 手動で作成されたバックアップの保持期間は、組織が凍結状態になると永久ではなく 30 日に変更され、ストレージコストの削減に役立ちます。

