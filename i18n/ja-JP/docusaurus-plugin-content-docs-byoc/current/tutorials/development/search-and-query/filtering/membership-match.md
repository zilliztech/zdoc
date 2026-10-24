---
title: "Membership Match | BYOC"
slug: /membership-match
sidebar_label: "Membership Match"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | BYOC"
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

Membership-match は、スカラーフィールドの値が呼び出し元から提供されたセットに属するかどうかを判定してエンティティをフィルタリングします。クライアントはコンパクトなバイナリのメンバーシップフィルター blob を構築し、式テンプレートの値として渡します。

これは大規模な `IN [...]` リストを置き換えます。`IN` フィルターはすべてのメンバーをリクエストにシリアル化します。1,000 万個の int64 値では約 90 MB になり、デフォルトのプロキシの gRPC 受信上限を超える可能性があります。`membership_match` を使用すると、プロキシは blob を検証し、メンバーリストを再構築せずにクエリプランに埋め込みます。

![PUVJwjgrOhfiDxb5TLhcfaPRnkf](https://zdoc-images.s3.us-west-2.amazonaws.com/PUVJwjgrOhfiDxb5TLhcfaPRnkf.png)

この図は、固定された役割分担を示しています。クライアントは blob を 1 回構築し、リクエスト間で再利用します。プロキシはエンベロープとサイズ制限を検証し、blob をそのままクエリプランに埋め込みます。QueryNodes は、生データまたはインデックスに対してプランを評価します。

この演算子には、正確性の保証が異なる 2 つのエンコード方式があります。

- **Bloom**（`type=bloom`）：近似メンバーシップです。偽陽性は発生する可能性がありますが、有効なフィルターで偽陰性は想定されません。一般的な用途は、まれな偽陽性が許容される大規模なオーディエンスフィルターまたは除外フィルターです。

- **Roaring**（`type=roaring`）：整数値に対する正確なメンバーシップです。一般的な用途は、ACL、テナントの可視性、コンプライアンスフィルター、ID セットによる削除操作です。

認可の判断や破壊的な削除には **Bloom** メンバーシップを使用しないでください。偽陽性により、意図したセットにない行が公開されたり、削除されたりする可能性があります。

### 運用チェックリスト\{#operational-checklist}

- 対象フィールドの型を確認し、同じ値ドメインから blob を構築してください。

- 偽陽性が許容される場合にのみ Bloom を選択してください。

- ACL、コンプライアンス、テナント分離、削除操作には Roaring を選択してください。

- 大規模な blob は 1 回構築して再利用し、リクエストごとに再構築しないでください。

- blob のサイズは、メンバー数ではなくシリアル化されたバイト数で見積もってください。

- バージョンが混在するクラスターでは、`membership_match` を有効にする前に、まずプロキシを対象としたローリングアップグレードを完了してください。

- 破壊的なワークフローを有効にする前に、非本番環境のコレクションで式をテストしてください。

## 式の構文\{#expression-syntax}

```plaintext
membership_match(<field>, {<template>}, type=bloom)
membership_match(<field>, {<template>}, type=roaring)
membership_match(<field>, {<template>})
not membership_match(<field>, {<template>}, type=bloom)
```

2 番目の引数はテンプレートのプレースホルダーです。SDK は、クライアントが構築したフィルターブロブを含む protobuf の `bytes` としてプレースホルダーの値を提供します。本番環境の式では `type` を明示し、意図する正確性の契約がコードとログで確認できるようにしてください。

`type` 引数は省略可能です。すべての blob には自己記述的なマジックヘッダーがあり、Bloom は `MBF1`、Roaring は `MRB1` です。`type` を省略すると、サーバーはヘッダーを検査します。blob のヘッダーと競合する明示的な `type` はリクエストエラーとして拒否され、不明なヘッダーまたは切り詰められたヘッダーはフェイルクローズ状態になります。

## エンコード方式を選択する\{#choose-the-encoding}

偽陽性が許容される場合は Bloom を使用します。Bloom は符号付き整数フィールド (**INT8**/**16**/**32**/**64**), **VARCHAR** フィールド、および **JSON** パスを受け入れます。Bloom フィルターは正確な許可リストではありません。

`fpr`（偽陽性率）は、値が挿入されていないのに Bloom フィルターがその値をメンバーとして報告する確率です。`fpr=0.005` は、約 200 個の非メンバー値のうち 1 個が誤って存在すると報告されることを意味します。fpr を低くすると blob は大きくなります。

すべての一致が正確である必要がある場合は **Roaring** を使用します。**Roaring** は符号付き整数フィールドのみを受け入れます。メンバーはシリアル化前に **INT64** へ符号拡張されるため、INT8 の -1 と INT64 の -1 は同じメンバーです。UUID やその他の文字列フィールドには使用しないでください。

| 項目 | Bloom (type=bloom) | Roaring (type=roaring) |
| --- | --- | --- |
| 精度 | 近似です。偽陽性は発生する可能性がありますが、偽陰性はありません。 | 正確です。偽陽性も偽陰性もありません。 |
| フィールド | INT8/16/32/64, VARCHAR、JSON パスです。 | 符号付き INT8/16/32/64 のみです。 |
| blob サイズ | メンバー数と FPR によって決まります。FPR 0.005 ではメンバーあたり約 11 ビットで、本体サイズは 2 のべき乗です。 | 値の分布によって決まります。高密度のセットははるかに小さく圧縮されます。ランダムな 64 ビット値は 262,144 のハイコンテナー上限に達します。 |
| 削除 | 解析時に拒否されます。 | 許可されます。 |
| 一般的な用途 | オーディエンスフィルターと除外フィルターです。 | ACL、コンプライアンス、テナント分離、ID セットによる削除です。 |

**JSON** パスは行ごとに厳密に型付けされます。**JSON** 文字列は **VARCHAR** 値として、**JSON** 整数は **INT64** 値として検査されます。**JSON** の double 値は整数メンバーと一致しません。これは、5.0 が 5 と等しい正確な `IN` とは異なります。書き込み側が整数を浮動小数点でエンコードする場合は、書き込み時に正規化するか、型付きスカラーフィールドを使用してください。

どちらのエンコード方式でも、対象フィールドと同じ値ドメインからメンバーセットを構築してください。文字列 `"10086"` から Bloom フィルターを構築し、それを `INT64` フィールドに適用しないでください。blob のヘッダーには挿入された値ドメインが記録されます。誤ったドメインの blob は、何も一致しないまま処理されるのではなく、プロキシによってパラメーターエラーとして拒否されます。クエリごとに再構築するのではなく、構築済みの blob をリクエスト間で再利用してください。

メンバー数が数千以下のセットでは、単純な `IN` が引き続き最も簡単な選択肢です。サーバーは **IN**、**Bloom**、**Roaring** のいずれかを選択しません。エンコード方式の選択は呼び出し元の責任です。

![Opl7wav7vhn12ObRkJFc1UONnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/Opl7wav7vhn12ObRkJFc1UONnXe.png)

図は上から下に読みます。最初の判断は、ワークロードが偽陽性を許容できるかどうかです。許容できない場合、**Bloom** は選択肢になりません。正確なエンコード方式である **Roaring** には、符号付き整数フィールドが必要です。高密度またはクラスタリングされた値は、最小の blob に圧縮されます。一様にランダムな 64 ビット値は、262,144 のハイコンテナー上限またはサイズ制限を超える可能性があります。超えた場合に残る正確な選択肢は、従来の **IN** リストです。整数以外のフィールドには、正確なメンバーシップエンコード方式がまったくありません。

Membership-match は RESTful HTTP API では使用できません。HTTP の式テンプレートパラメーターは bool、number、string、array の値のみを受け入れ、blob 用のバイナリ `bytes` 型はありません。メンバーシップ blob を渡すには、gRPC ベースの SDK を使用してください。

## SDK リクエストパターン\{#sdk-request-patterns}

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

外部の整数 ID セットで選択したエンティティを削除する場合は、正確な **Roaring** blob を使用します。削除を実行する前に、メンバーセットとコレクションのフィールド型を確認してください。Bloom は使用しないでください。近似メンバーシップは安全な削除述語ではなく、Bloom 形式は解析時に Delete 式で拒否されます。

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

この表は行ごとに読みます。`membership_match` を指定した Delete は、セット内のエンティティを削除します。`not membership_match` を指定した Delete は、セット外のエンティティを削除します。NULL のエンティティは、どちらの極性でも残ります。

- NULL のフィールド値を持つエンティティは、どちらの極性でも削除されません。

- 空のビットマップでは何も削除されません。`not membership_match(<field>, {<empty>}, type=roaring)` は、NULL 以外のフィールド値を持つすべての行を削除します。これは正確な補集合であり、設計上、大規模なセットになる可能性があります。

- `not membership_match` は、NULL 以外のエンティティに対するメンバーセットの正確な補集合であり、近似ではありません。

インデックスのみでロードされたシール済みセグメントでは、生のスカラーデータがない場合、インデックスが対応していれば、評価は制限付きの逆引きを使用します。生のフィールドデータも適切なインデックスも使用できない場合、リクエストはフィルターされていないエンティティを返すのではなく、`FieldNotLoaded` で失敗します。

## 運用上の制限\{#operational-limits}

| 設定 | デフォルト | 設定可能 | 制限対象 |
| --- | --- | --- | --- |
| `proxy.maxMembershipFilterSize` | 64 MiB | `milvus.yaml` proxy | blob 本体 1 個 |
| `proxy.maxMembershipFilterPlanSize` | 128 MiB | `milvus.yaml` proxy | リクエストごとの合計 |
| `proxy.grpc.serverMaxRecvSize` | 128 MiB | `milvus.yaml` proxy | リクエスト全体 |
| Roaring のハイコンテナー上限 | 262,144 | コードで固定 | フィルターごと |
| Roaring のデコード後メモリ見積もり | 64 MiB | コードで固定 | フィルターごと |
| MBF1 形式の上限 | 128 MiB | コードで固定 | blob 形式の上限 |
| Bloom `fpr` | 0.005 | クライアントのビルダー | 偽陽性の目標値 |

`proxy.*` の項目は Milvus サーバーの構成です。クラスターのオペレーターが `milvus.yaml` の `proxy` セクションで設定し、フィルタリング時にリクエストごとまたは式ごとに調整することはできません。**Roaring** の受け入れ条件と MBF1 形式の上限は実装で固定されており、どこでも構成できません。`fpr` の行だけがクライアント側の制御であり、blob の構築時に選択します。許容範囲は 0.0001 から 0.05 です。

blob 本体の最大サイズでは、デフォルトの fpr で約 4,860 万個の INT64 メンバーを格納できます。これに固定の 32 バイトのエンベロープヘッダーを追加できます。リクエスト全体の予算は、メンバーシップを含むプランのシリアル化された合計サイズと、Roaring フィルターのデコード後の推定合計サイズを対象とし、HybridSearch のサブリクエストとスコアラーフィルターで共有されます。Bloom の本体サイズは 2 のべき乗です。メンバー数が段階の境界をわずかに超えると blob は 2 倍になり、fpr を少し高くすると多くの場合、1 つ下の段階に収まります。プロキシがサイズ超過の Bloom blob を拒否した場合、エラーには収まる `fpr` が示されます。

- メンバーシップ式の結果は、リクエスト間でキャッシュされません。

- バージョンが混在するクラスターはフェイルクローズします。古いコードを実行している QueryNode は、メンバーシッププランノードを含むプランを拒否します。まずプロキシをアップグレードし、その後、演算子を有効にする前にローリングアップグレードを完了してください。

- サーバーログでは blob のバイトが秘匿化されます。式のテキストにはテンプレート名のみが含まれ、バイナリペイロードはテンプレート値として別経路で送信されます。
