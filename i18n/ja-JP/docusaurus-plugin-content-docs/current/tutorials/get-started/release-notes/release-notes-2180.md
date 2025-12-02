---
title: "リリースノート (2025年7月15日) | Cloud"
slug: /release-notes-2180
sidebar_label: "リリースノート (2025年7月15日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloudは運用効率、柔軟性、およびユーザーエクスペリエンスの向上を目指したいくつかの強力な機能強化を導入します。これらには、クラスターレベルのスケジュール自動スケーリングのサポート、新しいMerge Data APIによるスキーマ進化、データ取り込みを合理化するクラウドネイティブデータレイヤーであるstageの導入、データベース間選択によるクラスターレベルバックアップからの部分リストア、およびJSONパスインデックスのUIサポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI時代の開発サイクルを加速できます。 | Cloud"
type: origin
token: WBONwyqFAi02DTkCG41c93wCn6e
sidebar_position: 4
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';


# リリースノート (2025年7月15日)

このリリースでは、Zilliz Cloudは運用効率、柔軟性、およびユーザーエクスペリエンスの向上を目指したいくつかの強力な機能強化を導入します。これらには、クラスターレベルのスケジュール自動スケーリングのサポート、新しいMerge Data APIによるスキーマ進化、データ取り込みを合理化するクラウドネイティブデータレイヤーであるstageの導入、データベース間選択によるクラスターレベルバックアップからの部分リストア、およびJSONパスインデックスのUIサポートが含まれます。これらの機能により、ユーザーは複雑なワークロードをより効果的に管理し、メンテナンスのオーバーヘッドを削減し、GenAI時代の開発サイクルを加速できます。

## Milvus互換性\{#milvus-compatibility}

このリリース後に作成されたすべてのZilliz Cloudクラスターは**Milvus v2.5.x**と互換性があり、Milvus v2.5.xのすべての機能は**一般提供**です。

