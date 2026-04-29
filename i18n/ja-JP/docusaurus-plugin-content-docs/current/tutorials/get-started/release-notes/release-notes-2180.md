---
title: "リリースノート（2025 年 7 月 15 日） | Cloud"
slug: /release-notes-2180
sidebar_key: release-notes-2180
sidebar_label: "2025 年 7 月 15 日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は運用効率、柔軟性、ユーザーエクスペリエンスの向上を目的としたいくつかの強力な機能強化を導入しました。これには、クラスターレベルのスケジュールされた自動スケーリングのサポート、新しい Merge Data API によるスキーマ進化、データ取り込みを合理化するクラウドネイティブなデータ層である stage の導入、クロスデータベース選択によるクラスターレベルのバックアップからの部分復元、および JSON Path インデックスの UI サポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI 時代における開発サイクルを加速させることができます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 9
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年7月15日）

今回のリリースでは、運用効率、柔軟性、ユーザーエクスペリエンスを向上させるための強力な機能強化がZilliz Cloudに導入されました。これには、クラスターレベルのスケジュールされたオートスケーリング、新しいMerge データ APIによるスキーマ進化、データ取り込みを合理化するクラウドネイティブデータレイヤー「ステージ」の導入、クラスターレベルのバックアップからのデータベース横断的な部分復元、およびJSONパスインデックスのUIサポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンス負荷を軽減し、GenAI時代における開発サイクルを加速できます。

## Milvus互換性\{#milvus-compatibility}

このリリース以降に作成されたすべてのZilliz Cloudクラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.xのすべての機能が **一般提供** されています。

