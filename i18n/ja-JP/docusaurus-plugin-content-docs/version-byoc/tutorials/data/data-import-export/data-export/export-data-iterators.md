---
title: "イテレータを使用したデータのエクスポート | BYOC"
slug: /export-data-iterators
sidebar_label: "イテレータの使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudコレクションからデータをエクスポートする方法の例を提供します。| BYOC"
type: origin
token: N6fZwCUXqiqoJEkFiVNcvDJEnnc
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - data export
  - iterator
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# イテレータを使用したデータのエクスポート

このガイドでは、Zilliz Cloudコレクションからデータをエクスポートする方法の例を提供します。

## 概要\{#overview}

MilvusのPythonおよびJava SDKの両方で、メモリ効率の良い方法でコレクション内のエンティティを反復処理するためのイテレータAPIが提供されています。詳細については、[検索イテレータ](./with-iterators)を参照してください。

イテレータを使用すると、以下の利点があります。

- **簡潔さ**: 複雑な **offset** および **limit** 設定を排除します。

- **効率性**: 必要なデータのみを取得することで、スケーラブルなデータ取得を提供します。

- **一貫性**: 真偽値フィルターを用いて一貫したデータセットサイズを確保します。

これらのAPIを使用して、Zilliz Cloudコレクションから特定またはすべてのエンティティをエクスポートできます。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は、Milvus 2.3.x以降と互換性のあるZilliz Cloudクラスターで利用可能です。</p>

</Admonition>

## 準備\{#preparations}

以下の手順では、Zilliz Cloudクラスターへの接続、コレクションの迅速なセットアップ、および10,000個を超えるランダムに生成されたエンティティをコレクションに挿入するコードを再利用しています。

