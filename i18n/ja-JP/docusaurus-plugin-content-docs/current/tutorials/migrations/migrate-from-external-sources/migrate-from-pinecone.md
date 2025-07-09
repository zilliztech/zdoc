---
title: "PineconeからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
notebook: FALSE
description: "このトピックでは、松ぼっくりから移行する際に、Zilliz Cloudがデータ型マッピング、フィールド変換、名前空間処理、コレクション命名規則を処理する方法について説明します。 | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - pinecone
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db

---

import Admonition from '@theme/Admonition';


# PineconeからZilliz Cloudへの移行

このトピックでは、[松ぼっくり](https://www.pinecone.io/)から移行する際に、Zilliz Cloudがデータ型マッピング、フィールド変換、名前空間処理、コレクション命名規則を処理する方法について説明します。

## 前提条件{#prerequisites}

PineconeからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### 松ぼっくりの要件{#pinecone-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>インデックスタイプ</p></td>
     <td><p>Pineconeサーバーレスインデックスからの移行のみをサポートしています</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>アクセス権限を持つPinecone APIキー</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>Pineconeからのソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。</p></td>
   </tr>
   <tr>
     <td><p>ベクトル次元</p></td>
     <td><p>次元は1より大きくなければなりません。1次元ベクトルはマイグレーションの失敗を引き起こします</p></td>
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

PineconeのデータタイプがZilliz Cloudにどのようにマッピングされるかを理解することは、移行を計画する上で重要です。

<table>
   <tr>
     <th><p>松ぼっくり畑の種類</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>ノート</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>VARCHAR(プライマリキー)</p></td>
     <td><p>自動的にマップされます。新しいIDを生成するためにAuto IDを有効にします(元の値は破棄されます)。</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>寸法は正確に保持され、変更は必要ありません</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>浮動小数点ベクトル</p></td>
     <td><p>サンプルデータで空でない場合にのみマップされます。</p></td>
   </tr>
   <tr>
     <td><p>メタデータ</p></td>
     <td><p>ダイナミックフィールド</p></td>
     <td><p>デフォルトで動的スキーマとしてマップされ、固定フィールドに変換できます。</p><p>詳細については、<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>名前空間</p></td>
     <td><p>パーティションキー/パーティション</p></td>
     <td><p>パフォーマンスの最適化に推奨されます。</p><p>詳細については、<a href="./migrate-from-pinecone#namespace-processing">名前空間の処理</a>を参照してください。</p></td>
   </tr>
</table>

## メタデータフィールドの変換{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはメタデータスキーマを検出するために100行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。</p>

</Admonition>

Pineconeメタデータは、最大限の柔軟性を得るために、最初にZilliz Cloudの動的スキーマにマップされます。オプションで、メタデータフィールドを固定フィールドに変換して、以下を得ることができます。

- より強力な検証のための強制データ型

- クエリのパフォーマンスを向上させるためのインデックスの最適化

- 一貫したデータ管理のための構造化スキーマ

メタデータを固定フィールドに変換する場合:

<table>
   <tr>
     <th><p>Pineconeメタデータ型</p></th>
     <th><p>Zilliz固定フィールドタイプ</p></th>
     <th><p>ノート</p></th>
   </tr>
   <tr>
     <td><p>ストリング</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,53 5バイトをサポート</p></td>
   </tr>
   <tr>
     <td><p>数値(整数/フロート)</p></td>
     <td><p>ダブル</p></td>
     <td><p>すべての数値型はDOUBLEになります</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>BOOL</p></td>
     <td><p>ダイレクトマッピング</p></td>
   </tr>
   <tr>
     <td><p>文字列のリスト</p></td>
     <td><p>アレイ<varchar></varchar></p></td>
     <td><p>ネストされた配列をサポート</p></td>
   </tr>
</table>

固定フィールドに変換されたメタデータフィールドについては、追加の属性を構成できます

- **Nullable**:フィールドがnull値を受け入れることができるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[Nullableな属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**:データがない場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

## 松ぼっくり特有の取り扱い規則{#pinecone-specific-handling-rules}

### 名前空間の処理{#namespace-processing}

Pinecone名前空間は、2つの戦略を使用して移行できます

<table>
   <tr>
     <th><p>ストラテジー</p></th>
     <th><p>インプリメンテーション</p></th>
     <th><p>パフォーマンスへの影響</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p><strong>パーティションキーとしての名前空間</strong><em>(推奨)</em></p></td>
     <td><p>名前空間はパーティションキーフィールドの値になります</p></td>
     <td><p>検索パフォーマンスの自動最適化</p></td>
     <td><p>複数の名前空間を持つほとんどのシナリオ</p></td>
   </tr>
   <tr>
     <td><p><strong>パーティションとしての名前空間</strong></p></td>
     <td><p>各名前空間は個別のパーティションになります</p></td>
     <td><p>手動パーティション管理が必要です</p></td>
     <td><p>安定した名前空間が少ないシンプルなシナリオ</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>Pineconeの<code>default</code>名前空間の処理:</p>
<ul>
<li><p><strong>パーティションとして</strong>: Zilliz Cloudで<code>_default</code>パーティションになります</p></li>
<li><p><strong>パーティションキーとして</strong>:空の文字列<code>""</code>の値になります</p></li>
</ul>
<p>パーティションとパーティションキーの概念の詳細については、<a href="./manage-partitions">パーティションの管理</a>と<a href="./use-partition-key">パーティションキーを使う</a>を参照してください。</p>

</Admonition>

### コレクションの命名規則{#collection-naming-rules}

Pineconeインデックス名は、Zilliz Cloudとの互換性のために自動的に処理されます

<table>
   <tr>
     <th><p>松ぼっくりインデックスName</p></th>
     <th><p>Zilliz CloudコレクションName</p></th>
     <th><p>適用されるルール</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ハイフン(<code>-</code>)をアンダースコア(<code>_</code>)に変換して、Zilliz Cloudコレクションの命名規則に準拠します。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>変更は必要ありません</p></td>
   </tr>
</table>

**名前の競合**:同じ名前のコレクションがターゲットデータベースに既に存在する場合、次の操作を行う必要があります:

- 既存のコレクションを削除するか、

- 別のターゲットデータベースを選択するか、

- 移行設定中にターゲットコレクションの名前を変更する

