---
title: "ゼロダウンタイム移行 | Cloud"
slug: /zero-downtime-migration
sidebar_label: "ゼロダウンタイム移行"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ゼロダウンタイム移行により、データベースサービスは移行中も運用状態を維持し、データベースへの中断のないアクセスを提供します。これは以下の段階で構成されます | Cloud"
type: origin
token: XDoSwZodyigAEVkjkWfc9nsfnCg
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - zero downtime
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ゼロダウンタイム移行

ゼロダウンタイム移行により、データベースサービスは移行中も運用状態を維持し、データベースへの中断のないアクセスを提供します。これは以下の段階で構成されます：

1. **初期化**: ソースクラスターを選択し、新しいターゲットクラスターを作成します。

1. **移行**: 既存データを移行し、インクリメンタルデータを同期します。

1. **完成**: ラグが10秒未満になった時点で同期を停止し、ターゲットクラスターに切り替えます。

![PTB0wxmm2hCBc3b2dj1cCCJgnRb](/img/PTB0wxmm2hCBc3b2dj1cCCJgnRb.png)

<Admonition type="info" icon="📘" title="注意">

<p>ゼロダウンタイム移行は<strong>プライベートプレビュー</strong>中です。問題が発生した場合、または関連コストについて知りたい場合は、<a href="https://support.zilliz.com/hc/en-us/requests/new">Zilliz Cloudサポート</a>までお問い合わせください。</p>

</Admonition>

## 移行機能\{#migration-capabilities}

### クラスタ互換性\{#cluster-compatibility}

以下の表は、クラスター間の移行機能と制約を概説しています：

<table>
   <tr>
     <th><p>ソースクラスター</p></th>
     <th><p>ターゲットクラスター</p></th>
     <th><p>移行範囲</p></th>
   </tr>
   <tr>
     <td><p>専用</p></td>
     <td><p>新規専用クラスター</p></td>
     <td><p>ソースクラスターのすべてのデータベースを移行します。特定のデータベースのみを部分的に移行することはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス / 無料</p></td>
     <td><p>新規専用クラスター</p></td>
     <td><p>ソースクラスターから1つのデータベースを移行します。サーバーレス/無料クラスターには最大でも1つのデータベースしか含まれないためです。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<p>低いティアのクラスタープランに移行することはできません。つまり、ターゲットクラスターのプランはソースクラスターのプランと同等またはそれ以上である必要があります。</p>

</Admonition>

### 移行範囲オプション\{#migration-scope-options}

<table>
   <tr>
     <th><p>移行タイプ</p></th>
     <th><p>説明</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p>同一プロジェクト内</p></td>
     <td><p>同じZilliz Cloudプロジェクト内の既存クラスター間で移行</p></td>
     <td><p>クラスターのアップグレード、パフォーマンスの最適化、データの統合</p></td>
   </tr>
   <tr>
     <td><p>プロジェクトまたは組織間</p></td>
     <td><p>異なるZilliz Cloudプロジェクトまたは組織内の既存クラスター間で移行</p></td>
     <td><p>会社の合併、部署の移管、マルチテナントシナリオ</p></td>
   </tr>
</table>

### 直接データ転送\{#direct-data-transfer}

ゼロダウンタイム移行は、以下の特性を持つZilliz Cloudクラスター間で直接データレプリケーションを実行します：

- **スキーマ保持**: ソーススキーマが変更なしにターゲットクラスターに転送されます

- **フィールド変更不可**: 移行中にフィールド名の変更、データ型の変更、またはフィールド属性の変更はできません

- **自動インデックス作成**: ターゲットクラスターのベクターフールにAUTOINDEXが自動的に作成されます

### 制限\{#limits}

- 移行中、ソースクラスターで以下のいずれの操作も実行できません：**AlterCollection**、**AlterCollectionField**、**CreateAlias**、**DropAlias**、**AlterAlias**、**RenameCollection**、**AlterDatabase**、**Import**。

- 進行中のゼロダウンタイム移行ジョブをキャンセルすることはサポートされていません。この機能は今後のリリースで利用可能になる予定です。

- ゼロダウンタイム移行では、データ同期を停止しクラスター移行を完了させるために約10秒のダウンタイムが必要です。

## 前提条件\{#prerequisites}

オフライン移行を開始する前に、以下の要件を満たしていることを確認してください：

