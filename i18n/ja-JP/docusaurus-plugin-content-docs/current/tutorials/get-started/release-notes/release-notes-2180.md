---
title: "リリースノート（2025年7月15日） | Cloud"
slug: /release-notes-2180
sidebar_label: "2025年7月15日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入しました。これには、クラスター レベルのスケジュール自動スケーリングのサポート、新しい Merge Data API によるスキーマ進化、効率的なデータ取り込みのためのクラウドネイティブなデータレイヤーである Stage の導入、クラスター レベルのバックアップからのクロスデータベース選択を伴う部分復元、JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスの負荷を軽減し、GenAI 時代における開発サイクルを高速化できます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザー体験の向上を目的とした複数の強力な機能強化を導入しました。これには、クラスター レベルのスケジュール自動スケーリングのサポート、新しい Merge Data API によるスキーマ進化、効率的なデータ取り込みのためのクラウドネイティブなデータレイヤーである Stage の導入、クラスター レベルのバックアップからのクロスデータベース選択を伴う部分復元、JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスの負荷を軽減し、GenAI 時代における開発サイクルを高速化できます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **Generally Available** です。 

機能の提供状況の詳細については、[Current Feature Availability](./feature-availability#current-feature-availability) を参照してください。

## Merge Data API によるスキーマ進化 | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI 時代では、ビジネスロジックの迅速な反復により、これまで以上に頻繁なスキーマ変更が求められますが、その一方でコストが高く、運用上も複雑です。スキーマの更新には多くの場合 Collection の再構築が必要であり、データのエクスポート、新しいフィールドのマージ、そしてすべてのデータの再インポートを最初から行わなければなりません。この手動プロセスは時間がかかり、エラーが発生しやすく、長時間の書き込み停止を必要とすることも少なくありません。

この課題に対応するため、Zilliz はスキーマ進化を自動化する新しい **バッチ ETL 機能** を導入しました。このリリースの一環として、ETL サービスに新しい **Merge Data RESTful API** が追加され、ユーザーは単一の API 呼び出しで大規模なスキーマ更新を実行できます。この API では、既存の Collection（Base）と外部ファイル（プライマリキーと新しいフィールドを含む）をマージして、更新後のスキーマを持つ新しい Collection（Target）を生成できます。検証後、ユーザーはエイリアスを更新するだけで、最小限の影響で切り替えられます。

内部的には、Merge Data API は分散バッチ処理エンジンを Stage、Backup、Join、Import とともに 1 つのオペレーションとして統合・実行します。ユーザーは各ステップを手動で調整する必要がなくなります。データ検証からインポートまでのプロセス全体が自動的に処理されます。これにより運用負荷が大幅に軽減され、スキーマの更新を **数日ではなく数時間** で完了できるようになります。

<Admonition type="info" icon="📘" title="注意">

マージ処理中は、データ整合性を確保するため、ベース Collection への書き込みを停止する必要があります。

</Admonition>

この機能は現在 **Private Preview** です。アカウントで有効にするには、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。関連する RESTful API リファレンスページについては、[Merge Data](/reference/restful/merge-data-v2) を参照してください。

## Stage の導入：Zilliz Cloud のデータレイヤー | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

このたび、まったく新しい機能であり、**Zilliz Cloud の基盤となるデータレイヤー**である **Stage** をご紹介します。

Stage は、非構造化データ向けのマネージドなクラウドネイティブ ステージングエリアを提供します。これは、ベクトルクラスターへの移行およびインポートに向けたデータのアップロード、キャッシュ、準備を含むスケーラブルなデータ移動をサポートするために構築されており、Zilliz の各種サービスにまたがる ETL ワークフローの統合レイヤーとして機能します。

この初回リリース（**Private Preview**）では、ユーザーは次のことが可能です。

- RESTful API を介して **stage を管理**できます。これには、stage の [Create](/reference/restful/create-volume-v2)、[list](/reference/restful/list-volumes-v2)、[delete](/reference/restful/delete-volume-v2) が含まれます

- **Migration** と **Import** の両サービスに共通するステージングレイヤーとして **Stage を使用**し、データ取り込みを効率化できます。

    - **Migration**: ローカルの Milvus 環境から Zilliz Cloud へ、単一ステップでシームレスにデータを移行できます。従来、ユーザーはバックアップの手動作成、ファイルの S3 へのアップロード、インポートジョブの個別起動を行う必要がありました。Stage により、プロセスは統合され、より高速で、エラーも大幅に減少します。詳細については、[Migrate from Milvus to Zilliz Cloud Via Stage](./via-stage) を参照してください。

    - **Import**: Import ジョブで Stage をステージングバックエンドとして利用できるようになり、オブジェクトストレージへの依存を減らし、トークン期限切れを回避し、クラウドストレージへ直接アクセスできないユーザーでも簡単にデータを Zilliz Cloud に移動できるようになります。詳細については、[Create Import Jobs](/reference/restful/create-import-jobs-v2) を参照し、**Request Body** で **Use Stage** を選択してください。

Stage は今後、Backup、Import、ETL サービスなどの追加サービスとも統合され、非構造化データ処理、データ共有、Zilliz Cloud 内でのパイプライン駆動ワークロードへの対応を拡張していく予定です。

この機能は現在 **Private Preview** です。アカウントで有効にするには、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。

## スケジュールされたクラスター スケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud は、**クラスター レベル**での **スケジュールスケーリング** をサポートするようになり、予測可能なワークロードパターンに基づいて、リソース割り当てを事前に制御できるようになりました。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CU とレプリカのスケジュールベース自動スケーリング:** 特定のスケジュールを定義して、CU とレプリカを自動的にスケールできるようになりました。営業時間中のピークトラフィックに対応するためにリソースを簡単にスケールアップし、夜間や週末など静かな時間帯にはスケールダウンすることで、手動介入なしにコストを最適化できます。

- **可視性と制御の向上:** このアップデートにより、スケーリングスケジュールが視覚的に表示され、自動スケーリング設定の透明性がさらに高まりました。

- **プロアクティブな監査:** メール通知システムと監査証跡により、リソース提供とコストをより安心して管理できます。

詳細については、[Cluster Auto-scaling](./auto-scaling) を参照してください。

## クロスデータベース選択を伴うクラスター レベルバックアップからの部分復元\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**クラスター レベルバックアップ**から、複数のデータベースにまたがるコレクションを含め、特定の **データベース** および **コレクション** を選択的に復元できるようになりました。この機能強化により、クラスター全体を復旧する必要なく、復元対象のデータを細かく制御でき、復旧時間も短縮されます。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[Restore a Partial Cluster](./restore-from-backup-files) を参照してください。

## Zilliz Cloud Console で JSON Path インデックスを作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud は、Web コンソールから直接 JSON Path インデックスを作成できるようになり、半構造化データに対するクエリをより簡単に高速化できるようになりました。この機能は JSON フィールドと動的フィールドの両方をサポートしており、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSON path インデックスの詳細については、[Index Values Inside a JSON Field](./json-indexing) および [Index Keys in the Dynamic Field](./enable-dynamic-field) を参照してください。

## BYOC プロジェクトのインスタンス クォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloud は、BYOC プロジェクト向けにカスタム インスタンス クォータ設定をサポートするようになりました**。このアップデートにより柔軟性が向上し、サービスの明確なリソース境界を定義することでコストを最適化できるようになります。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **プロジェクト リソースの自動スケーリング制御:** 弾力的リソースモードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定して弾力性を有効化することも、サービスグループのリソースを固定サイズにロックすることもできます。

- **動的設定:** コンソールの Project Status ページからノードグループのリソースとクォータを直接確認・調整できるようになり、実行中のプロジェクトのリソース割り当てを簡単に変更できます。

- **独立したインデックスサービス クォータ:** Zilliz Cloud では、インデックス ノードグループのリソース クォータを個別に設定できるようになり、異なるワークロードパターンに応じてパフォーマンスとリソース割り当てを細かく調整できます。

詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスター レベルのバックアップ復元を実行する際に、RBAC 設定を復元するかどうかを選択できるようになりました。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="注意">

    この設定は、新しく作成されたバックアップにのみ適用されます。

    </Admonition>

- 使用前に **Private Preview** および **Public Preview** の機能について確認できるようになりました。これらの機能を利用するには、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- インポートリクエストあたりの合計ファイルサイズ上限が 100 GB から 1 TB に引き上げられました。

- 手動作成されたバックアップの保持期間は、組織が凍結状態になると永久保持ではなく 30 日間に変更されるようになり、ストレージコストの削減に役立ちます。

