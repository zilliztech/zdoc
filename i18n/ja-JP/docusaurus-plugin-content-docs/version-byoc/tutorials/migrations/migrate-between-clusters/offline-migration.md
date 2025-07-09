---
title: "オフライン移行 | BYOC"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
notebook: FALSE
description: "オフライン移行は、ソースのZilliz CloudクラスターからターゲットのZilliz Cloudクラスターに既存のすべてのデータを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。 | BYOC"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - offline
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# オフライン移行

オフライン移行は、ソースのZilliz CloudクラスターからターゲットのZilliz Cloudクラスターに既存のすべてのデータを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。

連続した書き込み操作が必要な移行については、[ゼロダウンタイム移行](./zero-downtime-migration)を参照してください。

## マイグレーション機能{#migration-capabilities}

### クラスタ互換性{#cluster-compatibility}

次の表に、異なるプランのクラスター間の移行機能と制約を示します。 

<table>
   <tr>
     <th rowspan="2"><p><strong>ソース</strong></p></th>
     <th colspan="3"><p><strong>ターゲット</strong></p></th>
   </tr>
   <tr>
     <td><p>フリークラスタ</p></td>
     <td><p>サーバーレスクラスタ</p></td>
     <td><p>専用クラスタ</p></td>
   </tr>
   <tr>
     <td><p>フリークラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポートされていない</p><p>（FreeクラスタをServerlessクラスタにアップグレードすることができます。詳細については、<a href="./manage-cluster">クラスタ管理</a>を参照してください。）</p></td>
     <td><p>サポート</p><p>(Freeクラスタを専用クラスタにアップグレードすることもできます。詳細については、<a href="./manage-cluster">クラスタ管理</a>を参照してください。)</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスクラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポート</p></td>
     <td><p>サポート</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポート</p></td>
   </tr>
</table>

</exclude>

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

オフラインマイグレーションは、Zilliz Cloudクラスタ間で直接データレプリケーションを実行します。

- スキーマの保存:ソーススキーマは変更されずにターゲットクラスタに転送されました

- **フィールドの変更なし**:移行中にフィールドの名前を変更したり、データ型を変更したり、フィールド属性を変更したりすることはできません

- **自動インデックス**:ターゲットクラスタ内のベクトルフィールドに対して自動的に作成されるAUTOINDEX

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

次のデモでは、完全なオフライン移行過程を説明します。

<supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - Offline Migration Demo"></supademo>

<Admonition type="info" icon="📘" title="ノート">

<p>移行されたコレクションは、すぐに検索やクエリの操作に利用できるわけではありません。検索やクエリの機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、<a href="./load-release-collections">ロード&リリース</a>を参照してください。</p>

</Admonition>