### 一般要件\{#general-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザー権限</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者ロール</p></td>
   </tr>
   <tr>
     <td><p>ソースクラスターアクセス</p></td>
     <td><p>ソースクラスターにパプリックインターネットからアクセス可能である必要があります</p></td>
   </tr>
   <tr>
     <td><p>ターゲットクラスターキャパシティ</p></td>
     <td><p>ソースデータを収容するのに十分なCUサイズ（<a href="https://zilliz.com/pricing#calculator">CU計算機</a>を使用）</p></td>
   </tr>
</table>

### プロジェクトまたは組織間移行要件\{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>接続資格情報</p></td>
     <td><p>ソースクラスターのパプリックエンドポイント、APIキー、またはクラスターのユーザー名とパスワード</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ターゲット組織からソースクラスターへの接続機能</p></td>
   </tr>
</table>

## はじめに\{#getting-started}

ゼロダウンタイム移行プロセスは、注意が必要な3つの主要フェーズで構成されています：

### フェーズ1：初期化\{#phase-1-initialize}

以下のデモでは、ゼロダウンタイム移行の設定と開始方法を示します：

<Supademo id="cmb94ul040o06sn1ri0s8ydn5" title="Zilliz Cloud - ゼロダウンタイム移行デモ" />

**移行**をクリックすると、ソースクラスターは**ロック**状態になり、移行中に削除できなくなります。

### フェーズ2：モニター\{#phase-2-monitor}

移行を開始すると、ターゲットクラスターの詳細ページに移動し、移行の進行状況を積極的に監視する必要があります。

<Supademo id="cmba5mvlu1g20sn1rruotossj" title="Zilliz Cloud - ゼロダウンタイム移行を監視するデモ" />

**ステージ1: ターゲットクラスターを準備し、既存データを移行**

このステージでは、既存データをソースクラスターからターゲットクラスターに移行します。期間は転送されるデータ量に依存し、大規模なデータセットでは数時間かかることがあります。

<Admonition type="info" icon="📘" title="注意">

<p>プロセスにしばらく時間がかかる場合、このページを離れ他のタスクを行うことができます。いつでも戻ってきてインクリメンタルデータ同期の進行状況を監視できます。</p>

</Admonition>

**ステージ2: インクリメンタルデータ同期**

このステージでは、システムはソースクラスターに挿入される新しいデータをターゲットクラスターに継続的に同期します。ターゲットクラスターはデータ書き込みを受け入れないことを示す**同期中**状態を表示します。このステージでは、以下の手順に従ってください：

1. **同期ラグを監視**

    - **ソースとの同期遅延**（秒単位）を追跡して同期の進行状況を監視します。これは、ソースクラスターとターゲットクラスターの最新データ間の時間差を示します。

    - **ソースとの同期遅延**が10秒を下回ると、データ同期停止を続行できる旨の電子メール通知が届きます。

    - **重要**: 合理的な待機期間後も同期ラグが10秒未満にならない場合は、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)にお問い合わせください。

1. **データ同期を停止**

    - 先に進む前に、ソースクラスターへのすべての書き込みを停止し、同期停止とクラスタースイッチオーバーのための約10秒のメンテナンスウィンドウを計画してください。

    - **ソースとの同期遅延**が許容できるしきい値に達した場合、チェックボックスを選択：**ソースクラスターへの書き込みを停止したことを確認します**、次に**データ同期を停止**をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    <p>手動でデータ同期を停止しない場合、Zilliz Cloudは最大7日間同期を続けます。この期間後、リソースの浪費を防ぐためシステムは自動的に同期を停止し、移行ジョブが失敗します。</p>

    </Admonition>

### フェーズ3: スイッチ\{#phase-3-switch}

同期遅延が10秒以下になったことを示す電子メール通知を受け取ったら、最終的なスイッチオーバーの準備ができています。クラスターへの接続方法については、[クラスターに接続](./connect-to-cluster)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>移行後、ソースクラスターは<strong>自動的に削除されません</strong>。データの整合性を確認するため、手動で削除する前にしばらくの間保持することをお勧めします。</p></li>
<li><p>移行されたコレクションは、検索またはクエリ操作ですぐには利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">ロードとリリース</a>を参照してください。</p></li>
</ul>

</Admonition>
