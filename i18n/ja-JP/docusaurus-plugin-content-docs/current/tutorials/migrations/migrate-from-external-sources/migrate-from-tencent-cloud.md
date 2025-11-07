---
title: "Tencent CloudからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz CloudがTencent Cloud VectorDBからの移行時にデータ型マッピング、JSONフィールド変換、およびコレクション名付け規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - tencentクラウド
  - ベクターデータベースチュートリアル
  - ベクターデータベースの動作方法
  - ベクターデータベース比較
  - openaiベクターデータベース

---

import Admonition from '@theme/Admonition';


# Tencent CloudからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudが[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb)からの移行時にデータ型マッピング、JSONフィールド変換、およびコレクション名付け規則をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

Tencent Cloud VectorDBからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### Tencent Cloud VectorDBの要件\{#tencent-cloud-vectordb-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースVectorDBインスタンスがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>必要権限を持つ有効なインスタンスURLおよびAPIキー</p></td>
   </tr>
   <tr>
     <td><p>データ可用性</p></td>
     <td><p>ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザーロール</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスターキャパシティ</p></td>
     <td><p>十分なストレージおよびコンピュートリソース（必要CUサイズの見積もりには<a href="https://zilliz.com/pricing#calculator">CU計算機</a>を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IP</a>を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型マッピング\{#data-type-mapping}

Tencent Cloud VectorDBのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行計画にとって極めて重要です：

<table>
   <tr>
     <th><p>VectorDBフィールド型</p></th>
     <th><p>Zilliz Cloudフィールド型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>VARCHAR（プライマリキー）</p></td>
     <td><p>Tencent Cloud VectorDBからのプライマリキーがZilliz Cloudのプライマリキーとして自動的にマッピングされます。</p><p>データを移行する際、自動IDを有効にすることができます。ただし、この場合、ソースコレクションの元のプライマリキー値は破棄されます。</p></td>
   </tr>
   <tr>
     <td><p>密度ベクター</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>密度ベクターフールは修正不要でFLOAT_VECTORとして転送されます。</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>JSON（動的フィールド）</p></td>
     <td><p>デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。</p><p>詳細については、<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
</table>

## JSONフィールド変換\{#json-field-conversion}

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz CloudはJSONスキーマを検出するために100行をサンプリングします。必要に応じて手動で追加フィールドを追加できます。</p>

</Admonition>

Tencent Cloud VectorDBのJSONフィールドは、最大限の柔軟性を確保するためにZilliz Cloudの動的スキーマに最初はマッピングされます。オプションでJSONフィールドを固定フィールドに変換して、以下を得ることができます：

- より強い検証のための強制データ型

- より良いクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化スキーマ

以下のJSONフィールド型は、動的から固定フィールドに自動的に変換できます：

<table>
   <tr>
     <th><p>VectorDB JSON型</p></th>
     <th><p>Zilliz固定フィールド型</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>文字列</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,535バイト対応</p></td>
   </tr>
   <tr>
     <td><p>uint64</p></td>
     <td><p>INT32</p></td>
     <td><p>型調整による数値変換</p></td>
   </tr>
   <tr>
     <td><p>倍精度</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>直接型変換</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>ARRAY</p></td>
     <td><p>対応する要素型とのサポート</p></td>
   </tr>
</table>

固定フィールドに変換されたJSONフィールドについては、追加の属性を構成できます：

- **NULL可能**: フィールドがNULL値を受け入れるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[NULL属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

- **パーティションキー**: オプションでINT64またはVARCHARフィールドをパーティションキーとして指定できます。各コレクションは1つのパーティションキーのみをサポートし、選択されたフィールドはNULL不可でなければならないことに注意してください。詳細については、[パーティションキーを使用](./use-partition-key)を参照してください。

## Tencent Cloud VectorDB固有の処理ルール\{#tencent-cloud-vectordb-specific-handling-rules}

### コレクション名付けルール\{#collection-naming-rules}

Tencent Cloud VectorDBコレクション名は、以下の考慮事項でZilliz Cloudに転送されます：

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p>デフォルトの名前付け</p></td>
     <td><p>コレクション名はソースコレクション名と完全に一致します</p></td>
     <td><p>名前はTencent Cloud VectorDBからそのまま保持されます</p></td>
   </tr>
   <tr>
     <td><p>命名競合</p></td>
     <td><p>データベースに同じ名前のコレクションが既に存在する場合、移行ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除、異なるターゲットデータベースを選択、または移行構成中に名前を変更してください</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>コレクション名はQdrantからそのまま保持されます</p></td>
     <td><p>コレクション名がZilliz Cloudの命名規則に準拠していることを確認してください</p></td>
   </tr>
</table>

