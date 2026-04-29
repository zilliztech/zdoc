---
title: "アクセスログリファレンス | Cloud"
slug: /access-log-reference
sidebar_key: access-log-reference
sidebar_label: "アクセスログリファレンス"
beta: PUBLIC
notebook: FALSE
description: "アクセスログは JSON Lines 形式で配信され、1 行に 1 つの JSON オブジェクトが含まれます。各行は単一の操作を表す独立した JSON オブジェクトです。以下の例は、Search 操作のログエントリを示しています | Cloud"
type: origin
token: TeLbw6guCimFLgkQWdmcZB2unMd
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - アクセス
  - ログ
  - リファレンス

---

import Admonition from '@theme/Admonition';


# アクセスログリファレンス

アクセスログは [JSON Lines](https://jsonlines.org/) 形式で配信されます。各行に 1 つの JSON オブジェクトが含まれ、各操作を表す独立した JSON オブジェクトとなっています。以下の例は、Search 操作のログエントリを示しています：

```json
{
    "action": "Search",
    "cluster_id": "in01-2b8d91fc3a3b93b",
    "database": "default",
    "date": "2026/04/14 06:31:16.827 +00:00",
    "interface": "Restful",
    "log_type": "ACCESS",
    "params": {
        "collection": "ccc1",
        "consistency_level": 2,
        "execution_time": "15.368706ms",
        "expr": "",
        "input_params": {
            "anns_field": "",
            "offset": "0",
            "params": "{}",
            "round_decimal": "-1",
            "topk": "10"
        },
        "nq": 1,
        "output_fields": ["*"],
        "partition": null,
        "result_num": 10,
        "result_pks": [55, 19, 18, 10, -26, 115, -14, -96, -50, 9],
        "result_scores": [0.87269604, 0.8639183, 0.8605273, 0.85245466, 0.8490447, 0.84537137, 0.84066796, 0.8314183, 0.8296911, 0.82586515],
        "topk": 10
    },
    "result": 0,
    "status": "Success",
    "timestamp": 1776148276827,
    "trace_id": "f89903d701329910380442aa86941be9",
    "user": "key-ibchakktguxxrvvxseoasz"
}
```

実際には、`.log` ファイル内の各エントリは 1 行を占めます。以下のセクションでは、各フィールドについて詳しく説明します。

## Log field schema\{#log-field-schema}

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Required</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>操作名。<a href="./access-log-reference#supported-actions">Supported actions</a> を参照してください。</p></td>
     <td><p><code>"Search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>クラスターの一意の識別子。</p></td>
     <td><p><code>"in01-2b8d91fc3a3b93b"</code></p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>操作が発生したデータベース。</p></td>
     <td><p><code>"default"</code></p></td>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>タイムゾーンを含む人間が読みやすいタイムスタンプ。</p></td>
     <td><p><code>"2026/04/14 06:31:16.827 +00:00"</code></p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>インターフェースタイプ：<code>Restful</code> または <code>Grpc</code>。</p></td>
     <td><p><code>"Restful"</code></p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>ログカテゴリ：<code>ACCESS</code>、<code>AUDIT</code>、または <code>SLOW</code>。</p></td>
     <td><p><code>"ACCESS"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Yes</p></td>
     <td><p>object</p></td>
     <td><p>アクション固有のパラメータ。ネストされたフィールドについては<a href="./access-log-reference#params-fields">以下</a>を参照してください。</p></td>
     <td><p><code>--</code></p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Yes</p></td>
     <td><p>int</p></td>
     <td><p>操作の結果コード。<code>0</code> は成功を示し、0 以外の値はエラーを示します。</p></td>
     <td><p><code>0</code></p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>操作の人間が読みやすいステータス。</p></td>
     <td><p><code>"Success"</code></p></td>
   </tr>
   <tr>
     <td><p><code>timestamp</code></p></td>
     <td><p>Yes</p></td>
     <td><p>int</p></td>
     <td><p>プロキシがリクエストを受信した時点の Unix タイムスタンプ（ミリ秒単位、13 桁）。</p></td>
     <td><p><code>1776148276827</code></p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>操作の一意の ID。同じリクエストに属する複数のログエントリを関連付けるために使用します。</p></td>
     <td><p><code>"f89903d701329910380442aa86941be9"</code></p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>Yes</p></td>
     <td><p>string</p></td>
     <td><p>リクエストを発行したユーザーまたは API キー。</p></td>
     <td><p><code>"key-ibchakktguxxrvvxseoasz"</code></p></td>
   </tr>
</table>

### params fields\{#params-fields}

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Required</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p><code>params.collection</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>対象コレクション。Search、HybridSearch、および Query アクションで必須です。</p></td>
     <td><p><code>"ccc1"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.consistency_level</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>操作に使用された整合性レベル。</p></td>
     <td><p><code>2</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.execution_time</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>サーバー側の実行時間。プロキシがペイロード全体を受信してからレスポンスの送信を開始するまでを計測します。ネットワーク転送時間は含まれません。</p></td>
     <td><p><code>"15.368706ms"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.expr</code></p></td>
     <td><p>No</p></td>
     <td><p>string or array</p></td>
     <td><p>リクエストと共に渡されたフィルタ式。HybridSearch の場合、これは式の配列（サブリクエストごとに 1 つ）です。</p></td>
     <td><p><code>"" or [""]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.input_params</code></p></td>
     <td><p>No</p></td>
     <td><p>object</p></td>
     <td><p>操作の入力パラメータ（検索パラメータ、オフセット、topk など）。HybridSearch の場合、<code>sub_0.&ast;</code> プレフィックス付きのサブリクエストパラメータと <code>strategy</code> が含まれます。</p></td>
     <td><p><code>\{"topk": "10", "offset": "0"\}</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.limit</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>返される結果数の上限。Query および HybridSearch アクションで表示されます。</p></td>
     <td><p><code>100</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.nq</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>クエリベクトルの数。Search アクションで表示されます。</p></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.output_fields</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p>クエリで要求された出力フィールド。</p></td>
     <td><p><code>["&ast;"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.partition</code></p></td>
     <td><p>No</p></td>
     <td><p>string</p></td>
     <td><p>指定されている場合の対象パーティション。パーティションが指定されていない場合は <code>null</code> です。</p></td>
     <td><p><code>null</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_num</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>操作によって実際に返された結果の数。</p></td>
     <td><p><code>10</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_pks</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p>クエリ結果内の主キー。出力パラメータがそれを含むように構成されている場合、Search、HybridSearch、および Query アクションで表示されます。</p></td>
     <td><p><code>[55, 19, 18, 10]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.result_scores</code></p></td>
     <td><p>No</p></td>
     <td><p>array</p></td>
     <td><p><code>params.result_pks</code> の各エントリに対応する類似度スコア。Search および HybridSearch アクションで表示されます。</p></td>
     <td><p><code>[0.87269604, 0.8639183]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.topk</code></p></td>
     <td><p>No</p></td>
     <td><p>int</p></td>
     <td><p>検索リクエストの topk パラメータ。Search および HybridSearch アクションで表示されます。</p></td>
     <td><p><code>10</code></p></td>
   </tr>
</table>

## Supported actions\{#supported-actions}

このリリースでは、検索系またはクエリ系のアクションのみをログに記録します：

<table>
   <tr>
     <th><p>Action</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>ベクトル類似度検索</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>再ランキング付きマルチベクトル検索</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>スカラーフィルタリングクエリ</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>追加のアクションのサポートは、将来のリリースで予定されています。</p>

</Admonition>

## File path and naming\{#file-path-and-naming}

ログファイルは、オブジェクトストレージバケット内に以下のパス構造で整理されています：

```plaintext
/<Cluster ID>/<Log type>/<Date>/<File name><File name suffix>
```

<table>
   <tr>
     <th><p><strong>コンポーネント</strong></p></th>
     <th><p><strong>形式</strong></p></th>
     <th><p><strong>例</strong></p></th>
   </tr>
   <tr>
     <td><p>クラスター ID</p></td>
     <td><p>クラスターの一意の識別子</p></td>
     <td><p><code>in03-c7be749d5f403ad</code></p></td>
   </tr>
   <tr>
     <td><p>ログタイプ</p></td>
     <td><p>access、audit、または slow</p></td>
     <td><p><code>access</code></p></td>
   </tr>
   <tr>
     <td><p>日付</p></td>
     <td><p>ISO 形式の日付 (YYYY-MM-DD)</p></td>
     <td><p><code>2024-12-20</code></p></td>
   </tr>
   <tr>
     <td><p>ファイル名</p></td>
     <td><p>HH:MM:SS-&lt;UUID&gt;。ここで HH:MM:SS は UTC 時間、&lt;UUID&gt; は一意性を確保するためのランダムな文字列です</p></td>
     <td><p><code>09:16:53-jz5l7D8Q</code></p></td>
   </tr>
   <tr>
     <td><p>ファイル名の拡張子</p></td>
     <td><p>.log</p></td>
     <td><p><code>.log</code></p></td>
   </tr>
</table>

フルパスの例：

```plaintext
/in03-c7be749d5f403ad/access/2024-12-20/09:16:53-jz5l7D8Q.log
```

