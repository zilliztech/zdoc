---
title: "ゼロダウンタイム移行 | BYOC"
slug: /zero-downtime-migration
sidebar_label: "ゼロダウンタイム移行"
beta: PRIVATE
notebook: FALSE
description: "ゼロダウンタイム移行により、データベースサービスは移行中も稼働し続け、データベースへの中断のないアクセスを提供します。これは以下の段階で構成されています | BYOC"
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
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';


# ゼロダウンタイム移行

ゼロダウンタイム移行により、データベースサービスは移行中も稼働し続け、データベースへの中断のないアクセスを提供します。これは以下の段階で構成されています:

1. **初期化**:ソースクラスタを選択し、新しいターゲットクラスタを作成します。

1. **移行**:既存のデータを移行し、増分データを同期します。

1. **ファイナライズ**:遅延が10秒未満の場合は同期を停止し、ターゲットクラスタに切り替えます。

![PTB0wxmm2hCBc3b2dj1cCCJgnRb](/img/PTB0wxmm2hCBc3b2dj1cCCJgnRb.png)

<Admonition type="info" icon="📘" title="ノート">

<p>Zero Downtime Migrationは<strong>プライベートプレビュー</strong>中です。問題が発生した場合や関連するコストについて知りたい場合は、<a href="https://support.zilliz.com/hc/en-us/requests/new">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## マイグレーション機能{#migration-capabilities}

### クラスタ互換性{#cluster-compatibility}

次の表に、異なるプランのクラスター間の移行機能と制約を示します。

<table>
   <tr>
     <th><p>ソースクラスタ計画</p></th>
     <th><p>ターゲットクラスタ計画</p></th>
     <th><p>移行の範囲</p></th>
   </tr>
   <tr>
     <td><p>専用の</p></td>
     <td><p>新しい専用クラスタ</p></td>
     <td><p>ソースクラスタからすべてのデータベースを移行します。特定のデータベースの部分的な移行はサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス/無料</p></td>
     <td><p>新しい専用クラスタ</p></td>
     <td><p>Serverless/Freeクラスタには最大1つのデータベースしか含まれないため、ソースクラスタから1つのデータベースを移行します。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>下位クラスタプランに移行することはできません。つまり、ターゲットクラスタのプランは、ソースクラスタのプランと同じか、それ以上である必要があります。</p>

</Admonition>

### 移行範囲のオプション{#migration-scope-options}

<table>
   <tr>
     <th><p>移行タイプ</p></th>
     <th><p>説明する</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p>同じプロジェクト内で</p></td>
     <td><p>同じZilliz Cloudプロジェクト内の既存のクラスタ間を移行する</p></td>
     <td><p>クラスタのアップグレード、パフォーマンスの最適化、データの統合</p></td>
   </tr>
   <tr>
     <td><p>クロスプロジェクトまたは組織</p></td>
     <td><p>異なるZilliz Cloudプロジェクトや組織内の既存のクラスタ間を移行する</p></td>
     <td><p>会社の合併、部門の移転、複数テナントのシナリオ</p></td>
   </tr>
</table>

### 直接データ転送{#direct-data-transfer}

Zero Downtime Migrationは、Zilliz Cloudクラスタ間で直接データレプリケーションを実行します。

- スキーマの保存:ソーススキーマは変更されずにターゲットクラスタに転送されました

- **フィールドの変更なし**:移行中にフィールドの名前を変更したり、データ型を変更したり、フィールド属性を変更したりすることはできません

- **自動インデックス**:ターゲットクラスタ内のベクトルフィールドに対して自動的に作成されるAUTOINDEX

### 限界{#limits}

- 移行中は、ソースクラスターに対して次の操作を実行できません:**AlterCollection**AlterCollectionField**、**CreateAlias**、**DropAlias**、**AlterAlias**、**RenameCollection**、**AlterDatabase**、**Import**。

- 進行中のZero Downtime Migrationジョブのキャンセルはサポートされていません。この機能は今後のリリースで利用可能になります。

- ゼロダウンタイム移行には、データ同期が停止し、クラスタ移行が完了するまでに約10秒のダウンタイムが必要です。

## 前提条件{#prerequisites}

