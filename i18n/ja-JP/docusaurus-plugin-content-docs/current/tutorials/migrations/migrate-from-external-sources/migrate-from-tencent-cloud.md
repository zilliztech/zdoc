---
title: "テンセントクラウドからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
notebook: FALSE
description: "このトピックでは、テンセントクラウドVectorDBから移行する際に、Zilliz Cloudがデータ型マッピング、JSONフィールド変換、コレクション命名規則を処理する方法について説明します。 | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - tencent cloud
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search

---

import Admonition from '@theme/Admonition';


# テンセントクラウドからZilliz Cloudへの移行

このトピックでは、[テンセントクラウドVectorDB](https://www.tencentcloud.com/products/vdb)から移行する際に、Zilliz Cloudがデータ型マッピング、JSONフィールド変換、コレクション命名規則を処理する方法について説明します。

## 前提条件{#prerequisites}

テンセントクラウドVectorDBからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### テンセントクラウドVectorDBの要件{#tencent-cloud-vectordb-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースVectorDBインスタンスは、パブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>必要な権限を持つ有効なインスタンスURLとAPIキー</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザーの役割</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量</p></td>
     <td><p>十分なストレージとコンピューティングリソース(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用してCU体格を推定)</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用する場合は、許可リストに<a href="./zilliz-cloud-ips">Zilliz CloudのIPアドレス</a>を追加してください。</p></td>
   </tr>
</table>

## データ型マッピング{#data-type-mapping}

テンセントクラウドのVectorDBデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行を計画する上で重要です。

<table>
   <tr>
     <th><p>VectorDBのフィールドタイプ</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>VARCHAR(プライマリキー)</p></td>
     <td><p>テンセントクラウドVectorDBの主キーは、Zilliz Cloudの主キーとして自動的にマップされます。</p><p>データを移行する際には、Auto IDを有効にすることができます。ただし、そうすると、ソースコレクションの元のプライマリキー値は破棄されます。</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>密ベクトルフィールドは、変更なしでFLOAT_VECTORとして転送されます。</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>JSON（動的フィールド）</p></td>
     <td><p>デフォルトで動的スキーマとしてマップされ、固定フィールドに変換できます。</p><p>詳細については、<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p></td>
   </tr>
</table>

## JSONフィールドの変換{#json-field-conversion}

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz CloudはJSONスキーマを検出するために100行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。</p>

</Admonition>

テンセントクラウドのVectorDBのJSONフィールドは、最大限の柔軟性を得るために、最初にZilliz Cloudの動的スキーマにマップされます。オプションで、JSONフィールドを固定フィールドに変換して、次の機能を利用できます。

- より強力な検証のための強制データ型

- クエリのパフォーマンスを向上させるためのインデックスの最適化

- 一貫したデータ管理のための構造化スキーマ

次のJSONフィールドタイプは、動的フィールドから固定フィールドに自動的に変換できます。

<table>
   <tr>
     <th><p>VectorDB JSONタイプ</p></th>
     <th><p>Zilliz固定フィールドタイプ</p></th>
     <th><p>ノート</p></th>
   </tr>
   <tr>
     <td><p>string</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,53 5バイトをサポート</p></td>
   </tr>
   <tr>
     <td><p>uint 64</p></td>
     <td><p>INT 32</p></td>
     <td><p>型の調整による数値変換</p></td>
   </tr>
   <tr>
     <td><p>ダブル</p></td>
     <td><p>ダブル</p></td>
     <td><p>直接型の変換</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>アレイ</p></td>
     <td><p>対応する要素タイプをサポート</p></td>
   </tr>
</table>

JSONフィールドを固定フィールドに変換する場合、追加の属性を設定できます。

- **Nullable**:フィールドがnull値を受け入れることができるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[Nullableな属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**:データがない場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

- **パーティションキー**:オプションで、パーティションキーとしてINT64またはVARCHARフィールドを指定できます。各コレクションは1つのパーティションキーのみをサポートしており、選択されたフィールドはnullにできません。詳細については、[パーティションキーを使う](./use-partition-key)を参照してください。

## テンセントクラウドVectorDB固有の処理ルール{#tencent-cloud-vectordb-specific-handling-rules}

### コレクションの命名規則{#collection-naming-rules}

テンセントクラウドのVectorDBコレクション名は、以下の考慮事項を考慮してZilliz Cloudに転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>インパクト</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>デフォルトの命名</p></td>
     <td><p>コレクション名はソースコレクション名と完全に一致します</p></td>
     <td><p>名前はテンセントクラウドVectorDBからそのまま保存されます</p></td>
   </tr>
   <tr>
     <td><p>名前の衝突</p></td>
     <td><p>データベースに同じ名前のコレクションがすでに存在する場合、移行ジョブを送信できません</p></td>
     <td><p>移行構成中に既存のコレクションを削除したり、別のターゲットデータベースを選択したり、名前を変更したりします</p></td>
   </tr>
   <tr>
     <td><p>特殊キャラクター</p></td>
     <td><p>コレクション名はQdrantからそのまま保存されます。</p></td>
     <td><p>コレクション名がZilliz Cloudの命名規則に準拠していることを確認する</p></td>
   </tr>
</table>
