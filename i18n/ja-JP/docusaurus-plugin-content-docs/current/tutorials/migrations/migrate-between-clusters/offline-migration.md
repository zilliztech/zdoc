---
title: "オフライン移行 | Cloud"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オフライン移行は、既存のすべてのデータをソースZilliz CloudクラスターからターゲットZilliz Cloudクラスターに転送します。この方法は、同じ組織内および異なる組織にまたがる移行をサポートします。これは、計画メンテナンス中や小規模データベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。 | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - クラスター
  - オフライン
  - オープンソースベクターデータベース
  - オープンソースベクターデータベース
  - ベクターデータベースの例
  - ragベクターデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# オフライン移行

オフライン移行は、既存のすべてのデータをソースZilliz CloudクラスターからターゲットZilliz Cloudクラスターに転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。これは、計画メンテナンスや小規模データベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。

書き込み操作を中断せずに移行が必要な場合は、[ゼロダウンタイム移行](./zero-downtime-migration)を参照してください。

## 移行機能\{#migration-capabilities}

### クラスタ互換性\{#cluster-compatibility}

以下の表は、異なるデプロイメントオプションのクラスター間の移行機能と制約を概説しています：

<table>
   <tr>
     <th rowspan="2"><p><strong>ソース</strong></p></th>
     <th colspan="3"><p><strong>ターゲット</strong></p></th>
   </tr>
   <tr>
     <td><p>無料クラスター</p></td>
     <td><p>サーバーレスクラスター</p></td>
     <td><p>専用クラスター</p></td>
   </tr>
   <tr>
     <td><p>無料クラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされていません</p><p>（無料クラスターをサーバーレスクラスターにアップグレードする場合にのみ可能です。<a href="./manage-cluster#upgrade-deployment-option">クラスター管理</a>の詳細を参照してください。）</p></td>
     <td><p>サポートされています</p><p>（無料クラスターを専用クラスターにアップグレードすることも可能です。<a href="./manage-cluster#upgrade-deployment-option">クラスター管理</a>の詳細を参照してください。）</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスクラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされています</p></td>
     <td><p>サポートされています</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされています</p></td>
   </tr>
</table>

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

オフライン移行は、以下の特性を持つZilliz Cloudクラスター間で直接データレプリケーションを実行します：

- **スキーマ保持**：ソーススキーマが変更なしにターゲットクラスターに転送されます

- **フィールド変更不可**：移行中にフィールド名の変更、データ型の変更、またはフィールド属性の変更はできません

- **自動インデックス作成**：ターゲットクラスターのベクターフールにAUTOINDEXが自動的に作成されます

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

以下のデモでは、完全なオフライン移行プロセスを説明します：

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - オフライン移行デモ" />

<Admonition type="info" icon="📘" title="注意">

<p>移行されたコレクションは、検索またはクエリ操作ですぐには利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">ロードとリリース</a>を参照してください。</p>

</Admonition>