機能可用性の詳細については、[現在の機能可用性](./feature-availability#current-feature-availability)を参照してください。

## Merge Data APIによるスキーマ進化 | PRIVATE\{#schema-evolution-via-merge-data-api}

GenAI時代では、ビジネスロジックの急速な反復により、これまで以上に頻繁なスキーマ変更が駆動されますが、これらは依然としてコストがかかり、運用が複雑です。スキーマを更新するには多くの場合、コレクションを再構築する必要があります：データのエクスポート、新しいフィールドのマージ、すべてを再インポートする必要があります。この手動プロセスは時間がかかり、エラーが発生しやすく、頻繁に長時間の書き込みダウンタイムが必要です。

この課題に対処するため、Zillizは自動スキーマ進化のための新しい**バッチETL機能**を導入します。このリリースの一環として、ETLサービスの下に新しい**Merge Data RESTful API**が追加され、ユーザーは1回のAPI呼び出しで大規模なスキーマ更新を実行できるようになります。APIにより、既存コレクション（ベース）と外部ファイル（主キーと新しいフィールドを含む）をマージして、更新されたスキーマを持つ新しいコレクション（ターゲット）を生成できます。検証後、ユーザーは最小限の中断で切り替えるために単にエイリアスを更新するだけで済みます。

内部的には、Merge Data APIは分散バッチ処理エンジンとStage、Backup、Join、Importを単一操作に編成します。ユーザーは各ステップを手動で調整する必要がありません。データ検証からインポートまでのプロセス全体は自動的に処理されます。これにより運用負担が劇的に削減され、スキーマ更新が**数日ではなく数時間で完了**できるようになります。

<Admonition type="info" icon="📘" title="注釈">

<p>マージプロセス中、データ整合性を確保するためにベースコレクションへの書き込みを一時停止する必要があります。</p>

</Admonition>

この機能は現在**プライベートプレビュー**です。アカウントで有効にするには[サポートに連絡](https://support.zilliz.com/hc/en-us)してください。関連するRESTful APIリファレンスページについては、[Merge Data](/reference/restful/merge-data-v2)を参照してください。

## Zilliz CloudのデータレイヤーであるStageの導入 | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

Zilliz Cloudの**データレイヤー**であるブランド新機能である**Stage**の導入を嬉しく思います。

Stageは、非構造化データのための管理されたクラウドネイティブステージング領域を提供します。これは、ベクタクラスターへの移行およびインポートのためのデータのアップロード、キャッシング、および準備を含む、スケーラブルなデータ移動をサポートするように専用に構築されており、Zillizサービス全体でETLワークフローの統一レイヤーとして機能します。

この初期リリース（**プライベートプレビュー**）では、ユーザーは以下を実行できます：

- [Create](/reference/restful/create-volume-v2)、[list](/reference/restful/list-volumes-v2)、および[delete](/reference/restful/delete-volume-v2)ステージを含むRESTful APIを介して**ステージを管理**

- **Migration**および**Import**サービスの両方のための**共有ステージングレイヤーとしてStageを使用**してデータオンボーディングを合理化：

    - **移行**：ローカルMilvus環境からZilliz Cloudへのデータを単一ステップでシームレスに移行できます。以前は、ユーザーは手動でバックアップを作成し、S3にファイルをアップロードし、インポートジョブを個別にトリガーする必要がありました。Stageにより、プロセスが統一され、高速になり、はるかにエラーが発生しにくくなります。詳細については、[Stage経由でMilvusからZilliz Cloudへの移行](./via-stage)を参照してください。

    - **インポート**：インポートジョブは現在、ステージをステージングバックエンドとして受け入れるようになり、オブジェクトストレージへの依存を減らし、トークンの有効期限切れを回避し、クラウドストレージへの直接アクセスがないユーザーがデータをZilliz Cloudに簡単に移動できるようにします。詳細については、[Create Import Jobs](/reference/restful/create-import-jobs-v2)を参照し、**Request Body**で**Use Stage**を選択してください。

StageはまもなくBackup、Import、およびETLサービスなどの追加サービスと統合され、Zilliz Cloud内での非構造化データ処理、データ共有、およびパイプライン駆動ワークロードへのサポートを拡張します。

この機能は現在**プライベートプレビュー**です。アカウントで有効にするには[サポートに連絡](https://support.zilliz.com/hc/en-us)してください。

## スケジュールクラスタースケーリングが利用可能に\{#scheduled-cluster-scaling-now-available}

Zilliz Cloudは、**クラスターレベル**での**スケジュールスケーリング**をサポートするようになり、予測可能なワークロードパターンに基づいてリソース割り当てを積極的に制御できるようになりました。

![EKkTb21RooyES7x1alDcKL66nyh](/img/EKkTb21RooyES7x1alDcKL66nyh.png)

- **CUおよびレプリカのスケジュールベース自動スケーリング**：CUおよびレプリカを自動的にスケーリングする特定のスケジュールを定義できるようになりました。ビジネス時間帯のピークトラフィックに対応するためにリソースを簡単にスケーリングアップし、夜間や週末などの静かな時間帯には手動介入なしでコストを最適化するためにスケーリングダウンできます。

- **強化された可視性と制御**：このアップデートにより、スケーリングスケジュールの視覚的表現を導入することで、自動スケーリング構成の透明性が高まります。

- **積極的な監査**：リソース提供とコストに関する安心感を提供するための透明な電子メール通知システムおよび監査トレールを提供します。

詳細については、[クラスター自動スケーリング](./scale-cluster)を参照してください。

## データベース間選択によるクラスターレベルバックアップからの部分リストア\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

**クラスターレベルバックアップ**から特定の**データベース**および**コレクション**を、複数のデータベースにわたるコレクションを含めて、選択的にリストアできるようになりました。この強化により、回復時間が短縮され、クラスター全体を回復する必要なく、リストアするデータを細かく制御できるようになります。

![Sd5PbeR5poupNlx6nM6cCrdxnTd](/img/Sd5PbeR5poupNlx6nM6cCrdxnTd.png)

詳細については、[部分クラスターのリストア](./restore-from-snapshot#restore-a-partial-cluster)を参照してください。

## Zilliz CloudコンソールでのJSONパスインデックスの作成\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloudは、Webコンソールから直接JSONパスインデックスを作成できるようになり、半構造化データのクエリをより簡単に高速化できるようになりました。この機能は、柔軟で高性能なフィルタリングのためのJSONフィールドと動的フィールドの両方をサポートします。

![PDbobfoUDolZd4xKR8kcDXqIn0f](/img/PDbobfoUDolZd4xKR8kcDXqIn0f.png)

JSONパスインデックスの詳細については、[JSONフィールド内の値のインデックス化](./use-json-fields)および[動的フィールド内のインデックスキー](./enable-dynamic-field#index-keys-in-the-dynamic-field)を参照してください。

## BYOCプロジェクトインスタンスクォータ設定が利用可能に\{#byoc-project-instance-quota-settings-now-available}

**Zilliz Cloudは、BYOCプロジェクトのカスタムインスタンスクォータ設定をサポートするようになりました**。このアップデートにより、サービスの明確なリソース境界を定義することでコストを最適化できる柔軟性が高まります。

![OHwLbK4X5odr2gxJ6LicTawHn3f](/img/OHwLbK4X5odr2gxJ6LicTawHn3f.png)

- **プロジェクトリソース自動スケーリング制御**：エラスティックモードと固定リソースモードを簡単に切り替えられるようになりました。最小および最大インスタンス数を設定してエラスティック性を有効にするか、サービスグループリソースを固定サイズにロックできます。

- **動的構成**：コンソール内のプロジェクトステータスページから直接ノードグループリソースおよびクォータを表示および調整できるようになり、実行中のプロジェクトのリソース割り当てを簡単に変更できるようになりました。

- **独立したインデックスサービスクォータ**：Zilliz Cloudは、インデックスノードグループのリソースクォータを独立して設定できるようにし、異なるワークロードパターンに対してパフォーマンスとリソース割り当てを微調整できるようになりました。

詳細については、[AWSへのBYOC展開](/docs/byoc/deploy-byoc-aws)、[AWSへのBYOC-I展開](/docs/byoc/deploy-byoc-i-aws)、および[GCPへのBYOC展開](/docs/byoc/deploy-byoc-gcp)を参照してください。

## その他の機能強化\{#other-enhancements}

- クラスターレベルのバックアップリストアを実行する際にRBAC構成をリストアするかどうかを選択できるようになりました。

    ![KNJ8bzQaroYqzWxsgUhcjduAn7c](/img/KNJ8bzQaroYqzWxsgUhcjduAn7c.png)

    <Admonition type="info" icon="📘" title="注釈">

    <p>この設定は、新しく作成されたバックアップにのみ適用されます。</p>

    </Admonition>

- **プライベートプレビュー**および**パブリックプレビュー**の機能について、使用前に学ぶことができます。これらの機能を使用するには、[Zilliz Cloudサポート](https://support.zilliz.com/hc/en-us)に連絡してください。

    ![JFjPbrK00oEVsvx4kntc101Snfb](/img/JFjPbrK00oEVsvx4kntc101Snfb.png)

- インポート要求ごとの総ファイルサイズが100GBから1TBに増加しました。

- 組織が凍結状態になった場合、手動で作成されたバックアップの保持期間は永続的ではなく30日間に変更され、ストレージコストを節約できます。