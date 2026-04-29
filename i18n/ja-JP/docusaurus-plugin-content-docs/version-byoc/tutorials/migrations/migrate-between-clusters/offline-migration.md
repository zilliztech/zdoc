---
title: "オフライン移行 | BYOC"
slug: /offline-migration
sidebar_key: offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
notebook: FALSE
description: "オフライン移行は、既存のデータをソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへすべて転送します。この方法は、同一組織内および異なる組織間での移行をサポートしています。計画されたメンテナンスや小規模なデータベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。 | BYOC"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - 移行
  - クラスター
  - オフライン

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# オフライン移行

オフライン移行は、既存のすべてのデータをソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへ転送します。この方法は、同一組織内および異なる組織間での移行をサポートしています。計画されたメンテナンスや小規模なデータベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。

## 移行機能\{#migration-capabilities}

### 移行スコープのオプション\{#migration-scope-options}

<table>
   <tr>
     <th><p>移行タイプ</p></th>
     <th><p>説明</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p>同一プロジェクト内</p></td>
     <td><p>同一 Zilliz Cloud プロジェクト内の既存クラスター間で移行</p></td>
     <td><p>クラスターのアップグレード、パフォーマンス最適化、データの統合</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト間または組織間</p></td>
     <td><p>異なる Zilliz Cloud プロジェクトまたは組織内の既存クラスター間で移行</p></td>
     <td><p>企業の合併、部門の移管、マルチテナントシナリオ</p></td>
   </tr>
</table>

### 直接データ転送\{#direct-data-transfer}

オフライン移行は、Zilliz Cloud クラスター間で直接的なデータレプリケーションを実行し、以下の特徴があります：

- **スキーマの保持**: ソーススキーマが変更されずにターゲットクラスターへ転送されます

- **フィールドの変更なし**: 移行中にフィールドの名前変更、データ型の変更、またはフィールド属性の変更はできません

- **自動インデックス作成**: AUTOINDEX がターゲットクラスターの ベクトルフィールド に対して自動的に作成されます

## 前提条件\{#prerequisites}

オフライン移行を開始する前に、以下の要件を満たしていることを確認してください：

### 一般 要件\{#general-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザー権限</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者のロール</p></td>
   </tr>
   <tr>
     <td><p>ソースクラスターへのアクセス</p></td>
     <td><p>ソースクラスターはパブリックインターネットからアクセス可能である必要があります</p></td>
   </tr>
   <tr>
     <td><p>ターゲットクラスターの容量</p></td>
     <td><p>ソースデータを格納するのに十分な CU サイズ（<a href="https://zilliz.com/pricing#calculator">CU 計算ツール</a>を使用）</p></td>
   </tr>
</table>

### プロジェクト間または組織間の移行要件\{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>接続 認証情報</p></td>
     <td><p>ソースクラスターのパブリックエンドポイント、API キー、またはクラスターのユーザー名とパスワード</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク アクセス</p></td>
     <td><p>ターゲット組織からソースクラスターに接続できること</p></td>
   </tr>
</table>

## 始め方\{#getting-started}

以下のデモでは、オフライン移行の完全なプロセスを段階的に説明します：

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - Offline Migration Demo" />

<Admonition type="info" icon="📘" title="Notes">

<p>移行されたコレクションは、検索またはクエリ操作のためにすぐに利用可能になるわけではありません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">ロードとリリース</a> を参照してください。</p>

</Admonition>

