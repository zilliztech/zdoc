---
title: "オフライン移行 | Cloud"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オフライン移行は、ソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへ既存のすべてのデータを転送します。この方法は、同一組織内および異なる組織間の移行の両方をサポートします。計画メンテナンス中や小規模なデータベース移行など、一時的な書き込み中断を許容できるシナリオに最適です。 | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# オフライン移行

オフライン移行は、ソース Zilliz Cloud クラスターからターゲット Zilliz Cloud クラスターへ既存のすべてのデータを転送します。この方法は、同一組織内および異なる組織間の移行の両方をサポートします。計画メンテナンス中や小規模なデータベース移行など、一時的な書き込み中断を許容できるシナリオに最適です。

<Admonition type="info" icon="📘" title="注意">

カットオーバー中にアプリケーションがソースクラスターへの書き込みを継続すると、ターゲットクラスターで新しいエンティティが欠落する可能性があります。特に、移行ジョブ完了後に挿入されたエンティティは欠落するおそれがあります。ターゲットのデータ完全性を保つには、カットオーバー時間帯を設定し、ソースクラスターへの書き込みを一時停止し、移行ジョブの完了を待ち、ターゲットクラスターを検証してから、ターゲットクラスターのみに書き込みを再開してください。

</Admonition>

## 移行機能\{#migration-capabilities}

### クラスターの互換性\{#cluster-compatibility}

次の表は、異なるデプロイオプションのクラスター間における移行機能と制約を示しています。 

<table>
   <tr>
     <th rowspan="2"><p><strong>ソース</strong></p></th>
     <th colspan="3"><p><strong>ターゲット</strong></p></th>
   </tr>
   <tr>
     <td><p>Free クラスター</p></td>
     <td><p>Serverless クラスター</p></td>
     <td><p>Dedicated クラスター</p></td>
   </tr>
   <tr>
     <td><p>Free クラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされていません</p><p>(Free クラスターは Serverless クラスターにのみアップグレードできます。詳細は <a href="./manage-cluster">Manage Cluster</a> を参照してください。)</p></td>
     <td><p>サポートされています</p><p>(Free クラスターを Dedicated クラスターにアップグレードすることもできます。詳細は <a href="./manage-cluster">Manage Cluster</a> を参照してください。)</p></td>
   </tr>
   <tr>
     <td><p>Serverless クラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされています</p></td>
     <td><p>サポートされています</p></td>
   </tr>
   <tr>
     <td><p>Dedicated クラスター</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>サポートされています</p></td>
   </tr>
</table>

### 移行範囲のオプション\{#migration-scope-options}

| 移行タイプ | 説明 | ユースケース |
| --- | --- | --- |
| 同一プロジェクト内 | 同じ Zilliz Cloud プロジェクト内の既存クラスター間で移行 | クラスターのアップグレード、パフォーマンス最適化、データ統合 |
| プロジェクトまたは組織をまたぐ | 異なる Zilliz Cloud プロジェクトまたは組織内の既存クラスター間で移行 | 企業合併、部門移管、マルチテナントのシナリオ |

### 直接データ転送\{#direct-data-transfer}

オフライン移行は、次の特徴を持つ Zilliz Cloud クラスター間の直接データレプリケーションを実行します。

- **スキーマの保持**: ソースのスキーマは変更されずにターゲットクラスターに転送されます

- **フィールド変更なし**: 移行中にフィールド名の変更、データ型の変更、フィールド属性の変更はできません

- **自動インデックス作成**: ターゲットクラスターのベクトルフィールドに対して AUTOINDEX が自動的に作成されます

- **一回限りのデータコピー**: オフライン移行は、移行ジョブ中にソースクラスターからデータをコピーします。移行ジョブ完了後の新しい書き込みについて、ターゲットクラスターとの同期は維持されません。

## 前提条件\{#prerequisites}

オフライン移行を開始する前に、次の要件を満たしていることを確認してください。

### 一般要件\{#general-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザー権限 | Organization Owner または Project Admin ロール |
| ソースクラスターへのアクセス | ソースクラスターはパブリックインターネットからアクセス可能である必要があります |
| ターゲットクラスターの容量 | ソースデータを収容するのに十分な CU サイズ（[CU calculator](https://zilliz.com/pricing#calculator) を使用） |

### プロジェクトまたは組織をまたぐ移行の要件\{#cross-project-or-organization-migration-requirements}

| 要件 | 詳細 |
| --- | --- |
| 接続認証情報 | ソースクラスターのパブリックエンドポイント、API キー、またはクラスターのユーザー名とパスワード |
| ネットワークアクセス | ターゲット組織からソースクラスターに接続できること |

### カットオーバーの計画\{#plan-the-cutover}

オフライン移行を開始する前に、アプリケーションがソースクラスターへの書き込みを一時的に停止できるカットオーバー時間帯を選択してください。データ欠落を避けるため、次の手順に従ってください。

1. 最終移行および検証ウィンドウの前に、ソースクラスターへの書き込みを一時停止します。

1. 移行ジョブを実行し、ジョブステータスが **Successful** に変わるまで待ちます。

1. エンティティ数の確認や最近挿入されたエンティティのサンプリングなどにより、ターゲットクラスターのデータを検証します。

1. アプリケーションの読み取り先と書き込み先をターゲットクラスターに切り替えます。

1. 書き込みはターゲットクラスターでのみ再開します。

移行されたデータが完全であることを確認するまで、ソースクラスターを利用可能な状態にしておいてください。

## はじめに\{#getting-started}

次のデモでは、オフライン移行の完全なプロセスを説明します。

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title=""  />

<Admonition type="info" icon="📘" title="注意">

移行されたコレクションは、検索またはクエリ操作ですぐには利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細は [Load & Release](./load-release-collections) を参照してください。

</Admonition>

