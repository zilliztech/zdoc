---
title: "リリースノート（2025年7月15日） | Cloud"
slug: /release-notes-2180
sidebar_key: release-notes-2180
sidebar_label: "2025年7月15日"
beta: FALSE
notebook: FALSE
description: "本リリースでは、Zilliz Cloud が運用効率、柔軟性、およびユーザーエクスペリエンスの向上を目的とした複数の強力な機能強化を導入します。これらには、クラスターレベルのスケジュールされた自動スケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーである stage の導入、クロスデータベース選択を伴うクラスターレベルのバックアップからの部分リストア、および JSON Path インデックスの UI サポートが含まれます。これらの機能を組み合わせることで、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI 時代の開発サイクルを加速することができます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 11
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

このリリースでは、Zilliz Cloudが運用効率、柔軟性、およびユーザーエクスペリエンスの向上を目的とした複数の強力な機能強化を導入します。これらには、クラスターレベルのスケジュールされたオートスケーリングのサポート、新しいMerge データ APIによるスキーマ進化、データ取り込みを効率化するクラウドネイティブなデータレイヤーであるステージの導入、クロスデータベース選択を伴うクラスターレベルのバックアップからの部分リストア、およびJSONパスインデックスのUIサポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI時代の開発サイクルを短縮できます。

## Milvus互換性\{#milvus-compatibility}

このリリース以降に作成されたすべてのZilliz Cloudクラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.xのすべての機能は **一般提供** となります。

機能の利用可能性の詳細については、[現在の機能利用可能性](./feature-availability#current-feature-availability) を参照してください。

## Merge データ APIによるスキーマ進化 | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI時代において、ビジネスロジックの迅速なイテレーションにより、これまで以上に頻繁なスキーマ変更が求められる一方、それらは依然としてコストがかかり、運用上複雑です。スキーマの更新は、多くの場合、コレクションの再構築を意味します：データのエクスポート、新しいフィールドのマージ、そしてすべてを最初から再インポートします。この手動プロセスは時間がかかり、エラーが発生しやすく、しばしば長期間の書き込みダウンタイムを必要とします。

この課題に対処するため、Zillizは自動化されたスキーマ進化のための新しい **バッチETL機能** を導入します。このリリースの一環として、ETLサービスに新しい **Merge データ RESTful API** が追加され、単一のAPI呼び出しで大規模なスキーマ更新を実行できるようになりました。このAPIにより、既存のコレクション（Base）と外部ファイル（プライマリキーと新しいフィールドを含む）をマージして、更新されたスキーマを持つ新しいコレクション（Target）を生成できます。検証後、ユーザーはエイリアスを更新するだけで、最小限の中断で切り替えることができます。

裏側では、Merge データ APIは分散バッチ処理エンジンとステージ、Backup、Join、Importを単一の操作にオーケストレーションします。ユーザーは各ステップを手動で調整する必要がなくなりました。データ検証からインポートまでのプロセス全体が自動的に処理されます。これにより運用負担が大幅に軽減され、スキーマ更新が **日単位ではなく時間単位** で完了できるようになります。

<Admonition type="info" icon="📘" title="Notes">

<p>マージプロセス中は、データ整合性を確保するため、ベースコレクションへの書き込みを停止する必要があります。</p>

</Admonition>

この機能は現在 **プライベートプレビュー** です。アカウントで有効化するには、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us) ください。関連するRESTful APIリファレンスページについては、[Merge データ](/reference/restful/merge-data-v2) を参照してください。

## ステージの紹介：Zilliz Cloudのデータレイヤー | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

**ステージ**、まったく新しい機能であり、Zilliz Cloudの基盤となる **データレイヤー** を紹介できることを嬉しく思います。

ステージは、非構造化データのための管理されたクラウドネイティブなステージング領域を提供します。これは、ベクトルクラスターへの移行とインポートのためのデータのアップロード、キャッシュ、準備を含むスケーラブルなデータ移動をサポートするために目的特化されており、Zillizサービス全体のETLワークフローの統一レイヤーとして機能します。

この初期リリース（**プライベートプレビュー**）では、ユーザーは以下のことができます：

- RESTful APIを介して **ステージを管理** する。ステージの [作成](/reference/restful/create-volume-v2)、[一覧表示](/reference/restful/list-volumes-v2)、[削除](/reference/restful/delete-volume-v2) を含む

