---
title: "Membership Match | Cloud"
slug: /membership-match
sidebar_label: "Membership Match"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: DgbMwHFLlif3mGksDKCcXf51nje
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Membership Match

## 概要\{#overview}

Membership Match は、スカラーフィールドの値が呼び出し元から提供されたセットに属するかどうかを検査してエンティティをフィルタリングします。クライアントはコンパクトなバイナリのメンバーシップフィルターブロブを構築し、式テンプレートの値として渡します。

これは大規模な `IN [...]` リストを置き換えます。`IN` フィルターはすべてのメンバーをリクエストにシリアライズします。1,000 万個の int64 値では約 90 MB になり、プロキシのデフォルトの gRPC 受信上限を超える可能性があります。`membership_match` を使用すると、プロキシはブロブを検証し、メンバーリストを再構築せずにクエリプランに埋め込みます。

![PUVJwjgrOhfiDxb5TLhcfaPRnkf](https://zdoc-images.s3.us-west-2.amazonaws.com/PUVJwjgrOhfiDxb5TLhcfaPRnkf.png)

この図は、固定された役割分担を示しています。クライアントはブロブを一度構築し、リクエスト間で再利用します。プロキシはエンベロープとサイズ上限を検証し、ブロブをそのままクエリプランに埋め込みます。QueryNodes は、生データまたはインデックスに対してプランを評価します。

この演算子には、正確性の保証が異なる 2 つのエンコーディングがあります。

- **Bloom** (`type=bloom`): 近似メンバーシップです。偽陽性は発生する可能性がありますが、有効なフィルターで偽陰性は想定されません。一般的な用途は、偶発的な偽陽性を許容できる大規模なオーディエンスフィルターまたは除外フィルターです。

- **Roaring** (`type=roaring`): 整数値に対する正確なメンバーシップです。一般的な用途は、ACL、テナントの可視性、コンプライアンスフィルター、ID セットによる削除操作です。

**Bloom** メンバーシップを認可の判断や破壊的な削除に使用しないでください。偽陽性が発生すると、意図したセットに含まれない行が公開されたり、削除されたりする可能性があります。

### 運用チェックリスト\{#operational-checklist}

- 対象フィールドの型を確認し、同じ値ドメインからブロブを構築してください。

- 偽陽性を許容できる場合に限り、Bloom を選択してください。

- ACL、コンプライアンス、テナント分離、削除操作には Roaring を選択してください。

- 大規模なブロブは一度構築して再利用し、リクエストごとに再構築しないでください。

- ブロブのサイズは、メンバー数ではなくシリアライズ後のバイト数で見積もってください。

- バージョンが混在するクラスターでは、`membership_match` を有効にする前に、プロキシを先頭にしてローリングアップグレードを完了してください。

- 破壊的なワークフローを有効にする前に、非本番環境のコレクションで式をテストしてください。

## 式の構文\{#expression-syntax}

```plaintext
membership_match(<field>, {<template>}, type=bloom)
membership_match(<field>, {<template>}, type=roaring)
membership_match(<field>, {<template>})
not membership_match(<field>, {<template>}, type=bloom)
```

2 番目の引数はテンプレートのプレースホルダーです。SDK は、クライアントが構築したフィルターブロブを含む protobuf の `bytes` としてプレースホルダー値を提供します。本番環境の式では `type` を明示し、意図した正確性の契約がコードとログで確認できるようにします。

`type` 引数は省略可能です。すべてのブロブには自己記述的なマジックヘッダーが付いており、Bloom では `MBF1`、Roaring では `MRB1` です。`type` を省略した場合、サーバーはこのヘッダーを検査します。ブロブのヘッダーと競合する明示的な `type` はリクエストエラーとして拒否され、不明なヘッダーまたは切り詰められたヘッダーはフェイルクローズ状態になります。

## エンコーディングを選択する\{#choose-the-encoding}

偽陽性を許容できる場合は Bloom を使用します。Bloom は、符号付き整数フィールド (**INT8**/**16**/**32**/**64**), **VARCHAR** フィールド、および **JSON** パスを受け入れます。Bloom フィルターは正確な許可リストではありません。

`fpr`（偽陽性率）は、値が一度も挿入されていないにもかかわらず、Bloom フィルターがその値をメンバーとして報告する確率です。`fpr=0.005` は、メンバーでない値 200 個のうち約 1 個が誤って存在すると報告されることを意味します。fpr を低くするとブロブは大きくなります。

すべての一致が正確である必要がある場合は **Roaring** を使用します。**Roaring** は符号付き整数フィールドのみを受け入れます。メンバーはシリアライズ前に **INT64** へ符号拡張されるため、INT8 の -1 と INT64 の -1 は同じメンバーです。UUID やその他の文字列フィールドには使用しないでください。

| 項目 | Bloom (type=bloom) | Roaring (type=roaring) |
| --- | --- | --- |
| 精度 | 近似です。偽陽性は発生する可能性がありますが、偽陰性はありません。 | 正確です。偽陽性も偽陰性もありません。 |
| フィールド | INT8/16/32/64, VARCHAR、JSON パス | 符号付き INT8/16/32/64 のみ |
| ブロブサイズ | メンバー数と FPR に依存します。FPR 0.005 ではメンバーあたり約 11 ビットです。本体サイズは 2 のべき乗です。 | 値の分布に依存します。密なセットははるかに小さいサイズに圧縮されます。ランダムな 64 ビット値は 262,144 の high-container 上限に達します。 |
| 削除 | 解析時に拒否されます。 | 許可されます。 |
| 一般的な用途 | オーディエンスフィルターと除外フィルター | ACL、コンプライアンス、テナント分離、ID セットによる削除 |

**JSON** パスは行ごとに厳密に型付けされます。**JSON** 文字列は **VARCHAR** 値として、**JSON** 整数は **INT64** 値として検査され、**JSON** の double は整数メンバーと一致しません。これは、5.0 が 5 と等しい正確な `IN` とは異なります。書き込み側が整数を浮動小数点でエンコードする場合は、書き込み時に正規化するか、型付きスカラーフィールドを使用してください。

どちらのエンコーディングでも、メンバーセットは対象フィールドと同じ値ドメインから構築してください。文字列 `"10086"` から Bloom フィルターを構築し、それを `INT64` フィールドに適用しないでください。ブロブのヘッダーには挿入された値ドメインが記録されます。誤ったドメインのブロブは、何も一致しないまま暗黙に処理されるのではなく、パラメーターエラーとしてプロキシによって拒否されます。構築したブロブは、クエリごとに再構築するのではなく、リクエスト間で再利用してください。

数千個以下のメンバーからなるセットでは、通常の `IN` が最も簡単な選択肢です。サーバーは **IN**、**Bloom**、**Roaring** の中から選択しません。エンコーディングの選択は呼び出し元の責任です。

![Opl7wav7vhn12ObRkJFc1UONnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/Opl7wav7vhn12ObRkJFc1UONnXe.png)

図は上から下へ読みます。最初の判断は、ワークロードが偽陽性を許容できるかどうかです。許容できない場合、**Bloom** は選択肢になりません。正確なエンコーディングである **Roaring** には、符号付き整数フィールドが必要です。密な値またはクラスター化された値は、最小のブロブに圧縮されます。一様にランダムな 64 ビット値は、262,144 の high-container 上限またはサイズ上限を超える可能性があります。超える場合、残る正確な選択肢は従来の **IN** リストです。整数以外のフィールドには、正確なメンバーシップエンコーディングがまったくありません。

Membership Match は RESTful HTTP API では使用できません。HTTP の式テンプレートパラメーターは bool、number、string、array の値のみを受け入れ、ブロブ用のバイナリ `bytes` 型はありません。メンバーシップブロブを渡すには、gRPC ベースの SDK を使用してください。

## SDK のリクエストパターン\{#sdk-request-patterns}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, build_bloom_filter, build_roaring_bitmap

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
bloom_blob = build_bloom_filter(["creator-a", "creator-b"], fpr=0.005)
client.search(collection_name="posts", data=[query_vector], anns_field="embedding", limit=10,
              filter="membership_match(creator_id, {members}, type=bloom)",
              filter_params={"members": bloom_blob})

roaring_blob = build_roaring_bitmap([1001, 1002, 1003])
client.query(collection_name="docs", filter="membership_match(user_id, {members}, type=roaring)",
             filter_params={"members": roaring_blob}, output_fields=["user_id", "title"])
```

</TabItem>

<TabItem value='go'>

```go
bloomBlob, err := milvusclient.NewBloomFilterBlob([]int64{1001, 1002}, fpr)
if err != nil { return err }
search := milvusclient.NewSearchOption("posts", topK, vectors).
    WithFilter("membership_match(creator_id, {members}, type=bloom)").
    WithTemplateParam("members", bloomBlob)

roaringBlob, err := milvusclient.NewRoaringBitmapBlob([]int64{1001, 1002})
if err != nil { return err }
query := milvusclient.NewQueryOption("docs").
    WithFilter("membership_match(user_id, {members}, type=roaring)").
    WithTemplateParam("members", roaringBlob)
```

</TabItem>

<TabItem value='java'>

```java
byte[] bloomBlob = BloomFilterUtils.buildBloomFilter(userIds, BloomFilterUtils.DEFAULT_FPR);
QueryReq request = QueryReq.builder().collectionName("docs")
    .filter("membership_match(user_id, {members}, type=bloom)")
    .filterTemplateValues(Collections.singletonMap("members", bloomBlob)).build();
byte[] roaringBlob = RoaringBitmapUtils.buildRoaringBitmap(userIds);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const bloomBlob = buildBloomFilter(userIds);
await client.query({ collection_name: 'docs',
  filter: 'membership_match(user_id, {members}, type=bloom)',
  exprValues: { members: bloomBlob } });
const roaringBlob = buildRoaringBitmap(integerIds);
```

</TabItem>
</Tabs>

## Roaring を使用した削除\{#delete-with-roaring}

外部の整数 ID セットによって選択されたエンティティを削除する場合は、正確な **Roaring** ブロブを使用します。削除を発行する前に、メンバーセットとコレクションのフィールド型を確認してください。Bloom は使用しないでください。近似メンバーシップは安全な削除述語ではなく、Bloom 形式は解析時に Delete 式で拒否されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
roaring_blob = build_roaring_bitmap([1001, 1002, 1003])
client.delete(collection_name="docs", filter="membership_match(id, {members}, type=roaring)",
              filter_params={"members": roaring_blob})
```

</TabItem>

<TabItem value='go'>

```go
roaringBlob, err := milvusclient.NewRoaringBitmapBlob([]int64{1001, 1002, 1003})
if err != nil { return err }
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("docs").
    WithExpr("membership_match(id, {members}, type=roaring)").
    WithTemplateParam("members", roaringBlob))
```

</TabItem>

<TabItem value='java'>

```java
byte[] roaringBlob = RoaringBitmapUtils.buildRoaringBitmap(userIds);
DeleteReq request = DeleteReq.builder().collectionName("docs")
    .filter("membership_match(id, {members}, type=roaring)")
    .filterTemplateValues(Collections.singletonMap("members", roaringBlob)).build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const roaringBlob = buildRoaringBitmap(integerIds);
await client.delete({ collection_name: 'docs',
  filter: 'membership_match(id, {members}, type=roaring)',
  exprValues: { members: roaringBlob } });
```

</TabItem>
</Tabs>

削除のセマンティクスは、正確な三値一致に従います。

| フィールド値 | membership_match(...) | not membership_match(...) |
| --- | --- | --- |
| NULL | 一致なし（NULL） | 一致なし（NULL） |
| メンバーセット内 | 一致 | 一致なし |
| セット外 | 一致なし | 一致 |

この表は行ごとに読みます。`membership_match` を含む Delete はセット内のエンティティを削除し、`not membership_match` を含む Delete はセット外のエンティティを削除します。NULL のエンティティは、どちらの極性でも残ります。

- NULL のフィールド値を持つエンティティは、どちらの極性でも削除されません。

- 空のビットマップは何も削除しません。`not membership_match(<field>, {<empty>}, type=roaring)` は、NULL 以外のフィールド値を持つすべての行を削除します。これは正確な補集合であり、設計上大規模なセットになる可能性があります。

- `not membership_match` は、NULL 以外のエンティティに対するメンバーセットの正確な補集合であり、近似ではありません。

インデックスのみでロードされたシール済みセグメントに生のスカラーデータがない場合、評価では、インデックスが対応していれば限定的な逆引き検索を使用します。生のフィールドデータも適格なインデックスも利用できない場合、リクエストはフィルタリングされていないエンティティを返す代わりに `FieldNotLoaded` で失敗します。

## 運用上の制限\{#operational-limits}

| 設定 | デフォルト | 構成可能 | 制限対象 |
| --- | --- | --- | --- |
| `proxy.maxMembershipFilterSize` | 64 MiB | `milvus.yaml` proxy | 1 つのブロブ本体 |
| `proxy.maxMembershipFilterPlanSize` | 128 MiB | `milvus.yaml` proxy | リクエストごとの合計 |
| `proxy.grpc.serverMaxRecvSize` | 128 MiB | `milvus.yaml` proxy | リクエスト全体 |
| Roaring の high-container 上限 | 262,144 | コード内で固定 | フィルターごと |
| Roaring のデコード後メモリ推定値 | 64 MiB | コード内で固定 | フィルターごと |
| MBF1 形式の上限 | 128 MiB | コード内で固定 | ブロブ形式の上限 |
| Bloom `fpr` | 0.005 | クライアントビルダー | 偽陽性の目標値 |

`proxy.*` の項目は Milvus サーバーの構成です。クラスター管理者が `milvus.yaml` の `proxy` セクションで設定し、フィルタリング時にリクエスト単位または式単位で調整することはできません。**Roaring** の受け入れ条件と MBF1 形式の上限は実装で固定されており、どこでも構成できません。`fpr` の行だけがクライアント側の制御です。ブロブの構築時に選択し、許容範囲は 0.0001 から 0.05 です。

デフォルトの fpr では、ブロブ本体の最大サイズで約 4,860 万個の INT64 メンバーを格納できます。これに加えて、固定の 32 バイトのエンベロープヘッダーが許可されます。リクエスト全体の予算は、メンバーシップを含むプランのシリアライズ後の合計サイズと、Roaring フィルターのデコード後推定サイズの合計を対象とし、HybridSearch のサブリクエストとスコアラーフィルターで共有されます。Bloom の本体サイズは 2 のべき乗です。メンバー数が段階の境界をわずかに超えるとブロブは 2 倍になり、fpr を少し高くすると多くの場合 1 つ下の段階に収まります。プロキシがサイズ超過の Bloom ブロブを拒否した場合、エラーは収まる `fpr` を提案します。

- メンバーシップ式の結果は、リクエスト間でキャッシュされません。

- バージョンが混在するクラスターはフェイルクローズします。古いコードを実行している QueryNodes は、メンバーシッププランノードを含むプランを拒否します。最初にプロキシをアップグレードし、次にローリングアップグレードを完了してから演算子を有効にしてください。

- サーバーログはブロブのバイトを秘匿します。式のテキストにはテンプレート名のみが含まれ、バイナリペイロードはテンプレート値で帯域外送信されます。