オフライン移行を開始する前に、次の要件を満たしていることを確認してください:

### 一般的な要件{#general-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザー権限</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者の役割</p></td>
   </tr>
   <tr>
     <td><p>ソースクラスタへのアクセス</p></td>
     <td><p>ソースクラスターはパブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量の目標</p></td>
     <td><p>ソースデータを収容するのに十分なCU体格(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用)</p></td>
   </tr>
</table>

### クロスプロジェクトまたは組織の移行要件{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>接続の資格情報</p></td>
     <td><p>ソースクラスタのパブリックエンドポイント、APIキー、またはクラスタのユーザ名とパスワード</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ターゲット組織からソースクラスタに接続する能力</p></td>
   </tr>
</table>

## スタートする{#getting-started}

ゼロダウンタイムの移行過程は、注意と行動が必要な3つの主要なフェーズで構成されています。

### フェーズ1:初期化{#phase-1-initialize}

以下のデモでは、ゼロダウンタイム移行の設定と開始方法を示します。

<supademo id="cmb94ul040o06sn1ri0s8ydn5" title="Zilliz Cloud - Zero Downtime Migration Demo"></supademo>

「移行」をクリックすると、ソースクラスターは「ロックされた」状態になり、移行中に削除することはできません。

### フェーズ2:モニター{#phase-2-monitor}

移行を開始すると、ターゲットクラスタの詳細ページに移動し、移行の進行状況を積極的に監視する必要があります。

<supademo id="cmba5mvlu1g20sn1rruotossj" title="Zilliz Cloud - Monitor Zero Downtime Migration Demo"></supademo>

**ステージ1:ターゲットクラスタを準備し、既存のデータを移行する**

このステージでは、既存のデータをソースクラスタからターゲットクラスタに移行します。期間は転送されるデータの量によって異なり、大きなデータセットの場合は数時間かかる場合があります。 

<Admonition type="info" icon="📘" title="ノート">

<p>この過程に時間がかかる場合は、このページを離れて他のタスクに取り組んでください。いつでも戻って、増分データ同期の進行状況を監視し続けることができます。</p>

</Admonition>

**ステージ2:増分データの同期**

この段階では、システムはソースクラスタに挿入された新しいデータをターゲットクラスタに継続的に同期します。ターゲットクラスタは**同期**状態を表示し、外部データの書き込みを受け付けないことを示します。この段階では、次の手順に従ってください:

1. **同期ラグの監視**

    - **ソースの遅れ**を秒単位で追跡して、同期の進行状況を監視します。このインジケーターは、ソースクラスタとターゲットクラスタの最新データ間の時間差を示します。

    - 「Lag Behind Source」が10秒以下になると、データ同期を停止できることを示すメール通知が届きます。

    - **重要**:合理的な待機期間後に同期遅延が10秒以下に達しない場合は、[Zilliz Cloudサポート](https://zilliz.com/contact-sales)に連絡してください。

1. **データ同期を停止**

    - 先に進む前に、ソースクラスタへのすべての書き込みを停止し、同期の停止とクラスタの切り替えのために約10秒間のメンテナンスウィンドウを計画してください。

    - 「Lag Behind Source」が許容可能なしきい値に達したら、「ソースクラスタへの書き込みを停止したことを確認する」チェックボックスを選択し、「Stop Data Sync」をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>手動でデータ同期を停止しない場合、Zilliz Cloudは最大7日間同期を継続します。この期間を過ぎると、システムはリソースの浪費を防ぐために自動的に同期を停止し、移行ジョブが失敗します。</p>

    </Admonition>

### フェーズ3:切り替え{#phase-3-switch}

同期の遅延が10秒以下になったというメール通知を受け取ったら、最終的な切り替えの準備が整います。クラスタへの接続手順については、[Clusterに接続](./connect-to-cluster)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>移行後、ソースクラスタは自動的に削除されません。手動で削除する前に、データの整合性を確認するために一定期間保持することをお勧めします。</p></li>
<li><p>移行されたコレクションは、すぐに検索やクエリの操作に利用できるわけではありません。検索やクエリの機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">ロード&リリース</a>を参照してください。</p></li>
</ul>

</Admonition>