### ステップ1: コレクションの作成\{#step-1-create-a-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Milvusクライアントをセットアップ
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# 2. コレクションを作成
client.create_collection(
    collection_name="quick_setup",
    dimension=5,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;
import io.milvus.param.highlevel.collection.CreateSimpleCollectionParam;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Milvusサーバーに接続
ConnectParam connectParam = ConnectParam.newBuilder()
        .withUri(CLUSTER_ENDPOINT)
        .withToken(TOKEN)
        .build();

MilvusServiceClient client  = new MilvusServiceClient(connectParam);

// 2. コレクションを作成
CreateSimpleCollectionParam createCollectionParam = CreateSimpleCollectionParam.newBuilder()
        .withCollectionName("quick_setup")
        .withDimension(5)
        .build();

client.createCollection(createCollectionParam);
```

</TabItem>
</Tabs>

### ステップ2: ランダムに生成されたエンティティを挿入\{#step-2-insert-randomly-generated-entities}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
# 3. ランダムに生成されたベクトルを挿入
colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]
data = []

for i in range(10000):
    current_color = random.choice(colors)
    current_tag = random.randint(1000, 9999)
    data.append({
        "id": i,
        "vector": [ random.uniform(-1, 1) for _ in range(5) ],
        "color": current_color,
        "tag": current_tag,
        "color_tag": f"{current_color}_{str(current_tag)}"
    })

print(data[0])

# 出力
#
# {
#     "id": 0,
#     "vector": [
#         -0.5705990742218152,
#         0.39844925120642083,
#         -0.8791287928610869,
#         0.024163154953680932,
#         0.6837669917169638
#     ],
#     "color": "purple",
#     "tag": 7774,
#     "color_tag": "purple_7774"
# }

res = client.insert(
    collection_name="quick_setup",
    data=data,
)

print(res)

# 出力
#
# {
#     "insert_count": 10000,
#     "ids": [
#         0,
#         1,
#         2,
#         3,
#         4,
#         5,
#         6,
#         7,
#         8,
#         9,
#         "(9990 more items hidden)"
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import com.alibaba.fastjson.JSONObject;

import io.milvus.param.R;
import io.milvus.param.dml.InsertParam;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

// 3. ランダムに生成されたベクトルをコレクションに挿入
List<String> colors = Arrays.asList("green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey");
List<JSONObject> data = new ArrayList<>();

for (int i=0; i<10000; i++) {
    Random rand = new Random();
    String current_color = colors.get(rand.nextInt(colors.size()-1));
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color_tag", current_color + "_" + String.valueOf(rand.nextInt(8999) + 1000));
    data.add(row);
}

InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName("quick_setup")
    .withRows(data)
    .build();

R<MutationResult> insertRes = client.insert(insertParam);

if (insertRes.getStatus() != R.Status.Success.getCode()) {
    System.err.println(insertRes.getMessage());
}

MutationResultWrapper wrapper = new MutationResultWrapper(insertRes.getData());
System.out.println(wrapper.getInsertCount());
```

</TabItem>
</Tabs>

## イテレータを使用したデータのエクスポート\{#export-data-using-iterators}

イテレータを使用してデータをエクスポートするには、以下のようにしてください。

1. 検索パラメータと出力フィールドを定義する検索イテレータを初期化します。`batch_size`パラメータを設定することで、反復ごとにエクスポートするエンティティ数を制限できます。

2. ループ内で`next()`メソッドを使用して検索結果をページネーションします。

    - メソッドが空の配列を返した場合、ループは終了します。

    - それ以外の場合、返された結果を任意の方法で保存します。たとえば、返された結果をファイルに追加したり、データベースに保存したり、他のコンシューマープログラムに渡したりできます。

3. すべてのデータが取得されたら、`close()`メソッドを呼び出してイテレータを閉じます。

以下のコードスニペットでは、**QueryIterator** APIを使用してエクスポートされたデータをファイルに追加する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus import connections, Collection

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

collection = Collection("quick_setup")

# 6. イテレータを使用したクエリ

# 空のJSONファイルを初期化
with open('results.json', 'w') as fp:
    fp.write(json.dumps([]))

iterator = collection.query_iterator(
    batch_size=10,
    expr="color_tag like \"brown_8%\"",
    output_fields=["color_tag"]
)

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break

    # 既存のレコードを読み込んで返された結果を追加
    with open('results.json', 'r') as fp:
        results = json.loads(fp.read())
        results += result

    # 結果セットを保存
    with open('results.json', 'w') as fp:
        fp.write(json.dumps(results))
```

</TabItem>

<TabItem value='java'>

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.milvus.param.dml.QueryIteratorParam;
import io.milvus.orm.iterator.QueryIterator;

// 5. イテレータを使用したクエリ

try {
    Files.write(Path.of("results.json"), JSON.toJSONString(new ArrayList<>()).getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
} catch (Exception e) {
    // TODO: 例外を処理
    e.printStackTrace();
}

QueryIteratorParam queryIteratorParam = QueryIteratorParam.newBuilder()
    .withCollectionName("quick_setup")
    .withExpr("color_tag like \"brown_8%\"")
    .withBatchSize(50L)
    .addOutField("vector")
    .addOutField("color_tag")
    .build();

R<QueryIterator> queryIteratRes = client.queryIterator(queryIteratorParam);

if (queryIteratRes.getStatus() != R.Status.Success.getCode()) {
    System.err.println(queryIteratRes.getMessage());
}

QueryIterator queryIterator = queryIteratRes.getData();

while (true) {
    List<QueryResultsWrapper.RowRecord> batchResults = queryIterator.next();
    if (batchResults.isEmpty()) {
        queryIterator.close();
        break;
    }

    String jsonString = "";
    List<JSONObject> jsonObject = new ArrayList<>();
    try {
        jsonString = Files.readString(Path.of("results.json"));
        jsonObject = JSON.parseArray(jsonString).toJavaList(null);
    } catch (IOException e) {
        e.printStackTrace();
    }

    for (QueryResultsWrapper.RowRecord queryResult : batchResults) {
        JSONObject row = new JSONObject();
        row.put("id", queryResult.get("id"));
        row.put("vector", queryResult.get("vector"));
        row.put("color_tag", queryResult.get("color_tag"));
        jsonObject.add(row);
    }

    try {
        Files.write(
            Path.of("results.json"),
            JSON.toJSONString(jsonObject).getBytes(),
            StandardOpenOption.WRITE
        );
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

</TabItem>
</Tabs>