- データオンボーディングを効率化するため、**Migration** および **Import** サービスの両方で **ステージを共有ステージングレイヤーとして使用** する：

    - **Migration**: ローカルのMilvus環境からZilliz Cloudへのデータ移行を、単一のステップでシームレスに実行します。以前は、ユーザーは手動でバックアップを作成し、ファイルをS3にアップロードし、インポートジョブを個別にトリガーする必要がありました。ステージを使用すると、プロセスが統一され、高速化され、エラーが大幅に減少します。詳細については、[ステージを介したMilvusからZilliz Cloudへの移行](./via-stage) を参照してください。

    - **Import**: インポートジョブがステージをステージングバックエンドとして受け入れるようになり、オブジェクトストレージへの依存を減らし、トークンの期限切れを回避し、直接のクラウドストレージアクセスを持たないユーザーが簡単にZilliz Cloudにデータを移動できるようになります。詳細については、[インポートジョブの作成](/reference/restful/create-import-jobs-v2) を参照し、**リクエストボディ** で **Use ステージ** を選択してください。

ステージはまもなくBackup、Import、ETLサービスなどの追加サービスと統合され、Zilliz Cloud内での非構造化データ処理、データ共有、およびパイプライン駆動のワークロードへのサポートを拡張します。

この機能は現在 **プライベートプレビュー** です。アカウントで有効化するには、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us) ください。

## スケジュールされたクラスタースケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloudは、**クラスターレベル** での **スケジュールされたスケーリング** をサポートするようになり、予測可能なワークロードパターンに基づいてリソース配分を能動的に制御できます。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CUおよびレプリカのスケジュールベースのオートスケーリング:** 特定のスケジュールを定義して、CUおよびレプリカを自動的にスケールできるようになりました。ビジネス時間帯のピークトラフィックに対応するためにリソースをスケールアップし、夜間や週末などの静かな時間帯にスケールダウンして、手動の介入なしにコストを最適化できます。

- **可視性と制御の向上:** このアップデートにより、スケーリングスケジュールの視覚的表現を導入することで、オートスケーリング設定への透明性が向上します。

- **能動的な監査:** リソース提供とコストに安心感を与える、透明なメール通知システムと監査証跡を提供します。

詳細については、[クラスターのオートスケーリング](./scale-query-cu) を参照してください。

## クロスデータベース選択を伴うクラスターレベルのバックアップからの部分リストア\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**クラスターレベルのバックアップ** から、複数のデータベースにまたがるコレクションを含む、特定の **データベース** および **コレクション** を選択的にリストアできるようになりました。この機能強化により、復旧時間が短縮され、クラスター全体を復旧する必要なく、どのデータをリストアするかを細かく制御できます。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[クラスターの部分リストア](./restore-from-backup-files#restore-a-partial-cluster) を参照してください。

## Zilliz CloudコンソールでのJSONパスインデックスの作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloudは、Webコンソールから直接JSONパスインデックスを作成することをサポートするようになり、半構造化データへのクエリを加速しやすくなりました。この機能は、JSONフィールドとダイナミックフィールドの両方をサポートし、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSONパスインデックスの詳細については、[JSONフィールド内の値のインデックス作成](./use-json-fields) および [ダイナミックフィールド内のキーのインデックス作成](./enable-dynamic-field#index-keys-in-the-dynamic-field) を参照してください。

## BYOCプロジェクトのインスタンスクォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloudは、BYOCプロジェクトのカスタムインスタンスクォータ設定をサポートするようになりました。** このアップデートにより、サービスの明確なリソース境界を定義することでコストを最適化できる、より大きな柔軟性が提供されます。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **プロジェクトリソースのオートスケーリング制御:** 弾力モードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定して弾力性を有効にするか、サービスグループのリソースを固定サイズにロックできます。

- **動的な設定:** コンソールのプロジェクトステータスページから、ノードグループのリソースとクォータを直接表示および調整できるようになり、実行中のプロジェクトのリソース配分を簡単に変更できます。

- **独立したインデックスサービスクォータ:** Zilliz Cloudでは、インデックスノードグループのリソースクォータを独立して設定できるようになり、異なるワークロードパターンに対してパフォーマンスとリソース配分を微調整できます。

詳細については、[AWSへのBYOCのデプロイ](/docs/byoc/deploy-byoc-aws)、[AWSへのBYOC-Iのデプロイ](/docs/byoc/deploy-byoc-i-aws)、および [GCPへのBYOCのデプロイ](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスターレベルのバックアップリストアを実行する際に、RBAC設定をリストアするかどうかを選択できます。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="Notes">

    <p>この設定は、新しく作成されたバックアップにのみ適用されます。</p>

    </Admonition>

- **プライベートプレビュー** および **パブリックプレビュー** の機能を使用する前に、それらについて確認できます。これらの機能を使用するには、[Zilliz Cloud サポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- インポートリクエストあたりの合計ファイルサイズが100 GBから1 TBに増加しました。

- 手動でバックアップを作成する場合の保持期間は、組織が凍結状態になった後、永続的なままではなく30日に変更され、ストレージコストの節約に役立ちます。