機能の提供状況の詳細については、[現在の機能提供状況](./feature-availability#current-feature-availability) を参照してください。

## Merge データ APIによるスキーマ進化 | プライベート\{#schema-evolution-via-merge-data-api}

GenAI時代において、ビジネスロジックの急速な反復によりスキーマ変更がこれまで以上に頻繁に行われるようになっていますが、そのコストと運用の複雑さは依然として課題です。スキーマを更新するには通常、コレクションを再構築する必要があります。つまり、データをエクスポートし、新しいフィールドをマージしてから、すべてをゼロから再インポートするという手順です。この手動プロセスは時間がかかり、エラーが発生しやすく、長時間の書き込み停止を伴うことがよくあります。

この課題に対処するため、Zillizはスキーマ進化を自動化する新しい **バッチETL機能** を導入しました。今回のリリースの一環として、ETLサービスに新しい **Merge データ RESTful API** が追加され、ユーザーは単一のAPI呼び出しで大規模なスキーマ更新を実行できるようになります。このAPIは、既存のコレクション（Base）と外部ファイル（主キーと新しいフィールドを含む）をマージし、更新されたスキーマを持つ新しいコレクション（Target）を生成します。検証後、エイリアスを更新するだけで最小限の中断で切り替えが可能です。

内部的には、Merge データ APIが分散型バッチ処理エンジンとステージ、Backup、Join、Importを単一の操作としてオーケストレーションします。ユーザーはもはや各ステップを手動で調整する必要はありません。データ検証からインポートまでの全プロセスが自動で処理されるため、運用負担が大幅に軽減され、スキーマ更新が **日単位ではなく時間単位** で完了するようになります。

<Admonition type="info" icon="📘" title="Notes">

<p>マージ処理中は、データの一貫性を確保するためにベースコレクションへの書き込みを一時停止する必要があります。</p>

</Admonition>

この機能は現在 **プライベートプレビュー** 段階です。アカウントでの利用を希望される場合は、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。関連するRESTful APIリファレンスページについては、[Merge データ](/reference/restful/merge-data-v2) を参照してください。

## Zilliz Cloudのデータレイヤー「ステージ」の紹介 | プライベート\{#introducing-stage-the-data-layer-of-zilliz-cloud}

この度、まったく新しい機能である **ステージ** — **Zilliz Cloudの基盤となるデータレイヤー** — をご紹介します。

ステージは、非構造化データ向けのマネージドかつクラウドネイティブなステージング領域を提供します。これは、ベクトルクラスターへのデータ移行およびインポートのためのアップロード、キャッシュ、準備を含む、スケーラブルなデータ移動を目的として設計されており、Zillizサービス全体のETLワークフローを統合するレイヤーとして機能します。

今回の初期リリース（**プライベートプレビュー**）では、ユーザーは以下の操作が可能になります：

- RESTful API経由でステージを **管理**（[作成](/reference/restful/create-volume-v2)、[一覧表示](/reference/restful/list-volumes-v2)、[削除](/reference/restful/delete-volume-v2)）

- **Migration** および **Import** サービスの両方で **共有ステージングレイヤーとしてステージを利用** し、データオンボーディングを合理化：

    - **Migration**: ローカルのMilvus環境からZilliz Cloudへ、ワンステップでシームレスにデータを移行できます。従来は、手動でバックアップを作成し、ファイルをS3にアップロードしてから別途インポートジョブをトリガーする必要がありました。ステージを利用することで、このプロセスが統合され、より高速かつエラーが少なくなります。詳細については、[ステージ経由でMilvusからZilliz Cloudへ移行する](./via-stage) を参照してください。

    - **Import**: インポートジョブがステージをステージングバックエンドとして受け入れるようになったため、オブジェクトストレージへの依存が減り、トークンの有効期限切れを回避でき、直接クラウドストレージにアクセスできないユーザーでも簡単にZilliz Cloudにデータを移動できます。詳細については、[インポートジョブの作成](/reference/restful/create-import-jobs-v2) を参照し、**リクエストボディ** 内で **Use ステージ** を選択してください。

ステージは今後、Backup、Import、ETLサービスなど他のサービスとも統合され、Zilliz Cloud内での非構造化データ処理、データ共有、パイプライン駆動型ワークロードへの対応を拡張していく予定です。

この機能は現在 **プライベートプレビュー** 段階です。アカウントでの利用を希望される場合は、[サポートにお問い合わせください](https://support.zilliz.com/hc/en-us)。

## スケジュールされたクラスタースケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloudでは、**クラスターレベル** での **スケジュールされたスケーリング** がサポートされるようになりました。これにより、予測可能なワークロードパターンに基づいてリソース割り当てを事前に制御できます。

![EKkTb21RooyES7x1alDcKL66nyh](https://zdoc-images.s3.us-west-2.amazonaws.com/ekktb21rooyes7x1aldckl66nyh.png "EKkTb21RooyES7x1alDcKL66nyh")

- **CUおよびレプリカのスケジュールベースのオートスケーリング**: 特定のスケジュールを定義して、CUとレプリカを自動的にスケーリングできます。営業時間中のピークトラフィックに対応するためにリソースを簡単にスケールアップし、夜間や週末などの閑散期にはコストを最適化するためにスケールダウンできます。手動での介入は不要です。

- **可視性と制御の強化**: このアップデートにより、スケーリングスケジュールの視覚的表現を通じて、オートスケーリング設定の透明性が高まりました。

- **プロアクティブな監査**: リソース配信とコストに対する安心感を提供するため、透明性の高いメール通知システムと監査ログを提供しています。

詳細については、[クラスターオートスケーリング](./scale-query-cu) を参照してください。

## データベース横断的な選択によるクラスターレベルのバックアップからの部分復元\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**クラスターレベルのバックアップ** から特定の **データベース** や **コレクション** を選択的に復元できるようになりました。これにより、複数のデータベースにまたがるコレクションも含めて復元が可能になり、復旧時間を短縮し、復元するデータをきめ細かく制御できます。クラスター全体を復元する必要がなくなりました。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](https://zdoc-images.s3.us-west-2.amazonaws.com/sd5pber5poupnlx6nm6ccrdxntd.png "Sd5PbeR5poupNlx6nM6cCrdxnTd")

詳細については、[クラスターの部分復元](./restore-from-snapshot#restore-a-partial-cluster) を参照してください。

## Zilliz CloudコンソールでJSONパスインデックスを作成可能に\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloudでは、Webコンソールから直接JSONパスインデックスを作成できるようになりました。これにより、半構造化データに対するクエリを簡単に高速化できます。この機能はJSONフィールドおよびダイナミックフィールドの両方をサポートし、柔軟で高性能なフィルタリングを実現します。

![PDbobfoUDolZd4xKR8kcDXqIn0f](https://zdoc-images.s3.us-west-2.amazonaws.com/pdbobfoudolzd4xkr8kcdxqin0f.png "PDbobfoUDolZd4xKR8kcDXqIn0f")

JSONパスインデックスの詳細については、[JSONフィールド内の値にインデックスを作成する](./use-json-fields) および [ダイナミックフィールド内のキーにインデックスを作成する](./enable-dynamic-field#index-keys-in-the-dynamic-field) を参照してください。

## BYOCプロジェクトのインスタンスクォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloudでは、BYOCプロジェクト向けのカスタムインスタンスクォータ設定がサポートされるようになりました**。このアップデートにより、サービスの明確なリソース境界を定義してコストを最適化できる柔軟性が向上します。

![OHwLbK4X5odr2gxJ6LicTawHn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/ohwlbk4x5odr2gxj6lictawhn3f.png "OHwLbK4X5odr2gxJ6LicTawHn3f")

- **プロジェクトリソースのオートスケーリング制御**: 弾力性のあるモードと固定モードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定して弾力性を有効化するか、サービスグループのリソースを固定サイズにロックできます。

- **動的設定**: コンソールのプロジェクトステータスページから直接ノードグループのリソースとクォータを表示・調整できるようになったため、実行中のプロジェクトのリソース割り当てを簡単に変更できます。

- **インデックスサービスの独立したクォータ**: Zilliz Cloudでは、インデックスノードグループのリソースクォータを個別に設定できるようになったため、異なるワークロードパターンに対してパフォーマンスとリソース割り当てをきめ細かく調整できます。

詳細については、[AWS上にBYOCをデプロイする](/docs/byoc/deploy-byoc-aws)、[AWS上にBYOC-Iをデプロイする](/docs/byoc/deploy-byoc-i-aws)、および [GCP上にBYOCをデプロイする](/docs/byoc/deploy-byoc-gcp) を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスターレベルのバックアップ復元時に、RBAC設定を復元するかどうかを選択できるようになりました。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](https://zdoc-images.s3.us-west-2.amazonaws.com/knj8bzqaroyqzwxsguhcjduan7c.png "KNJ8bzQaroYqzWxsgUhcjduAn7c")

    <Admonition type="info" icon="📘" title="Notes">

    <p>この設定は新しく作成されたバックアップにのみ適用されます。</p>

    </Admonition>

- **プライベートプレビュー** および **パブリックプレビュー** の機能を実際に使用する前に、その内容を確認できるようになりました。これらの機能を使用するには、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us) にお問い合わせください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](https://zdoc-images.s3.us-west-2.amazonaws.com/jfjpbrk00oevsvx4kntc101snfb.png "JFjPbrK00oEVsvx4kntc101Snfb")

- インポートリクエストごとの合計ファイルサイズの上限が100 GBから1 TBに引き上げられました。

- 組織が凍結された場合、手動で作成されたバックアップの保持期間は永久ではなく30日に変更され、ストレージコストを節約できます。

