---
title: "Cron 式 | BYOC"
slug: /cron-expression
sidebar_key: cron-expression
sidebar_label: "Cron 式"
beta: FALSE
notebook: FALSE
description: "Cron 式は、特定の時刻にスケーリングタスクを実行するためのスケジュールを定義します。| BYOC"
type: origin
token: UwfQwgneji2a7tkPa1rcQ7Rhnwc
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 管理
  - cron 式

---

import Admonition from '@theme/Admonition';


# Cron 式

Cron 式は、スケーリングタスクを特定の時刻に実行するためのスケジュールを定義します。

このガイドでは、**Unix cron** 形式（標準的な **5 フィールド** 構文）を **分単位** の精度で説明します。スケジュールは、**すべてのフィールドが一致** する現在時刻でトリガーされます。Cron スケジュールは、ユーザーが選択したタイムゾーンで評価されます。

## 式の形式とフィールド値\{#expression-format-and-field-values}

Cron 式は、空白文字で区切られた 5 つの日時フィールドで構成されます。 

```bash
* * * * *
│ │ │ │ └── day of week
│ │ │ └──── month
│ │ └────── day of month
│ └──────── hour
└────────── minute
```

<table>
   <tr>
     <th><p><strong>フィールド</strong></p></th>
     <th><p><strong>有効な値の範囲</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p><code>minute</code></p></td>
     <td><p>[0 - 59]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>hour</code></p></td>
     <td><p>[0 - 23]</p></td>
     <td><p>24時間表記です。</p><p>CRON式の<code>hour</code>フィールドに<code>17</code>を指定した場合、そのフィールドは<code>午後5時00分</code>から<code>午後5時59分</code>までの任意の時刻に一致します。</p></td>
   </tr>
   <tr>
     <td><p><code>day of month</code></p></td>
     <td><p>[1 - 31]</p></td>
     <td><p>すべての月が31日あるわけではありません。日数が31日未満の月に<code>31</code>をスケジュールした場合、その月にはスケジュールされたスケーリングタスクは実行されません。</p></td>
   </tr>
   <tr>
     <td><p><code>month</code></p></td>
     <td><p>[1 -12]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>day of week</code></p></td>
     <td><p>[0 - 6]</p></td>
     <td><p><code>0</code>は<code>日曜日</code>、<code>1</code>は<code>月曜日</code>、<code>2</code>は<code>火曜日</code>を表し、以下同様に続きます。</p></td>
   </tr>
</table>

## 特殊文字と演算子\{#special-characters-and-operators}

これらの演算子はほとんどのフィールドで使用できます：

<table>
   <tr>
     <th><p><strong>演算子</strong></p></th>
     <th><p><strong>意味</strong></p></th>
     <th><p><strong>例</strong></p></th>
   </tr>
   <tr>
     <td><p><code>&ast;</code></p></td>
     <td><p>任意の値</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code>は毎分実行されます。</p></td>
   </tr>
   <tr>
     <td><p><code>,</code></p></td>
     <td><p>値のリスト</p></td>
     <td><p><code>0 9,17 &ast; &ast; &ast;</code>は毎日09:00および17:00に実行されます。</p></td>
   </tr>
   <tr>
     <td><p><code>-</code></p></td>
     <td><p>値の範囲</p></td>
     <td><p><code>0 9-17 &ast; &ast; &ast;</code>は09:00から17:00まで毎時実行されます。</p></td>
   </tr>
   <tr>
     <td><p><code>/</code></p></td>
     <td><p>ステップ値（N単位ごと）</p><p>注：範囲とステップを組み合わせることもできます。</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code>は5分ごとに実行されます。</p><p><code>10-50/10 &ast; &ast; &ast; &ast;</code>は毎時10分、20分、30分、40分、50分に実行されます。</p></td>
   </tr>
</table>

## 例\{#examples}

このセクションでは、直接使用できる[シンプルなテンプレート](./cron-expression#simple-templates)をいくつか紹介します。より複雑な演算子の組み合わせが必要な場合は、[こちら](./cron-expression#common-scenarios)の例をご参照ください。

### シンプルなテンプレート\{#simple-templates}

<table>
   <tr>
     <th><p><strong>ユースケース</strong></p></th>
     <th><p><strong>CRON式</strong></p></th>
     <th><p><strong>意味</strong></p></th>
   </tr>
   <tr>
     <td><p>毎分</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>毎分実行</p></td>
   </tr>
   <tr>
     <td><p>5分ごと</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>5分ごとに実行</p></td>
   </tr>
   <tr>
     <td><p>毎時</p></td>
     <td><p><code>0 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>毎時0分に実行</p></td>
   </tr>
   <tr>
     <td><p>毎日09:30</p></td>
     <td><p><code>30 9 &ast; &ast; &ast;</code></p></td>
     <td><p>毎日09:30に実行</p></td>
   </tr>
   <tr>
     <td><p>平日09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 1-5</code></p></td>
     <td><p>月曜～金曜の09:00に実行</p></td>
   </tr>
   <tr>
     <td><p>毎月1日09:00</p></td>
     <td><p><code>0 9 1 &ast; &ast;</code></p></td>
     <td><p>毎月1日の09:00に実行</p></td>
   </tr>
   <tr>
     <td><p>毎週日曜日09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 0</code></p></td>
     <td><p>毎週日曜日の09:00に実行</p></td>
   </tr>
   <tr>
     <td><p>1日2回</p></td>
     <td><p><code>0 9,21 &ast; &ast; &ast;</code></p></td>
     <td><p>毎日09:00および21:00に実行</p></td>
   </tr>
</table>

### 一般的なシナリオ\{#common-scenarios}

以下の例では、典型的なワークロードパターンに基づいて、スケジュールされたスケーリングタスク用のUnix cron式の書き方を示します。

**例1: 平日のピーク時間帯にスケールアップし、オフピーク時間帯にスケールダウンする**

これを行うには、ピーク時間帯用とオフピーク時間帯用の2つのスケジュールを作成します。

- **ピーク時間帯:** `* 9-18 * * 1-5`  
  月曜日から金曜日の09:00から18:59まで毎分実行されます。

- **オフピーク時間帯:** `* 0-8,19-23 * * 1-5`  
  月曜日から金曜日の00:00から08:59および19:00から23:59まで毎分実行されます。

**例2: 週末の低コストモード + 月曜日の復元**

これを行うには、週末用と月曜日の復元用の2つのスケジュールを作成します。

- **週末:** `* * * * 0,6`  
  土曜日と日曜日の毎分実行されます。

- **月曜日の復元:** `0 9 * * 1`  
  毎週月曜日の09:00に実行されます。

