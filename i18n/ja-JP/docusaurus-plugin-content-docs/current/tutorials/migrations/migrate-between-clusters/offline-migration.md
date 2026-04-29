---
title: "オフライン移行 | Cloud"
slug: /offline-migration
sidebar_key: offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
notebook: FALSE
description: "オフライン移行は、既存のデータをソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへすべて転送します。この方法は、同一組織内および異なる組織間での移行をサポートしています。計画されたメンテナンスや小規模なデータベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。 | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 移行
  - クラスター
  - オフライン

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# オフライン移行

オフライン移行は、既存のすべてのデータをソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへ転送します。この方法は、同一組織内および異なる組織間での移行をサポートしています。計画されたメンテナンスや小規模なデータベース移行など、一時的な書き込み中断が許容されるシナリオに最適です。

## 移行機能\{#migration-capabilities}

### クラスターの互換性\{#cluster-compatibility}

以下の表は、異なるデプロイメントオプションのクラスター間における移行機能と制約を示しています：

<table>
   <tr>
     <th rowspan="2"><p><strong>Source</strong></p></th>
     <th colspan="3"><p><strong>Target</strong></p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Serverless cluster</p></td>
     <td><p>Dedicated cluster</p></td>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported</p><p>(You can only upgrade a Free cluster to a Serverless cluster. Refer to <a href="./manage-cluster#upgrade-deployment-option">Manage Cluster</a> for more details.)</p></td>
     <td><p>Supported</p><p>(You can also upgrade a Free cluster to a 専用クラスター. Refer to <a href="./manage-cluster#upgrade-deployment-option">Manage Cluster</a> for more details.)</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
     <td><p>Supported</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
   </tr>
</table>

### 移行スコープのオプション\{#migration-scope-options}

<table>
   <tr>
     <th><p>Migration Type</p></th>
     <th><p>Description</p></th>
     <th><p>Use Cases</p></th>
   </tr>
   <tr>
     <td><p>Within same project</p></td>
     <td><p>Migrate between existing clusters in the same Zilliz Cloud project</p></td>
     <td><p>Cluster upgrades, performance optimization, data consolidation</p></td>
   </tr>
   <tr>
     <td><p>Cross-project or organization</p></td>
     <td><p>Migrate between existing clusters in different Zilliz Cloud projects or organizations</p></td>
     <td><p>Company mergers, department transfers, multi-tenant scenarios</p></td>
   </tr>
</table>

### データの直接転送\{#direct-data-transfer}

オフライン移行は、Zilliz Cloud クラスター間で直接的なデータレプリケーションを実行し、以下の特徴があります：

- **スキーマの保持**: ソーススキーマは変更されずにターゲットクラスターへ転送されます

- **フィールドの変更なし**: 移行中にフィールドの名前変更、データ型の変更、またはフィールド属性の変更はできません

- **自動インデックス作成**: AUTOINDEX がターゲットクラスターの ベクトルフィールド に対して自動的に作成されます

## 前提条件\{#prerequisites}

オフライン移行を開始する前に、以下の要件を満たしていることを確認してください：

### 一般要件\{#general-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User permissions</p></td>
     <td><p>組織オーナー or プロジェクト管理者 role</p></td>
   </tr>
   <tr>
     <td><p>Source cluster access</p></td>
     <td><p>Source cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Target cluster capacity</p></td>
     <td><p>Sufficient CU size to accommodate source data (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a>)</p></td>
   </tr>
</table>

### プロジェクト間または組織間の移行要件\{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>接続 credentials</p></td>
     <td><p>Public endpoint, API key, or cluster username and password for source cluster</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク access</p></td>
     <td><p>Ability to connect to source cluster from target organization</p></td>
   </tr>
</table>

## 始め方\{#getting-started}

以下のデモでは、オフライン移行の完全なプロセスを段階的に説明します：

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - Offline Migration Demo" />

<Admonition type="info" icon="📘" title="Notes">

<p>移行されたコレクションは、検索またはクエリ操作のために直ちに利用可能にはなりません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">Load & Release</a> を参照してください。</p>

</Admonition>

